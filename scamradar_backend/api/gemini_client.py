"""
Gemini AI client for deep analysis of fake job postings.
Requires GOOGLE_API_KEY environment variable.
Updated to use the modern google-genai SDK with dynamic model discovery.
"""

from __future__ import annotations

import json
import logging
import os
import time
from collections import deque
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from scamradar_backend.api.schemas import AIAnalysis

logger = logging.getLogger(__name__)

# Try newer SDK first
try:
    from google import genai

    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning(
        "google-genai not installed. Install with: pip install google-genai"
    )


def _get_api_key() -> str | None:
    """Get Gemini API key from environment."""
    return os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")


# --- Simple in-memory rate limiting & caching -------------------------------

_RATE_WINDOW_SECONDS = 60
_RATE_MAX_CALLS = 10  # local safeguard before hitting remote free-tier limits
_CALL_TIMESTAMPS: deque[float] = deque()

_QUOTA_EXHAUSTED_UNTIL: float | None = None
_ANALYSIS_CACHE: dict[str, dict[str, str]] = {}
_LAST_GEMINI_ERROR: str | None = None
_CACHED_MODELS: list[str] = []


def get_last_gemini_error() -> str | None:
    return _LAST_GEMINI_ERROR


def _can_call_gemini() -> bool:
    """Return False if we should skip calling Gemini due to local/quota limits."""
    global _QUOTA_EXHAUSTED_UNTIL

    now = time.time()
    if _QUOTA_EXHAUSTED_UNTIL is not None and now < _QUOTA_EXHAUSTED_UNTIL:
        logger.warning(
            "Skipping Gemini call because quota was recently exhausted "
            "(cooldown until %.0f, now=%.0f).",
            _QUOTA_EXHAUSTED_UNTIL,
            now,
        )
        return False

    # Sliding window for local rate limiting
    while _CALL_TIMESTAMPS and now - _CALL_TIMESTAMPS[0] > _RATE_WINDOW_SECONDS:
        _CALL_TIMESTAMPS.popleft()

    if len(_CALL_TIMESTAMPS) >= _RATE_MAX_CALLS:
        logger.warning(
            "Local Gemini rate limit reached: %d calls in the last %d seconds. "
            "Skipping this call.",
            len(_CALL_TIMESTAMPS),
            _RATE_WINDOW_SECONDS,
        )
        return False

    _CALL_TIMESTAMPS.append(now)
    return True


def _get_model_candidates(client: genai.Client) -> list[str]:
    """Dynamically discover valid models for the API key, or fall back to defaults."""
    global _CACHED_MODELS
    if _CACHED_MODELS:
        return _CACHED_MODELS

    env_model = os.getenv("GEMINI_MODEL")
    discovered: list[str] = []

    try:
        # Dynamically query available models for this specific API key
        for m in client.models.list():
            actions = getattr(m, "supported_actions", []) or []
            if "generateContent" in actions or "generate_content" in actions:
                m_name = m.name.replace("models/", "") if m.name else ""
                if m_name:
                    discovered.append(m_name)
        logger.info("Discovered %d models supporting generateContent: %s", len(discovered), discovered[:5])
    except Exception as e_list:
        logger.warning("Could not dynamically list models: %s", e_list)

    # Sort discovered models: prioritize flash models, then others
    flash_models = [m for m in discovered if "flash" in m.lower()]
    other_models = [m for m in discovered if "flash" not in m.lower()]
    ordered_discovered = flash_models + other_models

    defaults = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]

    all_candidates = []
    if env_model:
        all_candidates.append(env_model)
    all_candidates.extend(ordered_discovered)
    all_candidates.extend(defaults)

    # Deduplicate while preserving order
    seen = set()
    _CACHED_MODELS = [m for m in all_candidates if m and not (m in seen or seen.add(m))]
    return _CACHED_MODELS


def analyze_job_with_gemini(
    title: str,
    description: str,
    requirements: str,
    company_profile: str,
    salary_range: str,
    employment_type: str,
    *,
    cache_key: str | None = None,
) -> dict[str, str] | None:
    """
    Use Gemini AI to perform deep analysis of a job posting.
    """
    global _LAST_GEMINI_ERROR

    if not GEMINI_AVAILABLE:
        _LAST_GEMINI_ERROR = "google-genai SDK not installed."
        logger.warning(_LAST_GEMINI_ERROR)
        return None

    api_key = _get_api_key()
    if not api_key:
        _LAST_GEMINI_ERROR = "Neither GOOGLE_API_KEY nor GEMINI_API_KEY is set in environment."
        logger.warning(_LAST_GEMINI_ERROR)
        return None

    if cache_key and cache_key in _ANALYSIS_CACHE:
        logger.info("Gemini cache hit for key=%s", cache_key[:12])
        return _ANALYSIS_CACHE[cache_key]

    if not _can_call_gemini():
        _LAST_GEMINI_ERROR = "Rate limit or quota cooldown active."
        return None

    try:
        # Initialize client
        client = genai.Client(api_key=api_key)

        # Build prompt
        job_text = (
            f"Job Title: {title}\n"
            f"Description: {description}\n"
            f"Requirements: {requirements}\n"
            f"Company Profile: {company_profile}\n"
            f"Salary Range: {salary_range}\n"
            f"Employment Type: {employment_type}\n"
        )

        prompt = f"""You are a senior employment fraud analyst. Analyze this job posting for fraud signals.
Provide a final risk assessment of LOW, MODERATE, HIGH, or CRITICAL.

Respond ONLY with valid JSON in this format:
{{
  "risk_level": "LOW | MODERATE | HIGH | CRITICAL",
  "confidence": 0.0-1.0,
  "manipulation_signals": "Describe any manipulation or pressure tactics used.",
  "tone_analysis": "Analyze the tone and language patterns.",
  "company_risk_analysis": "Assess company credibility based on the text.",
  "overall_summary": "Provide a concise summary of results.",
  "safety_advice": "Practical advice for the seeker."
}}

Job Posting:
{job_text}
"""

        candidates = _get_model_candidates(client)
        response = None
        last_err = None

        for cand in candidates:
            try:
                logger.info("Attempting Gemini generation with model: %s", cand)
                response = client.models.generate_content(
                    model=cand,
                    contents=prompt,
                )
                logger.info("Successfully received Gemini response using model: %s", cand)
                # Pin this successful model to the front of candidate list for future calls
                _CACHED_MODELS = [cand] + [m for m in candidates if m != cand]
                break
            except Exception as e_cand:
                last_err = e_cand
                logger.warning("Model %s failed: %s. Trying next candidate...", cand, e_cand)

        if response is None:
            if last_err:
                raise last_err
            return None

        response_text = response.text.strip()

        # Clean JSON markdown if present
        if "```json" in response_text:
            response_text = response_text.split("```json", 1)[1].split("```", 1)[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```", 1)[1].split("```", 1)[0].strip()

        analysis_dict = json.loads(response_text)

        # Validate required keys
        required_keys = [
            "risk_level",
            "confidence",
            "manipulation_signals",
            "tone_analysis",
            "company_risk_analysis",
            "overall_summary",
            "safety_advice",
        ]
        for key in required_keys:
            if key not in analysis_dict:
                if key == "risk_level":
                    analysis_dict[key] = "MODERATE"
                elif key == "confidence":
                    analysis_dict[key] = 0.5
                else:
                    analysis_dict[key] = "Analysis unavailable."

        if cache_key:
            _ANALYSIS_CACHE[cache_key] = analysis_dict

        _LAST_GEMINI_ERROR = None
        return analysis_dict

    except Exception as e:
        msg = str(e)
        _LAST_GEMINI_ERROR = msg
        if "RESOURCE_EXHAUSTED" in msg or "Quota exceeded" in msg or "429" in msg:
            global _QUOTA_EXHAUSTED_UNTIL
            _QUOTA_EXHAUSTED_UNTIL = time.time() + 60
            logger.warning("Gemini quota exhausted or rate-limited: %s", msg)
        else:
            logger.exception("Gemini analysis failed: %s", msg)
        return None


def create_ai_analysis_object(
    analysis_dict: dict[str, str] | None,
) -> dict[str, str] | None:
    if analysis_dict is None:
        return None

    return {
        "risk_level": analysis_dict.get("risk_level", "MODERATE"),
        "confidence": float(analysis_dict.get("confidence", 0.5)),
        "manipulation_signals": analysis_dict.get(
            "manipulation_signals", "Analysis unavailable."
        ),
        "tone_analysis": analysis_dict.get("tone_analysis", "Analysis unavailable."),
        "company_risk_analysis": analysis_dict.get(
            "company_risk_analysis", "Analysis unavailable."
        ),
        "overall_summary": analysis_dict.get("overall_summary", "Analysis unavailable."),
        "safety_advice": analysis_dict.get("safety_advice", "Analysis unavailable."),
    }
