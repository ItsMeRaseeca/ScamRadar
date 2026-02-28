from __future__ import annotations

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

# CORS for frontend (Next.js on http://localhost:3000 by default)
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_predictor: ScamRadarPredictor | None = None


@app.on_event("startup")
def _startup() -> None:
    configure_logging()
    global _predictor
    artifacts = load_artifacts()
    _predictor = ScamRadarPredictor(artifacts)
    logger.info("ScamRadar artifacts loaded. API ready.")


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    if _predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Train and restart the service.")

    try:
        res = _predictor.predict(
            title=req.title,
            description=req.description,
            requirements=req.requirements,
            company_profile=req.company_profile,
            salary_range=req.salary_range,
            employment_type=req.employment_type,
        )
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed") from e

    if res.final_label not in {"FAKE", "GENUINE"}:
        # Guardrail: never return unexpected values.
        raise HTTPException(status_code=500, detail="Invalid prediction output.")

    return PredictResponse(final_label=res.final_label, reasoning=res.reasoning)


@app.post("/deep-analysis", response_model=DeepAnalysisResponse)
def deep_analysis(req: DeepAnalysisRequest) -> DeepAnalysisResponse:
    """
    Hybrid endpoint: ML prediction + Gemini AI deep analysis.
    Gemini analysis runs when:
    - ML confidence is close to the decision threshold (low confidence), OR
    - the user explicitly requests deep_review.
    """
    if _predictor is None:
        raise HTTPException(
            status_code=503, detail="Model not loaded. Train and restart the service."
        )

    try:
        # Step 1: Get ML prediction
        ml_result = _predictor.predict(
            title=req.title or "",
            description=req.description or "",
            requirements=req.requirements or "",
            company_profile=req.company_profile or "",
            salary_range=req.salary_range or "",
            employment_type=req.employment_type or "",
        )

        # Step 2: Decide whether to run Gemini
        # - explicit deep_review from user OR
        # - low-confidence ML decision (score near threshold)
        score = getattr(ml_result, "score", None)
        threshold = getattr(ml_result, "threshold", None)
        margin = abs(score - threshold) if score is not None and threshold is not None else None

        LOW_CONFIDENCE_MARGIN = 0.10  # within ±0.10 of tuned threshold
        should_run_gemini = bool(req.deep_review)
        if not should_run_gemini and margin is not None and margin < LOW_CONFIDENCE_MARGIN:
            should_run_gemini = True

        # Prepare cache key based on full job text so repeated requests don't re-hit Gemini.
        joined_text = " ".join(
            [
                req.title or "",
                req.description or "",
                req.requirements or "",
                req.company_profile or "",
                req.salary_range or "",
                req.employment_type or "",
            ]
        ).strip()
        cache_key = joined_text or None

        # Step 3: If conditions met, run Gemini analysis (with caching + rate limiting)
        ai_analysis_dict = None
        if should_run_gemini:
            logger.info(
                "Running Gemini deep analysis (ML label=%s, score=%.3f, thr=%.3f, margin=%s, deep_review=%s)...",
                ml_result.final_label,
                score if score is not None else -1.0,
                threshold if threshold is not None else -1.0,
                f"{margin:.3f}" if margin is not None else "n/a",
                bool(req.deep_review),
            )
            gemini_result = analyze_job_with_gemini(
                title=req.title or "",
                description=req.description or "",
                requirements=req.requirements or "",
                company_profile=req.company_profile or "",
                salary_range=req.salary_range or "",
                employment_type=req.employment_type or "",
                cache_key=cache_key,
            )
            ai_analysis_dict = create_ai_analysis_object(gemini_result)
            if ai_analysis_dict:
                logger.info("Gemini analysis completed successfully")
            else:
                logger.warning("Gemini analysis unavailable, returning ML-only result")

        # Step 4: Build response
        return DeepAnalysisResponse(
            final_label=ml_result.final_label,
            ml_reasoning=ml_result.reasoning,
            ai_analysis=AIAnalysis(**ai_analysis_dict) if ai_analysis_dict else None,
        )

    except Exception as e:
        logger.exception("Deep analysis failed")
        raise HTTPException(status_code=500, detail="Deep analysis failed") from e

