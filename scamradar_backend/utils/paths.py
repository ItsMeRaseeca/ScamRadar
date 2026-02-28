from __future__ import annotations

from pathlib import Path


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = PACKAGE_ROOT.parent

DATA_DIR = PACKAGE_ROOT / "data"
MODELS_DIR = PACKAGE_ROOT / "models"

DATASET_PATH = DATA_DIR / "fake_job_postings.csv"

MODEL_PATH = MODELS_DIR / "model.pkl"
VECTORIZER_PATH = MODELS_DIR / "vectorizer.pkl"
THRESHOLD_PATH = MODELS_DIR / "threshold.json"
FAKE_INDICATORS_PATH = MODELS_DIR / "fake_indicators.json"






