from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Iterable

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

logger = logging.getLogger(__name__)


def _ensure_nltk() -> None:
    """
    Ensure required NLTK assets exist.
    Downloading is idempotent; if offline and missing, an exception will surface early.
    """
    required = ["stopwords", "wordnet", "omw-1.4"]
    for pkg in required:
        try:
            nltk.data.find(f"corpora/{pkg}")
        except LookupError:
            logger.info("Downloading NLTK resource: %s", pkg)
            nltk.download(pkg, quiet=True)


_NON_ALPHA_RE = re.compile(r"[^a-z0-9\s]+", re.IGNORECASE)
_MULTISPACE_RE = re.compile(r"\s+")


@dataclass(frozen=True)
class TextPreprocessor:
    """
    Reusable, safe text preprocessing.

    Steps:
    - handle missing
    - lowercase
    - remove special characters
    - normalize whitespace
    - remove stopwords
    - lemmatize
    """

    language: str = "english"
    _stopwords: set[str] = field(default_factory=set, init=False, repr=False)
    _lemmatizer: WordNetLemmatizer | None = field(default=None, init=False, repr=False)

    def __post_init__(self) -> None:
        _ensure_nltk()
        object.__setattr__(self, "_stopwords", set(stopwords.words(self.language)))
        object.__setattr__(self, "_lemmatizer", WordNetLemmatizer())

    def preprocess(self, text: str | None) -> str:
        if not text or not isinstance(text, str):
            return ""

        s = text.lower().strip()
        s = _NON_ALPHA_RE.sub(" ", s)
        s = _MULTISPACE_RE.sub(" ", s).strip()
        if not s:
            return ""

        tokens: list[str] = []
        for tok in s.split():
            if tok in self._stopwords:
                continue
            if len(tok) <= 1:
                continue
            tokens.append(self._lemmatizer.lemmatize(tok) if self._lemmatizer else tok)

        return " ".join(tokens)

    def preprocess_many(self, texts: Iterable[str | None]) -> list[str]:
        return [self.preprocess(t) for t in texts]


