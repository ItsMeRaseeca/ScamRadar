import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scamradar_backend.preprocessing.text_preprocessor import TextPreprocessor
from scamradar_backend.api.predictor import load_artifacts, ScamRadarPredictor
from scamradar_backend.api import app as app_module


@pytest.fixture(scope="session")
def preprocessor() -> TextPreprocessor:
    """Fixture providing initialized TextPreprocessor."""
    return TextPreprocessor()


@pytest.fixture(scope="session")
def loaded_artifacts():
    """Fixture providing loaded model artifacts."""
    return load_artifacts()


@pytest.fixture(scope="session")
def predictor(loaded_artifacts) -> ScamRadarPredictor:
    """Fixture providing initialized ScamRadarPredictor."""
    return ScamRadarPredictor(loaded_artifacts)


@pytest.fixture(scope="session")
def client(loaded_artifacts):
    """
    TestClient fixture with pre-initialized model artifacts.
    """
    app_module._predictor = ScamRadarPredictor(loaded_artifacts)
    with TestClient(app_module.app) as c:
        yield c


@pytest.fixture
def sample_gemini_analysis():
    """Sample mock payload returned by analyze_job_with_gemini."""
    return {
        "risk_level": "HIGH",
        "confidence": 0.88,
        "manipulation_signals": "Uses high-pressure tactics and vague job duties.",
        "tone_analysis": "Overly urgent, informal tone inconsistent with corporate communication.",
        "company_risk_analysis": "Domain not verifiable, no digital footprint found.",
        "overall_summary": "High likelihood of employment scam targeting personal details.",
        "safety_advice": "Do not provide SSN, bank details, or upfront fees.",
    }

