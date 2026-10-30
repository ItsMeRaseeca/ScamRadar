"""
Gemini AI client for deep analysis of fake job postings.
Requires GOOGLE_API_KEY environment variable.
Updated to use the modern google-genai SDK and Gemini 2.0.
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

    Protections:
    - In-memory caching keyed by `cache_key` (same posting => no extra calls)
    - Local rate limiting to avoid burning free-tier quota
    - Quota exhaustion detection with temporary cooldown
    - Logging of prompt size and quota errors
    """
    if not GEMINI_AVAILABLE:
        logger.warning("Gemini library (google-genai) not available")
        return None

    api_key = _get_api_key()
    if not api_key:
        logger.warning("Neither GOOGLE_API_KEY nor GEMINI_API_KEY is set in environment.")
        return None

    if cache_key and cache_key in _ANALYSIS_CACHE:
        logger.info("Gemini cache hit for key=%s", cache_key[:12])
        return _ANALYSIS_CACHE[cache_key]

    if not _can_call_gemini():
        return None

    try:
        # Initialize the new SDK client
        client = genai.Client(api_key=api_key)

        # Build comprehensive prompt
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

        # Log prompt size and approximate tokens if available
        prompt_chars = len(prompt)
        approx_tokens = None
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

        try:
            token_count = client.models.count_tokens(
                model=model_name, contents=prompt
            )
            approx_tokens = getattr(token_count, "total_tokens", None)
        except Exception:
            approx_tokens = None  # best-effort only

        logger.info(
            "Calling Gemini (model=%s, chars=%d, tokens≈%s, cache_key=%s)",
            model_name,
            prompt_chars,
            str(approx_tokens) if approx_tokens is not None else "n/a",
            cache_key[:12] if cache_key else "none",
        )

        # Call Gemini
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

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
                logger.warning(f"Gemini response missing key: {key}")
                if key == "risk_level":
                    analysis_dict[key] = "MODERATE"
                elif key == "confidence":
                    analysis_dict[key] = 0.5
                else:
                    analysis_dict[key] = "Analysis unavailable."

        if cache_key:
            _ANALYSIS_CACHE[cache_key] = analysis_dict

        return analysis_dict

    except Exception as e:
        # Detect quota / rate errors explicitly
        msg = str(e)
        if "RESOURCE_EXHAUSTED" in msg or "Quota exceeded" in msg or "429" in msg:
            global _QUOTA_EXHAUSTED_UNTIL
            _QUOTA_EXHAUSTED_UNTIL = time.time() + 60  # 1-minute cooldown
            logger.warning(
                "Gemini quota exhausted or rate-limited. "
                "Applying cooldown before next attempt. Raw error: %s",
                msg,
            )
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
