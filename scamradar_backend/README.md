## ScamRadar Backend (Fake Job Detection)

Production-ready, explainable Fake Job Detection backend using the Kaggle dataset **"Real or Fake: Fake Job Posting Prediction"** (Shivam Bansal).

### What this service does
- Trains a **Logistic Regression** fake-job classifier (final model) using **TF‑IDF** features.
- Tunes a **decision threshold** to maximize **F1 for the FAKE (fraudulent=1) class**.
- Provides **explainable** predictions via:
  - ML keyword indicators (high-weight LR features present in the request)
  - Rule-based red flags (urgency language, generic emails, salary oddities, etc.)
- Exposes a FastAPI endpoint:
  - `POST /predict`
  - Returns **only**:
    - `final_label`: `"FAKE"` or `"GENUINE"`
    - `reasoning`: list of human-readable reasons

### Project structure
```
scamradar_backend/
  data/
    fake_job_postings.csv
  models/
    model.pkl
    vectorizer.pkl
    threshold.json
    fake_indicators.json
  preprocessing/
  training/
  explainability/
  api/
  utils/
  main.py
requirements.txt
```

### Setup
1) Create and activate a virtual environment (recommended)

Windows PowerShell:
```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Install dependencies
```bash
pip install -r requirements.txt
```

### 1) Train the model (from scratch)
Ensure the dataset is at:
`scamradar_backend/data/fake_job_postings.csv`

Run:
```bash
python -m scamradar_backend.training.train
```

This will print:
- F1 / Precision / Recall (FAKE class)
- Confusion matrix

And it will save:
- `scamradar_backend/models/model.pkl`
- `scamradar_backend/models/vectorizer.pkl`
- `scamradar_backend/models/threshold.json`
- `scamradar_backend/models/fake_indicators.json`

### 2) Run the API
```bash
uvicorn scamradar_backend.api.app:app --host 0.0.0.0 --port 8000
```

Alternative (Python entrypoint):
```bash
python -m scamradar_backend.main
```

### 3) Example request
```bash
curl -X POST "http://127.0.0.1:8000/predict" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Work from home - Earn quickly!!!\",\"description\":\"Apply now. Earn money fast. Email hr@gmail.com\",\"requirements\":\"No experience needed\",\"company_profile\":\"\",\"salary_range\":\"$5000 per week\"}"
```

### Notes on reproducibility
- All randomized operations use `random_state=42`.
- TF‑IDF is fit **only on training data** to prevent leakage.
- Logistic Regression is the final deployed model even if RandomForest scores higher (explainability consistency).

Example response:
```json
{
  "final_label": "FAKE",
  "reasoning": [
    "Uses urgency language (e.g., 'apply now', 'urgent').",
    "Contains a generic email provider address (e.g., gmail/yahoo/outlook).",
    "Missing company profile.",
    "Contains high-risk indicator terms learned from historical fake postings: earn, quickly"
  ]
}
```


