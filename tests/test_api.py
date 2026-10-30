from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient


class TestApiEndpoints:
    """Integration tests for ScamRadar FastAPI endpoints."""

    def test_health_check(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True

    def test_predict_endpoint_success(self, client: TestClient):
        payload = {
            "title": "Software Developer",
            "description": "Develop full-stack web applications in TypeScript and Python.",
            "requirements": "Experience with Git, REST APIs, and automated testing.",
            "company_profile": "TechCorp is an established software consultancy.",
            "salary_range": "$90,000 - $110,000",
            "employment_type": "Full-time",
        }
        response = client.post("/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "final_label" in data
        assert "reasoning" in data
        assert "ml_probability" in data
        assert isinstance(data["ml_probability"], float)
        assert 0.0 <= data["ml_probability"] <= 1.0

    def test_deep_analysis_with_gemini_success(
        self, client: TestClient, sample_gemini_analysis: dict
    ):
        """Verify deep analysis when Gemini returns an active investigation."""
        payload = {
            "title": "Urgent Work From Home Assistant",
            "description": "Start immediately. Send resume to hr@gmail.com and earn fast cash.",
            "requirements": "No prior experience required.",
            "company_profile": "",
            "salary_range": "$6,000 per week",
            "employment_type": "Remote",
            "deep_review": True,
        }

        with patch(
            "scamradar_backend.api.app.analyze_job_with_gemini",
            return_value=sample_gemini_analysis,
        ):
            response = client.post("/deep-analysis", json=payload)

        assert response.status_code == 200
        data = response.json()

        assert data["gemini_risk_level"] == "HIGH"
        assert data["ai_analysis"] is not None
        assert data["ai_analysis"]["risk_level"] == "HIGH"
        assert "manipulation_signals" in data["ai_analysis"]
        assert "safety_advice" in data["ai_analysis"]
        assert 0.0 <= data["final_risk_score"] <= 1.0

    def test_deep_analysis_graceful_fallback_when_gemini_fails_or_rate_limited(
        self, client: TestClient
    ):
        """
        Verify graceful degradation: When Gemini is rate-limited, unreachable,
        or quota-exhausted (returns None), the system falls back to ML + Rule arbitration
        without crashing (returns HTTP 200 with ai_analysis=None).
        """
        payload = {
            "title": "Customer Support Representative",
            "description": "Handle incoming client inquiries via chat and email.",
            "requirements": "Strong written communication skills.",
            "company_profile": "Global Support Services Inc.",
            "salary_range": "$40,000 per year",
            "employment_type": "Full-time",
            "deep_review": True,
        }

        # Simulate Gemini failure/rate-limit returning None
        with patch(
            "scamradar_backend.api.app.analyze_job_with_gemini",
            return_value=None,
        ):
            response = client.post("/deep-analysis", json=payload)

        assert response.status_code == 200
        data = response.json()

        # ai_analysis should be null, but ml_probability and final_risk_score must still exist
        assert data["ai_analysis"] is None
        assert data["gemini_risk_level"] is None
        assert "ml_probability" in data
        assert "rule_score" in data
        assert "final_risk_score" in data
        assert "final_label" in data
        assert 0.0 <= data["final_risk_score"] <= 1.0

    def test_deep_analysis_gemini_critical_override(
        self, client: TestClient, sample_gemini_analysis: dict
    ):
        """
        Safety Rule Test: If Gemini detects CRITICAL manipulation,
        the final score must be boosted to at least 0.70.
        """
        critical_analysis = sample_gemini_analysis.copy()
        critical_analysis["risk_level"] = "CRITICAL"

        payload = {
            "title": "Entry Level Administrative Role",
            "description": "Standard office work with flexible hours.",
            "requirements": "Reliable communication.",
            "company_profile": "Established Office Solutions.",
            "salary_range": "$50,000 per year",
            "employment_type": "Full-time",
            "deep_review": True,
        }

        with patch(
            "scamradar_backend.api.app.analyze_job_with_gemini",
            return_value=critical_analysis,
        ):
            response = client.post("/deep-analysis", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert data["gemini_risk_level"] == "CRITICAL"
        assert data["final_risk_score"] >= 0.70

