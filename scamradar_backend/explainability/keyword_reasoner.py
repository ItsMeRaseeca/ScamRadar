from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class KeywordReasons:
    reasons: list[str]
    tokens: list[str]  # filtered tokens actually used for reasoning


CORPORATE_NEUTRAL = {
    "leveraging",
    "achieve",
    "opportunity",
    "growth",
    "business",
    "development",
    "team",
    "experience",
    "management",
    "role",
    "marketing",
    "sales",
    "position",
    "industry",
    "engagement",
    "client",
}

_GENERIC_ACTION_VERBS = {
    "manage",
    "managed",
    "managing",
    "lead",
    "leading",
    "led",
    "support",
    "supported",
    "develop",
    "developed",
    "coordinate",
    "coordinated",
    "drive",
    "driving",
    "deliver",
    "delivering",
}

SCAM_SIGNAL = [
    "earn quickly",
    "weekly payment",
    "guaranteed income",
    "no experience required",
    "immediate hiring",
    "apply now",
    "work from home high pay",
    "limited time offer",
    "registration fee",
    "processing fee",
    "investment required",
    "whatsapp only",
]

_SALARY_ANOMALY_PHRASES = [
    "per week",
    "per day",
    "daily income",
    "instant payout",
]


def _normalize(token: str) -> str:
    return token.strip().lower()


def _is_meaningful_token(token: str) -> bool:
    """Filter out short, numeric-only, and neutral/common tokens."""
    t = _normalize(token)
    if not t:
        return False
    if len(t) <= 3:
        return False
    # Remove numeric-only tokens
    if t.replace(" ", "").isdigit():
        return False
    if t in CORPORATE_NEUTRAL:
        return False
    if t in _GENERIC_ACTION_VERBS:
        return False
    return True


def _filter_candidate_tokens(fake_indicators: Iterable[str]) -> list[str]:
    """Apply advanced filtering on LR fake indicators."""
    return [t for t in (_normalize(tok) for tok in fake_indicators) if _is_meaningful_token(t)]


def _token_has_scam_semantics(token: str) -> bool:
    """Only keep tokens that overlap with known scam / salary anomaly phrases."""
    t = _normalize(token)
    if not t:
        return False

    for phrase in SCAM_SIGNAL:
        p = _normalize(phrase)
        if t in p or p in t:
            return True

    for phrase in _SALARY_ANOMALY_PHRASES:
        p = _normalize(phrase)
        if p in t:
            return True

    return False


def ml_keyword_reasons(clean_text: str, fake_indicators: list[str], max_terms: int = 5) -> KeywordReasons:
    """
    Build human-readable reasons based on which high-weight fake indicator terms appear.
    `fake_indicators` should be the precomputed top-weighted LR features for class=FAKE.

    Applies additional filtering to avoid weak/non-informative tokens.
    """
    reasons: list[str] = []
    used_tokens: list[str] = []
    if not clean_text.strip() or not fake_indicators:
        return KeywordReasons(reasons=reasons, tokens=used_tokens)

    # Step 1: filter LR indicators
    filtered = _filter_candidate_tokens(fake_indicators)
    if not filtered:
        return KeywordReasons(reasons=reasons, tokens=used_tokens)

    # Step 2: retain only tokens with semantic scam signals
    semantically_suspicious = [t for t in filtered if _token_has_scam_semantics(t)]
    if not semantically_suspicious:
        # Nothing meaningfully scam-like; do not add ML keyword reasoning.
        return KeywordReasons(reasons=reasons, tokens=used_tokens)

    # Since indicator terms can be unigrams/bigrams, use substring match on preprocessed text.
    hits: list[str] = []
    for term in semantically_suspicious:
        if term in clean_text:
            hits.append(term)
        if len(hits) >= max_terms:
            break

    if hits:
        used_tokens = hits.copy()
        reasons.append(
            "Statistical pattern analysis detected historically correlated risk signals: "
            + ", ".join(hits)
        )

    return KeywordReasons(reasons=reasons, tokens=used_tokens)



