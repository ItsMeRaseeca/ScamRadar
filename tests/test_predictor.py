import pytest
from scamradar_backend.api.app import compute_final_risk, get_risk_label
from scamradar_backend.api.predictor import ScamRadarPredictor


class TestArbitrationAndPredictor:
    """Tests for risk arbitration logic, thresholding, and prediction outputs."""

    def test_compute_final_risk_weighted_combination(self):
        # Weights: ML (0.5), Rule (0.2), Gemini (0.3)
        # ml_prob=0.4, rule_score=0.5, gemini_level="LOW" (0.2)
        # 0.4 * 0.5 + 0.5 * 0.2 + 0.2 * 0.3 = 0.2 + 0.1 + 0.06 = 0.36
        score = compute_final_risk(ml_prob=0.4, rule_score=0.5, gemini_level="LOW")
        assert pytest.approx(score, rel=1e-3) == 0.36

    def test_compute_final_risk_fallback_when_gemini_none(self):
        # When Gemini is None, defaults to MODERATE (0.5)
        # 0.8 * 0.5 + 0.5 * 0.2 + 0.5 * 0.3 = 0.4 + 0.1 + 0.15 = 0.65
        score = compute_final_risk(ml_prob=0.8, rule_score=0.5, gemini_level=None)
        assert pytest.approx(score, rel=1e-3) == 0.65

    def test_gemini_critical_safety_override(self):
        # Even if ML and Rules give low scores:
        # ml_prob=0.1, rule_score=0.0, gemini_level="CRITICAL" (0.9)
        # (0.1 * 0.5) + (0.0 * 0.2) + (0.9 * 0.3) = 0.05 + 0.27 = 0.32
        # Since Gemini is "CRITICAL", safety rule mandates score boost to at least 0.70
        score = compute_final_risk(ml_prob=0.1, rule_score=0.0, gemini_level="CRITICAL")
        assert score >= 0.70

    def test_compute_final_risk_boundary_clamping(self):
        score_high = compute_final_risk(ml_prob=1.0, rule_score=1.0, gemini_level="CRITICAL")
        assert 0.0 <= score_high <= 1.0

        score_low = compute_final_risk(ml_prob=0.0, rule_score=0.0, gemini_level="LOW")
        assert 0.0 <= score_low <= 1.0

    @pytest.mark.parametrize(
        "score,expected_label",
        [
            (0.0, "LOW_RISK"),
            (0.25, "LOW_RISK"),
            (0.30, "LOW_RISK"),
            (0.31, "MODERATE_RISK"),
            (0.55, "MODERATE_RISK"),
            (0.60, "MODERATE_RISK"),
            (0.61, "HIGH_RISK"),
            (0.79, "HIGH_RISK"),
            (0.80, "HIGH_RISK"),
            (0.81, "CRITICAL_RISK"),
            (1.0, "CRITICAL_RISK"),
        ],
    )
    def test_get_risk_label_threshold_boundaries(self, score: float, expected_label: str):
        assert get_risk_label(score) == expected_label

    def test_predictor_inference_with_loaded_model(self, predictor: ScamRadarPredictor):
        result = predictor.predict(
            title="Senior Python Backend Engineer",
            description="We are looking for an experienced backend developer with proficiency in FastAPI, PostgreSQL, and AWS.",
            requirements="5+ years experience building microservices. Experience with unit testing and CI/CD pipelines.",
            company_profile="FinTech Solutions Inc. is an enterprise banking tech partner founded in 2015.",
            salary_range="$140,000 - $160,000 per year",
            employment_type="Full-time",
        )
        assert hasattr(result, "final_label")
        assert hasattr(result, "score")
        assert hasattr(result, "rule_score")
        assert hasattr(result, "reasoning")
        assert hasattr(result, "threshold")
        assert isinstance(result.score, float)
        assert 0.0 <= result.score <= 1.0
        assert isinstance(result.reasoning, list)

