from __future__ import annotations

import json
import logging
from dataclasses import asdict
import math

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier

from scamradar_backend.preprocessing.text_preprocessor import TextPreprocessor
from scamradar_backend.training.metrics import compute_binary_metrics
from scamradar_backend.training.threshold import tune_threshold_for_f1
from scamradar_backend.utils.logging import configure_logging
from scamradar_backend.utils.paths import (
    DATASET_PATH,
    FAKE_INDICATORS_PATH,
    MODEL_PATH,
    MODELS_DIR,
    THRESHOLD_PATH,
    VECTORIZER_PATH,
)

logger = logging.getLogger(__name__)


TEXT_COLUMNS = ["title", "description", "requirements", "company_profile"]
TARGET_COLUMN = "fraudulent"


def _combine_text_fields(df: pd.DataFrame) -> pd.Series:
    safe = df.copy()
    for col in TEXT_COLUMNS:
        if col not in safe.columns:
            safe[col] = ""
        safe[col] = safe[col].fillna("").astype(str)
    combined = safe[TEXT_COLUMNS].agg(" ".join, axis=1)
    return combined


_NEUTRAL_TOKENS = {
    "line",
    "direction",
    "alignment",
    "team",
    "role",
    "work",
    "per",
    "day",
    "year",
    "month",
    "apply",
}


def _extract_fake_indicators(
    model: LogisticRegression,
    vectorizer: TfidfVectorizer,
    n_samples: int,
    top_k: int = 80,
) -> list[str]:
    # For binary LR, coef_ has shape (1, n_features) where positive => class 1 (fraudulent/fake)
    coefs = model.coef_.ravel()
    feature_names = vectorizer.get_feature_names_out()
    idf = vectorizer.idf_

    top_idx = np.argsort(coefs)[::-1][:top_k]

    indicators: list[str] = []
    for i in top_idx:
        if coefs[i] <= 0:
            continue
        term = str(feature_names[i]).strip().lower()
        # Basic filters: length, numeric-only, neutral/common tokens
        if len(term) <= 3:
            continue
        if term.replace(" ", "").isdigit():
            continue
        if term in _NEUTRAL_TOKENS:
            continue

        # Approximate document frequency ratio using TF-IDF idf_ values.
        # idf_j = log((1 + n_samples) / (1 + df_j)) + 1  =>  df_j = (1 + n_samples) / exp(idf_j - 1) - 1
        idf_j = float(idf[i])
        try:
            df_j = (1.0 + n_samples) / math.exp(idf_j - 1.0) - 1.0
            df_ratio = max(0.0, min(1.0, df_j / float(n_samples))) if n_samples > 0 else 0.0
        except Exception:
            df_ratio = 0.0

        # Skip tokens that appear in more than 40% of documents (too generic)
        if df_ratio > 0.40:
            continue

        indicators.append(term)

    # De-duplicate while preserving order and keep a reasonable cap
    seen: set[str] = set()
    out: list[str] = []
    for w in indicators:
        if w not in seen:
            out.append(w)
            seen.add(w)
        if len(out) >= top_k:
            break
    return out


def main() -> None:
    configure_logging()
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at: {DATASET_PATH}. Run 'python scripts/download_dataset.py' to obtain it.")

    logger.info("Loading dataset: %s", DATASET_PATH)
    df = pd.read_csv(DATASET_PATH)
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Expected target column '{TARGET_COLUMN}' not found in dataset.")

    y = df[TARGET_COLUMN].fillna(0).astype(int).to_numpy()
    raw_text = _combine_text_fields(df)

    # Split FIRST to prevent leakage.
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        raw_text, y, test_size=0.2, stratify=y, random_state=42
    )

    # Further split training into train/val for threshold tuning only.
    X_tr_raw, X_val_raw, y_tr, y_val = train_test_split(
        X_train_raw, y_train, test_size=0.2, stratify=y_train, random_state=42
    )

    pre = TextPreprocessor()
    logger.info("Preprocessing text...")
    X_tr_clean = pre.preprocess_many(X_tr_raw.tolist())
    X_val_clean = pre.preprocess_many(X_val_raw.tolist())
    X_test_clean = pre.preprocess_many(X_test_raw.tolist())

    # Fit vectorizer ONLY on the training split.
    vectorizer = TfidfVectorizer(
        max_features=8000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
    )
    logger.info("Fitting TF-IDF on training data only...")
    X_tr = vectorizer.fit_transform(X_tr_clean)
    X_val = vectorizer.transform(X_val_clean)
    X_test = vectorizer.transform(X_test_clean)

    # 5-fold CV for model selection on training split only.
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    # PRIMARY model: Logistic Regression for explainability.
    lr = LogisticRegression(
        max_iter=3000,
        class_weight="balanced",
        random_state=42,
        solver="liblinear",
    )
    lr_grid = {
        "C": [0.25, 0.5, 1.0, 2.0, 4.0],
        "penalty": ["l1", "l2"],
    }
    logger.info("Running GridSearchCV for LogisticRegression (scoring=F1 for FAKE)...")
    lr_search = GridSearchCV(
        lr,
        lr_grid,
        scoring="f1",
        cv=cv,
        n_jobs=-1,
        verbose=0,
        refit=True,
    )
    lr_search.fit(X_tr, y_tr)
    best_lr: LogisticRegression = lr_search.best_estimator_
    logger.info("Best LR params: %s", lr_search.best_params_)

    # SECONDARY model: RandomForest for comparison only.
    rf = RandomForestClassifier(
        n_estimators=400,
        random_state=42,
        class_weight="balanced_subsample",
        n_jobs=-1,
    )
    rf_grid = {
        "max_depth": [None, 18, 28],
        "min_samples_split": [2, 5, 10],
        "min_samples_leaf": [1, 2, 4],
    }
    logger.info("Running GridSearchCV for RandomForest (comparison only, scoring=F1 for FAKE)...")
    rf_search = GridSearchCV(
        rf,
        rf_grid,
        scoring="f1",
        cv=cv,
        n_jobs=-1,
        verbose=0,
        refit=True,
    )
    rf_search.fit(X_tr, y_tr)
    best_rf: RandomForestClassifier = rf_search.best_estimator_
    logger.info("Best RF params: %s", rf_search.best_params_)

    # Threshold tuning on validation set using LR (final model).
    # Use probabilities internally for thresholding, but never return them from API.
    val_scores = best_lr.predict_proba(X_val)[:, 1]
    thr = tune_threshold_for_f1(y_val, val_scores, min_t=0.05, max_t=0.95, step=0.01)
    threshold = thr.threshold
    logger.info("Tuned threshold on validation: %.2f (best F1=%.4f)", threshold, thr.best_f1)

    # Evaluate on test set (unseen) with tuned threshold.
    test_scores_lr = best_lr.predict_proba(X_test)[:, 1]
    y_pred_lr = (test_scores_lr >= threshold).astype(int)
    lr_metrics = compute_binary_metrics(y_test, y_pred_lr, pos_label=1)

    # Evaluate RF on test with default 0.5 threshold for comparison.
    test_scores_rf = best_rf.predict_proba(X_test)[:, 1]
    y_pred_rf = (test_scores_rf >= 0.5).astype(int)
    rf_metrics = compute_binary_metrics(y_test, y_pred_rf, pos_label=1)

    logger.info("=== TEST METRICS (FAKE class) ===")
    logger.info("LogReg  | F1=%.4f  Precision=%.4f  Recall=%.4f", lr_metrics.f1_pos, lr_metrics.precision_pos, lr_metrics.recall_pos)
    logger.info("Confusion matrix [ [TN FP] [FN TP] ]:\n%s", lr_metrics.confusion)
    logger.info("RandFor | F1=%.4f  Precision=%.4f  Recall=%.4f", rf_metrics.f1_pos, rf_metrics.precision_pos, rf_metrics.recall_pos)
    logger.info("Confusion matrix [ [TN FP] [FN TP] ]:\n%s", rf_metrics.confusion)
    logger.info("NOTE: Final deployed model is Logistic Regression (explainability consistency).")

    # Save artifacts for FastAPI inference.
    joblib.dump(best_lr, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    THRESHOLD_PATH.write_text(json.dumps({"threshold": threshold, **asdict(thr)}, indent=2), encoding="utf-8")

    fake_indicators = _extract_fake_indicators(
        best_lr,
        vectorizer,
        n_samples=X_tr.shape[0],
        top_k=120,
    )
    FAKE_INDICATORS_PATH.write_text(json.dumps({"top_terms": fake_indicators}, indent=2), encoding="utf-8")

    logger.info("Saved artifacts:")
    logger.info("- %s", MODEL_PATH)
    logger.info("- %s", VECTORIZER_PATH)
    logger.info("- %s", THRESHOLD_PATH)
    logger.info("- %s", FAKE_INDICATORS_PATH)


if __name__ == "__main__":
    main()



