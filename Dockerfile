# Stage 1: Build & Runtime
FROM python:3.10-slim

# Prevent Python from writing .pyc and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Pre-download required NLTK corpora during image build
RUN python -m nltk.downloader -d /usr/local/share/nltk_data stopwords wordnet omw-1.4

# Copy backend source code, models, and scripts
COPY scamradar_backend/ ./scamradar_backend/
COPY scripts/ ./scripts/
COPY tests/ ./tests/

# Expose default port
EXPOSE 8000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI application
CMD ["uvicorn", "scamradar_backend.api.app:app", "--host", "0.0.0.0", "--port", "8000"]

