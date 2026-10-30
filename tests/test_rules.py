import pytest
from scamradar_backend.explainability.rules import (
    has_urgency_language,
    rule_based_red_flags,
    RuleReasons,
)


class TestRuleEngine:
    """Unit tests for deterministic red-flag heuristics."""

    @pytest.mark.parametrize(
        "phrase,expected",
        [
            ("Urgent requirement for remote typist", True),
            ("Immediate start needed, apply today", True),
            ("Click here and apply now", True),
            ("Limited time opportunity to earn fast", True),
            ("You can start today with zero experience", True),
            ("Software Engineer with 3+ years experience in Python and AWS", False),
            ("We are looking for a collaborative product designer", False),
        ],
    )
    def test_has_urgency_language(self, phrase: str, expected: bool):
        assert has_urgency_language(phrase) == expected

    def test_detects_generic_email_domains(self):
        result = rule_based_red_flags(
            title="Data Entry Assistant",
            description="Send your resume to recruit.team@gmail.com to get started.",
            requirements="Basic computer knowledge",
            company_profile="Legit Corp is a modern tech agency.",
        )
        assert any("generic email provider" in r.lower() for r in result.reasons)
        assert result.score >= 0.3

    def test_ignores_corporate_domain_emails(self):
        result = rule_based_red_flags(
            title="Backend Engineer",
            description="Please send applications to careers@stripe.com for consideration.",
            requirements="Python, Go, PostgreSQL experience.",
            company_profile="Stripe builds economic infrastructure for the internet.",
        )
        assert not any("generic email provider" in r.lower() for r in result.reasons)

    def test_detects_excessive_exclamation_marks(self):
        result = rule_based_red_flags(
            title="Make Money From Home!!!",
            description="Best job ever!!!! Do not miss this chance!!!!!",
            requirements="No experience needed",
            company_profile="Global Opportunities Inc.",
        )
        assert any("excessive exclamation marks" in r.lower() for r in result.reasons)

    def test_missing_company_profile_heuristic(self):
        # When company profile is absent and text has no 'about us'/'founded' markers
        result_missing = rule_based_red_flags(
            title="Remote Assistant",
            description="Perform simple online tasks.",
            requirements="Internet connection",
            company_profile="",
        )
        assert any("missing company profile" in r.lower() for r in result_missing.reasons)

        # When structured company profile is explicitly provided
        result_present = rule_based_red_flags(
            title="Remote Assistant",
            description="Perform simple online tasks.",
            requirements="Internet connection",
            company_profile="Founded in 2018, Acme Corp develops developer tools.",
        )
        assert not any("missing company profile" in r.lower() for r in result_present.reasons)

    def test_unusually_high_salary_heuristics(self):
        # Flags suspicious weekly/daily rate
        result_suspicious = rule_based_red_flags(
            title="Virtual Assistant",
            description="Easy data entry from home.",
            requirements="None",
            company_profile="About Us: We are an international agency.",
            salary_range="$8,000 per week",
        )
        assert any("salary claims look unusually high" in r.lower() for r in result_suspicious.reasons)

        # Normal annual salary should NOT trigger the weekly/daily flag
        result_normal = rule_based_red_flags(
            title="Senior Developer",
            description="Full-time software engineering role.",
            requirements="Python, Docker",
            company_profile="About Us: Enterprise software provider.",
            salary_range="$130,000 - $150,000 per year",
        )
        assert not any("salary claims look unusually high" in r.lower() for r in result_normal.reasons)

    def test_cumulative_score_capping(self):
        # Trigger multiple red flags simultaneously
        result = rule_based_red_flags(
            title="URGENT HIRING NOW!!!",
            description="Start today!! Send details to scammer@yahoo.com and earn fast cash!!",
            requirements="None",
            company_profile="",
            salary_range="$10,000 weekly",
        )
        assert result.score <= 1.0
        assert len(result.reasons) >= 3

