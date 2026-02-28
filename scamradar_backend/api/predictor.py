from __future__ import annotations

import json
import logging
from dataclasses import dataclass
import re

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from scamradar_backend.explainability.keyword_reasoner import ml_keyword_reasons
from scamradar_backend.explainability.rules import rule_based_red_flags, has_urgency_language
from scamradar_backend.preprocessing.text_preprocessor import TextPreprocessor
from scamradar_backend.utils.paths import FAKE_INDICATORS_PATH, MODEL_PATH, THRESHOLD_PATH, VECTORIZER_PATH

logger = logging.getLogger(__name__)


def _combine_request_text(title: str | None, description: str | None, requirements: str | None, company_profile: str | None) -> str:
    parts = [title or "", description or "", requirements or "", company_profile or ""]
    return " ".join(p for p in parts if p).strip()


@dataclass(frozen=True)
class ScamRadarArtifacts:
    model: LogisticRegression
    vectorizer: TfidfVectorizer
    threshold: float
    fake_indicators: list[str]


def load_artifacts() -> ScamRadarArtifacts:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Missing model artifact: {MODEL_PATH}. Train first.")
    if not VECTORIZER_PATH.exists():
        raise FileNotFoundError(f"Missing vectorizer artifact: {VECTORIZER_PATH}. Train first.")
    if not THRESHOLD_PATH.exists():
        raise FileNotFoundError(f"Missing threshold artifact: {THRESHOLD_PATH}. Train first.")
    if not FAKE_INDICATORS_PATH.exists():
        raise FileNotFoundError(f"Missing fake indicators artifact: {FAKE_INDICATORS_PATH}. Train first.")

    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    threshold_obj = json.loads(THRESHOLD_PATH.read_text(encoding="utf-8"))
    threshold = float(threshold_obj["threshold"])
    indicators_obj = json.loads(FAKE_INDICATORS_PATH.read_text(encoding="utf-8"))
    fake_indicators = list(indicators_obj.get("top_terms", []))

    if not hasattr(model, "predict_proba"):
        raise TypeError("Loaded model does not support predict_proba; expected scikit-learn LogisticRegression.")

    return ScamRadarArtifacts(
        model=model,
        vectorizer=vectorizer,
        threshold=threshold,
        fake_indicators=fake_indicators,
    )


@dataclass(frozen=True)
class PredictionResult:
    final_label: str  # "FAKE" or "GENUINE"
    reasoning: list[str]
    score: float  # model probability for FAKE class
    threshold: float  # tuned decision threshold


class ScamRadarPredictor:
    def __init__(self, artifacts: ScamRadarArtifacts):
        self.artifacts = artifacts
        self.preprocessor = TextPreprocessor()

    def predict(
        self,
        *,
        title: str | None,
        description: str | None,
        requirements: str | None,
        company_profile: str | None,
        salary_range: str | None = None,
        employment_type: str | None = None,  # kept for integration; not used in model features yet
    ) -> PredictionResult:
        raw_joined = _combine_request_text(title, description, requirements, company_profile)
        if not raw_joined:
            return PredictionResult(
                final_label="GENUINE",
                reasoning=["Insufficient information to classify."],
                score=0.0,
                threshold=self.artifacts.threshold,
            )

        clean = self.preprocessor.preprocess(raw_joined)
        if len(clean) < 40:  # conservative: prevents low-signal over-triggering
            return PredictionResult(
                final_label="GENUINE",
                reasoning=["Insufficient information to classify."],
            )

        X = self.artifacts.vectorizer.transform([clean])
        score = float(self.artifacts.model.predict_proba(X)[0, 1])  # internal only
        is_fake = score >= self.artifacts.threshold
        final_label = "FAKE" if is_fake else "GENUINE"

        # Collect rule-based reasons first (these drive the main explanation)
        rule_reasons = rule_based_red_flags(
            title=title or "",
            description=description or "",
            requirements=requirements or "",
            company_profile=company_profile or "",
            salary_range=salary_range,
        ).reasons

        # Categorise rule-based reasons for clearer structure
        critical_red_flags: list[str] = []
        salary_anomalies: list[str] = []
        contact_anomalies: list[str] = []
        urgency_flags: list[str] = []

        for r in rule_reasons:
            lower = r.lower()
            if "salary claims look unusually high" in lower:
                salary_anomalies.append(r)
            elif "generic email provider" in lower:
                contact_anomalies.append(r)
            elif "urgency language" in lower:
                urgency_flags.append(r)
            else:
                critical_red_flags.append(r)

        reasons: list[str] = []

        # --- FAKE: risk-oriented explanation ---
        if final_label == "FAKE":
            # 1) Critical red flags
            reasons.extend(critical_red_flags)

            # 2) Salary anomalies
            reasons.extend(salary_anomalies)

            # 3) Contact/email anomalies
            reasons.extend(contact_anomalies)

            # 4) Urgency language
            reasons.extend(urgency_flags)

            # 5) ML pattern signals (only if semantically meaningful and present)
            ml_reasons = ml_keyword_reasons(clean, self.artifacts.fake_indicators)
            reasons.extend(ml_reasons.reasons)

        # --- GENUINE: credibility-oriented explanation ---
        else:
            desc = (description or "").strip()
            sal = (salary_range or "").strip()
            profile = (company_profile or "").strip()
            full_text = " ".join([title or "", desc, (requirements or ""), profile])

            credibility_signals: list[str] = []

            # Description richness (approximate by word count)
            word_count = len(re.findall(r"\w+", desc))
            if word_count > 300:
                credibility_signals.append(
                    "The posting includes detailed responsibilities and structured content."
                )

            # Realistic salary range: salary present and no anomaly flagged
            if sal and not any(
                "salary claims look unusually high" in r.lower() for r in rule_reasons
            ):
                credibility_signals.append(
                    "The salary range appears realistic and clearly defined."
                )

            # Responsibilities numbered (in description or requirements)
            combined_for_responsibilities = "\n".join([desc, requirements or ""])
            if re.search(r"^\s*\d+[\.\)]\s", combined_for_responsibilities, flags=re.MULTILINE):
                credibility_signals.append(
                    "The job responsibilities are clearly outlined."
                )

            # Absence of urgency/manipulation
            if not has_urgency_language(full_text):
                credibility_signals.append(
                    "No manipulative urgency language detected."
                )

            # Company description presence
            if profile:
                credibility_signals.append(
                    "A structured company description is present."
                )

            # Structural strength indicators first
            reasons.extend(credibility_signals)

            # Optionally surface any mild rule-based concerns (e.g., short description) afterwards
            for r in rule_reasons:
                if r not in reasons:
                    reasons.append(r)

        # Ensure non-empty reasoning for all outputs
        if not reasons:
            if final_label == "GENUINE":
                reasons = [
                    "No strong fraud indicators were detected and the posting appears structurally consistent with typical legitimate jobs."
                ]
            else:
                reasons = ["No strong risk indicators were detected in the provided text."]

        # Important: decision is based ONLY on tuned ML threshold; reasons can include rules.
        return PredictionResult(
            final_label=final_label,
            reasoning=reasons,
            score=score,
            threshold=self.artifacts.threshold,
        )



