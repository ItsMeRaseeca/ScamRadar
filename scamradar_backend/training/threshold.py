from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.metrics import f1_score


@dataclass(frozen=True)
class ThresholdSearchResult:
    threshold: float
    best_f1: float


def tune_threshold_for_f1(
    y_true: np.ndarray,
    y_score: np.ndarray,
    *,
    min_t: float = 0.05,
    max_t: float = 0.95,
    step: float = 0.01,
    pos_label: int = 1,
) -> ThresholdSearchResult:
    """
    Tune a decision threshold to maximize F1 for the positive (fraudulent=1) class.
    y_score must be model scores/probabilities for the positive class.
    """
    best_t = 0.5
    best_f1 = -1.0

    thresholds = np.arange(min_t, max_t + 1e-9, step)
    for t in thresholds:
        y_pred = (y_score >= t).astype(int)
        f1 = f1_score(y_true, y_pred, pos_label=pos_label, zero_division=0)
        if f1 > best_f1:
            best_f1 = float(f1)
            best_t = float(t)

    return ThresholdSearchResult(threshold=best_t, best_f1=best_f1)







