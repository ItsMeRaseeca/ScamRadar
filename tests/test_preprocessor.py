import pytest
from scamradar_backend.preprocessing.text_preprocessor import TextPreprocessor


class TestTextPreprocessor:
    """Unit tests for TextPreprocessor pipeline."""

    def test_empty_and_none_input(self, preprocessor: TextPreprocessor):
        assert preprocessor.preprocess("") == ""
        assert preprocessor.preprocess(None) == ""
        assert preprocessor.preprocess("    ") == ""

    def test_lowercasing(self, preprocessor: TextPreprocessor):
        result = preprocessor.preprocess("SOFTWARE ENGINEER PYTHON")
        assert "software" in result
        assert "engineer" in result
        assert "python" in result
        assert result == result.lower()

    def test_special_characters_removal(self, preprocessor: TextPreprocessor):
        raw = "Data Analyst!! Salary: $$$$$ 100k-120k @ Google #hiring?"
        cleaned = preprocessor.preprocess(raw)
        # Verify punctuation/symbols are stripped
        for char in "!$@#?":
            assert char not in cleaned

    def test_stopword_removal(self, preprocessor: TextPreprocessor):
        raw = "This is a great position with the best team in the world"
        cleaned = preprocessor.preprocess(raw)
        words = cleaned.split()
        # Verify common stopwords are removed
        stopwords_checked = {"this", "is", "a", "with", "the", "in"}
        for sw in stopwords_checked:
            assert sw not in words
        # Meaningful tokens should remain
        assert "great" in words
        assert "position" in words
        assert "team" in words

    def test_lemmatization(self, preprocessor: TextPreprocessor):
        # WordNet lemmatizer reduces simple plural nouns by default
        raw = "engineers developing applications"
        cleaned = preprocessor.preprocess(raw)
        assert "engineer" in cleaned
        assert "application" in cleaned

    def test_preprocess_many(self, preprocessor: TextPreprocessor):
        inputs = [
            "Senior Python Developer",
            None,
            "Urgent Hiring Apply Now!!!",
            "",
        ]
        results = preprocessor.preprocess_many(inputs)
        assert len(results) == 4
        assert isinstance(results[0], str) and len(results[0]) > 0
        assert results[1] == ""
        assert isinstance(results[2], str) and "urgent" in results[2]
        assert results[3] == ""

