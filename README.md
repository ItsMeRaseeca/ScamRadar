# 🛡️ ScamRadar - AI-Powered Fake Job Detection

<div align="center">

**Protect yourself from recruitment fraud with transparent, AI-driven analysis**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Architecture](#-architecture)

</div>

---

## 📖 Overview

**ScamRadar** is a production-ready, explainable AI system that helps job seekers identify fraudulent job postings. It combines machine learning, rule-based detection, and advanced AI reasoning to provide transparent, actionable fraud detection.

### Why ScamRadar?

- 🎯 **Explainable AI**: Every decision is explained in plain language
- ⚡ **Fast Analysis**: Results in seconds with ML pattern detection
- 🧠 **Deep Intelligence**: Google Gemini AI for contextual analysis
- 🔒 **Production-Ready**: Rate limiting, caching, and comprehensive error handling
- 🎨 **Modern UI**: Clean neobrutalism design with smooth animations

---

## ✨ Features

### Core Capabilities

- **Quick ML Scan**: Instant pattern-based analysis using trained machine learning models
- **Advanced AI Investigation**: Deep contextual reasoning powered by Google Gemini AI
- **Screenshot Analysis (OCR)**: Upload screenshots of job postings for automatic text extraction
- **Risk Arbitration Layer**: Weighted scoring system combining multiple detection signals
- **Structured Fraud Explanation**: Clear, categorized explanations of detected risks
- **Rate-Limited & Secure**: Built-in protection against API abuse

### Detection Methods

1. **ML Pattern Detection** (50% weight)
   - Trained on thousands of scam postings
   - Identifies linguistic and structural fraud patterns

2. **Red Flag Rule Engine** (20% weight)
   - Deterministic rules for known scam indicators
   - Detects fake domains, suspicious contact methods, inflated promises

3. **AI Deep Investigation** (30% weight)
   - Gemini AI performs contextual reasoning
   - Analyzes manipulation tactics beyond pattern matching

4. **Risk Arbitration System**
   - Weighted aggregation of all signals
   - Final risk assessment with structured explanations

---

## 🏗️ Architecture

### Hybrid AI System

```
User Input (Job Posting)
    ↓
ML Model (Pattern Recognition - 50% weight)
    ↓
Rule Engine (Deterministic Red Flags - 20% weight)
    ↓
Gemini AI (Deep Contextual Analysis - 30% weight)
    ↓
Final Risk Score (Weighted aggregation with explanation)
```

### Tech Stack

**Backend:**
- Python 3.10+
- FastAPI (REST API)
- Scikit-learn (Logistic Regression)
- Google Gemini AI (Deep analysis)
- Tesseract.js (OCR)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS (Neobrutalism theme)
- Framer Motion (Animations)
- React Hot Toast (Notifications)

**ML/AI:**
- Logistic Regression (TF-IDF features)
- Rule-based detection engine
- Google Gemini API

---

## 🚀 Installation

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** and npm (for frontend)
- **Google Gemini API Key** (optional, for deep AI analysis)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "ScamRadar Reborn"
   ```

2. **Backend Setup**
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Train the ML model
   python -m scamradar_backend.training.train
   
   # Set Gemini API key (optional)
   # Windows PowerShell:
   $env:GOOGLE_API_KEY="your-api-key-here"
   
   # Linux/Mac:
   export GOOGLE_API_KEY="your-api-key-here"
   
   # Start backend server
   python -m scamradar_backend.main
   ```

3. **Frontend Setup**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Detailed Setup

For comprehensive setup instructions, see [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md).

---

## 💻 Usage

### Web Interface

1. Navigate to http://localhost:3000
2. Choose **Quick Scan** or **Detailed Scan** mode
3. Paste the job posting text (or upload a screenshot)
4. Click **"Analyze Job Posting"**
5. Review the risk assessment and detailed analysis

### API Usage

#### Basic Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Work from home - Earn quickly!!!",
    "description": "Apply now. Earn money fast. Email hr@gmail.com",
    "requirements": "No experience needed",
    "company_profile": "",
    "salary_range": "$5000 per week",
    "employment_type": "Full-time"
  }'
```

#### Deep Analysis

```bash
curl -X POST "http://localhost:8000/deep-analysis" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer",
    "description": "We are looking for an experienced developer...",
    "requirements": "3+ years experience",
    "company_profile": "Leading tech company since 2015",
    "salary_range": "$80,000 - $120,000",
    "employment_type": "Full-time"
  }'
```

---

## 📡 API Documentation

### Endpoints

#### `POST /predict`
Basic ML prediction with rule-based analysis.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "requirements": "string",
  "company_profile": "string",
  "salary_range": "string",
  "employment_type": "string"
}
```

**Response:**
```json
{
  "final_label": "FAKE" | "GENUINE",
  "ml_probability": 0.85,
  "rule_score": 0.3,
  "final_risk_score": 0.75,
  "ml_reasoning": {
    "explanation": "Statistical pattern analysis detected...",
    "tokens": ["earn", "quickly", "apply now"]
  }
}
```

#### `POST /deep-analysis`
Advanced analysis with Gemini AI (requires API key).

**Request Body:** Same as `/predict`

**Response:**
```json
{
  "final_label": "FAKE",
  "ml_probability": 0.85,
  "rule_score": 0.3,
  "gemini_risk_level": "HIGH",
  "final_risk_score": 0.89,
  "ml_reasoning": {...},
  "ai_analysis": {
    "risk_level": "HIGH",
    "manipulation_signals": [...],
    "tone_analysis": {...},
    "company_risk": {...},
    "safety_recommendations": [...]
  }
}
```

### Interactive API Docs

Visit http://localhost:8000/docs for interactive Swagger UI documentation.

---

## 📁 Project Structure

```
ScamRadar Reborn/
├── app/                          # Next.js app directory
│   ├── page.tsx                 # Main landing page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── landing/                 # Landing page sections
│   │   ├── Navbar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   └── ...
│   ├── AnalyzerForm.tsx         # Job posting input form
│   ├── ResultCard.tsx           # Results display
│   ├── AIAnalysisSection.tsx   # Gemini AI analysis
│   └── RiskMeter.tsx            # Risk visualization
├── lib/                         # Utility libraries
│   ├── api.ts                   # API client
│   ├── ocr.ts                   # OCR functionality
│   ├── storage.ts               # Local storage
│   └── types.ts                 # TypeScript types
├── scamradar_backend/           # Python backend
│   ├── api/                     # FastAPI routes
│   │   ├── app.py               # Main API app
│   │   ├── predictor.py         # ML prediction logic
│   │   └── gemini_client.py     # Gemini AI client
│   ├── explainability/         # Explainability modules
│   │   ├── keyword_reasoner.py  # ML keyword extraction
│   │   └── rules.py             # Rule-based detection
│   ├── training/                # Model training
│   │   └── train.py             # Training script
│   ├── preprocessing/           # Text preprocessing
│   ├── models/                  # Saved ML models
│   └── main.py                  # Backend entry point
├── public/                      # Static assets
├── package.json                 # Node.js dependencies
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

---

## 🧪 Testing

### Test Cases

#### Fake Job Example
```
URGENT HIRING! 
Earn ₹5000 per day working from home!
No experience required!
Daily payments guaranteed!
Contact WhatsApp: +91-XXXXX
Apply now - Limited positions available!
```

**Expected Result:** HIGH RISK (85%+), multiple red flags detected

#### Genuine Job Example
```
Software Engineer - Full Stack

About the Company:
Echo Booom is a leading digital marketing agency founded in 2015...

Job Description:
- Develop and maintain web applications
- Collaborate with cross-functional teams
- 3+ years experience required

Salary Range: $80,000 - $120,000 annually
Employment Type: Full-time, Remote
```

**Expected Result:** LOW RISK (20-30%), genuine indicators present

---

## 🔧 Configuration

### Environment Variables

**Backend:**
- `GOOGLE_API_KEY`: Google Gemini API key (optional)

**Frontend:**
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Model Training

The ML model is trained on the Kaggle dataset **"Real or Fake: Fake Job Posting Prediction"** (Shivam Bansal).

**Training Command:**
```bash
python -m scamradar_backend.training.train
```

**Model Artifacts:**
- `model.pkl`: Trained Logistic Regression model
- `vectorizer.pkl`: TF-IDF vectorizer
- `threshold.json`: Optimized decision threshold
- `fake_indicators.json`: High-weight scam indicators

---

## 🎨 UI/UX Features

- **Neobrutalism Design**: Bold, modern aesthetic with thick borders and shadows
- **Smooth Animations**: Framer Motion for engaging interactions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Ready**: CSS variables support for theme switching
- **PWA Support**: Installable as a Progressive Web App
- **History Tracking**: Local storage for scan history

---

## 🚧 Roadmap

- [ ] Live Model Retraining from user feedback
- [ ] Social Media Dataset Expansion (LinkedIn, Instagram, Facebook)
- [ ] Adaptive AI Weighting based on scam type
- [ ] User Feedback Learning system
- [ ] Multi-language support
- [ ] Browser extension

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all linting checks pass

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Dataset**: [Real or Fake: Fake Job Posting Prediction](https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction) by Shivam Bansal
- **AI Model**: Google Gemini API
- **Icons**: Lucide React
- **UI Framework**: Next.js, Tailwind CSS

---

## 📞 Support

For issues, questions, or contributions:

- **Issues**: Open an issue on GitHub
- **Documentation**: See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)
- **Demo Script**: See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md)

---

## ⭐ Show Your Support

If you find this project helpful, please consider giving it a star on GitHub!

---

<div align="center">

**Built with ❤️ to protect job seekers from fraud**

[⬆ Back to Top](#-scamradar---ai-powered-fake-job-detection)

</div>

