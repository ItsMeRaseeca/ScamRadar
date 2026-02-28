from __future__ import annotations

import re
from dataclasses import dataclass


_URGENCY_PATTERNS = [
    r"\burgent\b",
    r"\bimmediate\b",
    r"\bapply now\b",
    r"\blimited time\b",
    r"\bact now\b",
    r"\bearn (money )?fast\b",
    r"\bearn quickly\b",
    r"\bstart today\b",
]

_EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@([A-Z0-9.-]+\.[A-Z]{2,})\b", re.IGNORECASE)
_GENERIC_EMAIL_DOMAINS = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "aol.com", "proton.me", "protonmail.com"}

_EXCLAMATION_RE = re.compile(r"!{3,}")

# Salary heuristics: detect unusually high weekly/monthly amounts without context.
_MONEY_RE = re.compile(r"(\$|usd|eur|gbp|₹|inr)\s*([0-9]{2,}(?:[,][0-9]{3})*|[0-9]+)", re.IGNORECASE)
_HIGH_SALARY_HINTS = re.compile(r"\b(per week|weekly|per day|daily)\b", re.IGNORECASE)

_COMPANY_SECTION_KEYWORDS = [
    "about the company",
    "about us",
    "about the organisation",
    "about the organization",
    "founded",
    "our mission",
    "website",
    "who we are",
    "our story",
]


@dataclass(frozen=True)
class RuleReasons:
    reasons: list[str]
    score: float


def has_urgency_language(text: str) -> bool:
    """Return True if any urgency phrase is detected in the text."""
    joined_lower = (text or "").lower()
    for pat in _URGENCY_PATTERNS:
        if re.search(pat, joined_lower):
            return True
    return False


def rule_based_red_flags(
    *,
    title: str,
    description: str,
    requirements: str,
    company_profile: str,
    salary_range: str | None = None,
) -> RuleReasons:
    reasons: list[str] = []
    score = 0.0

    joined = " ".join([title or "", description or "", requirements or "", company_profile or ""]).strip()
    joined_lower = joined.lower()

    # Urgency language
    if has_urgency_language(joined):
        reasons.append("Uses urgency language (e.g., 'apply now', 'urgent').")
        score += 0.2

    # Generic email providers
    emails = _EMAIL_RE.findall(joined)
    if emails:
        domains = {d.lower() for d in emails}
        if any(d in _GENERIC_EMAIL_DOMAINS for d in domains):
            reasons.append("Contains a generic email provider address (e.g., gmail/yahoo/outlook).")
            score += 0.3

    # Excessive exclamation marks
    if _EXCLAMATION_RE.search(joined):
        reasons.append("Uses excessive exclamation marks (overly promotional).")
        score += 0.1

    # Company profile presence:
    # - If structured company_profile is provided, treat as present.
    # - Otherwise, look for company section keywords in the pasted text (Quick Scan mode).
    company_profile_text = (company_profile or "").strip()
    has_structured_company_profile = bool(company_profile_text)
    has_company_keywords = any(kw in joined_lower for kw in _COMPANY_SECTION_KEYWORDS)
    if not has_structured_company_profile and not has_company_keywords:
        reasons.append("Missing company profile.")
        score += 0.2

    # Too-short description
    desc = (description or "").strip()
    if len(desc) > 0 and len(desc) < 120:
        reasons.append("Job description is unusually short.")
        score += 0.1

    # Salary oddities (very simple heuristic; avoids probabilities)
    sal = (salary_range or "").strip()
    if sal:
        m = _MONEY_RE.search(sal)
        if m:
            raw = m.group(2).replace(",", "")
            try:
                amount = int(raw)
                if amount >= 5000 and _HIGH_SALARY_HINTS.search(sal):
                    reasons.append("Salary claims look unusually high for the stated period.")
                    score += 0.3
            except ValueError:
                pass

    return RuleReasons(reasons=reasons, score=min(score, 1.0))



