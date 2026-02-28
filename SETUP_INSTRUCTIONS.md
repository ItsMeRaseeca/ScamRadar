# 🚀 ScamRadar Complete Setup Instructions

This document provides step-by-step instructions to get both the backend and frontend running.

## 📋 Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** and npm/yarn (for frontend)
- **Google Gemini API Key** (for deep AI analysis - optional but recommended)

---

## 🔧 Backend Setup

### Step 1: Install Python Dependencies

```bash
cd "C:\Users\rasee\Documents\Hackathon Projects\ScamRadar Reborn"
pip install -r requirements.txt
```

### Step 2: Train the ML Model

```bash
python -m scamradar_backend.training.train
```

This will:
- Load the dataset from `scamradar_backend/data/fake_job_postings.csv`
- Train Logistic Regression and Random Forest models
- Save artifacts to `scamradar_backend/models/`
- Print F1 scores and confusion matrices

**Expected output:** You should see metrics printed and 4 files created:
- `model.pkl`
- `vectorizer.pkl`
- `threshold.json`
- `fake_indicators.json`

### Step 3: Set Up Gemini API Key (Optional but Recommended)

The `/deep-analysis` endpoint uses Google Gemini AI for advanced analysis. To enable it:

1. **Get a Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key

2. **Set Environment Variable:**

   **Windows PowerShell:**
   ```powershell
   $env:GOOGLE_API_KEY="your-api-key-here"
   ```

   **Windows CMD:**
   ```cmd
   set GOOGLE_API_KEY=your-api-key-here
   ```

   **Linux/Mac:**
   ```bash
   export GOOGLE_API_KEY="your-api-key-here"
   ```

   **Or create a `.env` file** (recommended for development):
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```

   > **Note:** If you don't set the API key, the backend will still work but Gemini analysis will be skipped (only ML results will be returned).

### Step 4: Start the Backend Server

```bash
uvicorn scamradar_backend.api.app:app --host 0.0.0.0 --port 8000
```

Or:

```bash
python -m scamradar_backend.main
```

**Verify it's running:** Open http://localhost:8000/docs to see the API documentation.

---

## 🎨 Frontend Setup

### Step 1: Install Node.js Dependencies

```bash
cd "C:\Users\rasee\Documents\Hackathon Projects\ScamRadar Reborn"
npm install
```

### Step 2: Create PWA Icons

You need to create two icon files for the PWA:

1. **Create `public/icon-192x192.png`** (192x192 pixels)
2. **Create `public/icon-512x512.png`** (512x512 pixels)

**Quick options:**
- Use an online icon generator (e.g., https://realfavicongenerator.net/)
- Use any image editor (Photoshop, GIMP, Canva)
- Use a shield/radar icon with blue/indigo theme
- Or temporarily use placeholder images (the app will work, but PWA install won't be perfect)

### Step 3: Configure API URL (Optional)

If your backend runs on a different URL, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Run the Frontend

**Development mode:**

```bash
npm run dev
```

Open http://localhost:3000

**Production build:**

```bash
npm run build
npm start
```

---

## ✅ Verification Checklist

### Backend:
- [ ] Backend server running on http://localhost:8000
- [ ] `/docs` endpoint shows Swagger UI
- [ ] `/predict` endpoint works (test with Postman/curl)
- [ ] Model artifacts exist in `scamradar_backend/models/`
- [ ] Gemini API key set (if using deep analysis)

### Frontend:
- [ ] Frontend running on http://localhost:3000
- [ ] Icons exist in `public/` directory
- [ ] Can paste job description and click "Analyze"
- [ ] Results display correctly
- [ ] History sidebar works
- [ ] PWA installable (check browser install prompt)

---

## 🧪 Testing the Complete Flow

### Test 1: Quick Scan (Fake Job)

1. Open http://localhost:3000
2. Paste this fake job:

```
Work from home - Earn quickly!!!
Apply now. Earn money fast. Email hr@gmail.com
No experience needed. Guaranteed income.
```

3. Click "Analyze Job Posting"
4. **Expected:**
   - ML predicts FAKE
   - Risk meter shows 85%
   - ML reasoning displayed
   - Gemini analysis appears (if API key set)
   - Suspicious words highlighted in red

### Test 2: Genuine Job

1. Paste a normal corporate job posting
2. Click "Analyze"
3. **Expected:**
   - ML predicts GENUINE
   - Risk meter shows 20%
   - No Gemini analysis (only for FAKE)
   - Green badge displayed

### Test 3: Detailed Scan Mode

1. Toggle to "Detailed Scan"
2. Fill in all fields (title, description, requirements, etc.)
3. Click "Analyze"
4. **Expected:** Full analysis with all fields considered

---

## 🐛 Troubleshooting

### Backend Issues

**"Model not loaded" error:**
- Run `python -m scamradar_backend.training.train` first
- Check that `scamradar_backend/models/model.pkl` exists

**Gemini errors:**
- Verify `GOOGLE_API_KEY` is set correctly
- Check API key is valid at https://makersuite.google.com/app/apikey
- Install: `pip install google-generativeai`

**Port 8000 already in use:**
- Change port: `uvicorn scamradar_backend.api.app:app --port 8001`
- Update frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8001`

### Frontend Issues

**"Unable to reach server" error:**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings (backend should allow localhost:3000)

**PWA not installing:**
- Ensure icons exist (`icon-192x192.png`, `icon-512x512.png`)
- Use HTTPS or localhost (required for PWA)
- Check browser console for service worker errors

**Build errors:**
- Clear `.next/` folder: `rm -rf .next` (Linux/Mac) or `rmdir /s .next` (Windows)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 📝 Important Notes

1. **Gemini API Key:** The app works without it, but you'll only get ML results (no deep AI analysis). Set it up for the full experience.

2. **First Run:** Always train the model before starting the backend server.

3. **Development vs Production:**
   - Development: Both servers can run simultaneously
   - Production: Build frontend (`npm run build`) and serve with `npm start` or deploy to Vercel/Netlify

4. **Data Privacy:** All analysis happens locally/on your server. No data is sent to external services except Gemini (if enabled).

---

## 🎉 You're All Set!

Once both servers are running:
- **Backend:** http://localhost:8000/docs
- **Frontend:** http://localhost:3000

Start analyzing job postings and stay safe from scams! 🛡️



