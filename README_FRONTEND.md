# ScamRadar PWA Frontend

A production-ready Progressive Web App (PWA) for AI-powered fake job detection, built with Next.js 14, TypeScript, and TailwindCSS.

## 🚀 Features

- **Hybrid AI Analysis**: ML-based classification + Gemini deep investigation
- **Modern UI**: Clean, responsive design with dark mode support
- **PWA Ready**: Installable on mobile and desktop
- **Scan History**: Local storage for last 10 scans
- **Keyword Highlighting**: Visual highlighting of suspicious terms
- **Two Scan Modes**: Quick scan (description only) or detailed scan (all fields)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8000` (or set `NEXT_PUBLIC_API_URL`)

## 🛠️ Installation

1. **Install dependencies:**

```bash
npm install
# or
yarn install
```

2. **Create placeholder icons** (required for PWA):

You need to create two icon files in the `public/` directory:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

You can use any image editor or online tool to create these. Recommended: Use a shield/radar icon with blue/indigo theme.

3. **Set environment variables** (optional):

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🏃 Running the App

**Development mode:**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

**Production build:**

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🔌 Backend Integration

The frontend expects two endpoints:

1. **POST `/deep-analysis`** (primary)
   - Returns ML prediction + Gemini AI analysis (if FAKE)
   - Response: `{ final_label, ml_reasoning, ai_analysis }`

2. **POST `/predict`** (fallback)
   - Basic ML prediction only
   - Used if deep-analysis fails

**⚠️ IMPORTANT:** The `/deep-analysis` endpoint doesn't exist in your backend yet. You'll need to add it (see backend setup instructions below).

## 📱 PWA Features

- **Installable**: Users can install the app on their devices
- **Offline Support**: Shows offline page when network is unavailable
- **Service Worker**: Caches assets for faster loading
- **Mobile Optimized**: Responsive design for all screen sizes

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts` to change theme colors
- **Styling**: Modify `app/globals.css` for global styles
- **Components**: All components are in `components/` directory

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx             # Main page
│   ├── offline/
│   │   └── page.tsx         # Offline fallback page
│   └── globals.css          # Global styles
├── components/
│   ├── AnalyzerForm.tsx    # Job posting input form
│   ├── ResultCard.tsx       # ML result display
│   ├── RiskMeter.tsx        # Circular progress indicator
│   ├── AIAnalysisSection.tsx # Gemini analysis display
│   ├── SafetyPanel.tsx      # Highlighted text display
│   └── HistorySidebar.tsx   # Scan history sidebar
├── lib/
│   ├── api.ts              # API client functions
│   ├── types.ts            # TypeScript types
│   ├── storage.ts          # LocalStorage utilities
│   └── highlight.ts        # Text highlighting logic
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icon-192x192.png    # App icon (192x192)
│   └── icon-512x512.png    # App icon (512x512)
└── package.json
```

## 🐛 Troubleshooting

**PWA not installing:**
- Ensure icons exist in `public/` directory
- Check browser console for service worker errors
- Make sure you're using HTTPS (or localhost for development)

**API errors:**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is enabled on backend

**Build errors:**
- Clear `.next/` directory and rebuild
- Check Node.js version (requires 18+)

## 📝 License

MIT




