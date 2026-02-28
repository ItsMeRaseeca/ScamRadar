from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class PredictRequest(BaseModel):
    title: str | None = Field(default=None)
    description: str | None = Field(default=None)
    requirements: str | None = Field(default=None)
    company_profile: str | None = Field(default=None)
    salary_range: str | None = Field(default=None)
    employment_type: str | None = Field(default=None)

    @field_validator(
        "title",
        "description",
        "requirements",
        "company_profile",
        "salary_range",
        "employment_type",
        mode="before",
    )
    @classmethod
    def _coerce_to_str_or_none(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        # If a client sends a number/bool accidentally, accept but stringify.
        return str(v).strip() or None


class PredictResponse(BaseModel):
    final_label: str
    reasoning: list[str]
    ml_probability: float | None = None


class DeepAnalysisRequest(PredictRequest):
    deep_review: bool | None = False


class AIAnalysis(BaseModel):
    risk_level: str  # LOW | MODERATE | HIGH | CRITICAL
    confidence: float
    manipulation_signals: str
    tone_analysis: str
    company_risk_analysis: str
    overall_summary: str
    safety_advice: str


class DeepAnalysisResponse(BaseModel):
    ml_probability: float
    rule_score: float
    gemini_risk_level: str | None
    final_risk_score: float
    final_label: str
    ml_reasoning: list[str]
    ai_analysis: AIAnalysis | None = None



