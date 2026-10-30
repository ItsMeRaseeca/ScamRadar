import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from scamradar_backend.api.predictor import ScamRadarPredictor, load_artifacts
from scamradar_backend.api.schemas import (
    PredictRequest,
    PredictResponse,
    DeepAnalysisResponse,
    DeepAnalysisRequest,
    AIAnalysis,
)
from scamradar_backend.api.gemini_client import (
    analyze_job_with_gemini,
    create_ai_analysis_object,
)
from scamradar_backend.utils.logging import configure_logging

logger = logging.getLogger(__name__)

app = FastAPI(title="ScamRadar Backend", version="1.0.0")

# CORS for frontend (Next.js on http://localhost:3000 by default, or comma-separated list of origins)
raw_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_predictor: ScamRadarPredictor | None = None


@app.get("/health")
def health_check() -> dict[str, str | bool]:
    """Health check endpoint for container orchestrators and uptime probes."""
    return {
        "status": "healthy",
        "model_loaded": _predictor is not None,
    }


@app.on_event("startup")
def _startup() -> None:
    configure_logging()
    global _predictor
    artifacts = load_artifacts()
    _predictor = ScamRadarPredictor(artifacts)
    logger.info("ScamRadar artifacts loaded. API ready.")


def compute_final_risk(ml_prob: float, rule_score: float, gemini_level: str | None) -> float:
    """
    Arbitrates risk by combining ML probability, rule-based indicators, and Gemini AI.
    Weights: ML (0.5), Rule (0.2), Gemini (0.3).
    """
    # Convert Gemini level to numeric score (default to MODERATE if unknown)
    gemini_map = {
        "LOW": 0.2,
        "MODERATE": 0.5,
        "HIGH": 0.75,
        "CRITICAL": 0.9,
    }
    gemini_score = gemini_map.get(gemini_level, 0.5) if gemini_level else 0.5

    final_score = (ml_prob * 0.5) + (rule_score * 0.2) + (gemini_score * 0.3)

    # Override Safety Rule: If Gemini returns "CRITICAL", ensure final risk is at least 0.70
    if gemini_level == "CRITICAL" and final_score < 0.70:
        logger.info("Arbitration Override: Gemini CRITICAL trigger. Boosting score to 0.70.")
        final_score = 0.70

    return float(min(max(final_score, 0.0), 1.0))


def get_risk_label(score: float) -> str:
    """Map final score to risk category."""
    if score <= 0.3:
        return "LOW_RISK"
    if score <= 0.6:
        return "MODERATE_RISK"
    if score <= 0.8:
        return "HIGH_RISK"
    return "CRITICAL_RISK"


def run_analysis_pipeline(
    title: str = "",
    description: str = "",
    requirements: str = "",
    company_profile: str = "",
    salary_range: str = "",
    employment_type: str = "",
    deep_review: bool = False,
) -> DeepAnalysisResponse:
    """Core analysis logic reused by all endpoints."""
    if _predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    # Step 1: ML + Rule Engine
    ml_result = _predictor.predict(
        title=title,
        description=description,
        requirements=requirements,
        company_profile=company_profile,
        salary_range=salary_range,
        employment_type=employment_type,
    )

    ml_prob = ml_result.score
    rule_score = ml_result.rule_score
    threshold = ml_result.threshold
    margin = abs(ml_prob - threshold)

    # Step 2: Trigger Gemini Decision
    LOW_CONFIDENCE_MARGIN = 0.10
    should_run_gemini = bool(deep_review)
    if not should_run_gemini and margin < LOW_CONFIDENCE_MARGIN:
        should_run_gemini = True

    # Step 3: Conditional Gemini Analysis
    ai_analysis_dict = None
    gemini_risk_level = None
    if should_run_gemini:
        # Cache key based on input text
        cache_key = " ".join(filter(None, [title, description, requirements])).strip() or None

        gemini_result = analyze_job_with_gemini(
            title=title,
            description=description,
            requirements=requirements,
            company_profile=company_profile,
            salary_range=salary_range,
            employment_type=employment_type,
            cache_key=cache_key,
        )
        ai_analysis_dict = create_ai_analysis_object(gemini_result)
        if ai_analysis_dict:
            gemini_risk_level = ai_analysis_dict.get("risk_level")

    # Step 4: Arbitration
    final_score = compute_final_risk(ml_prob, rule_score, gemini_risk_level)
    final_label = get_risk_label(final_score)

    return DeepAnalysisResponse(
        ml_probability=ml_prob,
        rule_score=rule_score,
        gemini_risk_level=gemini_risk_level,
        final_risk_score=final_score,
        final_label=final_label,
        ml_reasoning=ml_result.reasoning,
        ai_analysis=AIAnalysis(**ai_analysis_dict) if ai_analysis_dict else None,
    )


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    if _predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")

    res = _predictor.predict(
        title=req.title,
        description=req.description,
        requirements=req.requirements,
        company_profile=req.company_profile,
        salary_range=req.salary_range,
        employment_type=req.employment_type,
    )
    return PredictResponse(
        final_label=res.final_label,
        reasoning=res.reasoning,
        ml_probability=res.score,
    )


@app.post("/deep-analysis", response_model=DeepAnalysisResponse)
def deep_analysis(req: DeepAnalysisRequest) -> DeepAnalysisResponse:
    try:
        return run_analysis_pipeline(
            title=req.title or "",
            description=req.description or "",
            requirements=req.requirements or "",
            company_profile=req.company_profile or "",
            salary_range=req.salary_range or "",
            employment_type=req.employment_type or "",
            deep_review=req.deep_review or False,
        )
    except Exception as e:
        logger.exception("Deep analysis failed")
        raise HTTPException(status_code=500, detail=str(e))
