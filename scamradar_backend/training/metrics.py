from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support


@dataclass(frozen=True)
class BinaryMetrics:
    precision_pos: float
    recall_pos: float
    f1_pos: float
    confusion: np.ndarray


def compute_binary_metrics(y_true: np.ndarray, y_pred: np.ndarray, pos_label: int = 1) -> BinaryMetrics:
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true, y_pred, average="binary", pos_label=pos_label, zero_division=0
    )
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    return BinaryMetrics(precision_pos=float(precision), recall_pos=float(recall), f1_pos=float(f1), confusion=cm)










