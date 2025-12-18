# OCTOmatiz - Project Overview 🐙

> **Last Updated:** 2024-12-18 | **Version:** 1.4.0

Mobile-first Progressive Web App (PWA) untuk freelance digital marketer membangun landing page UMKM dalam waktu kurang dari 10 menit.

---

## 📊 Project Status

| Metric | Value |
|--------|-------|
| Current Version | 1.4.0 |
| Total Files | 50+ |
| Components | 24 (4 Astro + 20 React) |
| API Routes | 4 |
| Templates | 3 |
| Color Themes | 4 |

---

## 🎯 Core Features

### ✅ Completed Features

| # | Feature | Version | Description |
|---|---------|---------|-------------|
| 1 | PWA Dashboard | 1.0.0 | Project list dengan status Live/Building/Draft |
| 2 | 5-Step Wizard | 1.0.0 | Flow pembuatan landing page |
| 3 | AI Content Generation | 1.0.0 | Gemini API untuk analisis foto produk |
| 4 | Groq Fallback | 1.0.0 | Fallback jika Gemini rate limited |
| 5 | Landing Page Templates | 1.0.0 | Simple, Warm, Modern |
| 6 | Color Themes | 1.0.0 | Green, Blue, Amber, Pink |
| 7 | WhatsApp CTA | 1.0.1 | Format Indonesia (+62) |
| 8 | Image Compression | 1.1.0 | Client-side < 500KB |
| 9 | Delete Confirmation | 1.2.0 | Modal konfirmasi hapus |
| 10 | Loading Skeleton | 1.2.0 | Skeleton saat loading |
| 11 | Tips Modal | 1.2.0 | Panduan foto produk |
| 12 | Retry with Backoff | 1.2.0 | Auto retry API calls |
| 13 | Copy Link + Toast | 1.3.0 | Copy URL dengan notifikasi |
| 14 | Edit Live Project | 1.3.0 | Edit proyek yang sudah live |
| 15 | Template Preview | 1.3.0 | Preview full-screen |
| 16 | FAB Position Fix | 1.3.1 | Tombol + di atas navbar |
| 17 | Cloudflare Env Fix | 1.4.0 | AI API berfungsi di production |

### 🚧 Planned Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Real Cloudflare Deployment | High | Saat ini simulasi |
| Image Optimization | Medium | astro:assets |
| Analytics Dashboard | Low | Track usage |
| Multi-language | Low | EN/ID |
| Template Marketplace | Low | More templates |

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Astro | 5.16.6 |
| UI Islands | React | 19.2.3 |
| Styling | Tailwind CSS | 3.4.19 |
| PWA | @vite-pwa/astro | 1.2.0 |
| AI Primary | Google Gemini | 2.0 Flash |
| AI Fallback | Groq | llama-4-scout |
| Hosting | Cloudflare Pages | - |
| Adapter | @astrojs/cloudflare | 12.6.12 |

### Design Principles

1. **Mobile-first** - Optimized untuk Android mid-range
2. **Offline-first** - PWA dengan service worker
3. **Minimal JS** - Astro partial hydration
4. **Fast** - Target < 10 menit untuk publish
5. **Simple UI** - Target user non-technical

---

## 📁 Project Structure

```
app/
├── src/
│   ├── components/
│   │   ├── interactive/          # React islands (20 files)
│   │   │   ├── DashboardContent.tsx
│   │   │   ├── Step1Form.tsx
│   │   │   ├── Step2Capture.tsx
│   │   │   ├── Step3Review.tsx
│   │   │   ├── Step4Design.tsx
│   │   │   ├── Step5Deploy.tsx
│   │   │   ├── DeleteConfirmModal.tsx
│   │   │   ├── TemplatePreviewModal.tsx
│   │   │   ├── TipsModal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── InstallPrompt.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   └── *Wrapper.tsx files
│   │   ├── Header.astro
│   │   ├── FAB.astro
│   │   ├── ProjectCard.astro
│   │   └── StatsCard.astro
│   │
│   ├── context/
│   │   └── ProjectContext.tsx    # Global state management
│   │
│   ├── hooks/
│   │   ├── useProject.ts         # Project CRUD
│   │   ├── useAutoSave.ts        # Auto-save to localStorage
│   │   ├── useContentGeneration.ts # AI content hook
│   │   └── useNetworkStatus.ts   # Online/offline detection
│   │
│   ├── lib/
│   │   ├── templates/
│   │   │   ├── simple.ts         # Simple template
│   │   │   ├── warm.ts           # Warm template
│   │   │   ├── modern.ts         # Modern template
│   │   │   ├── types.ts          # Template types
│   │   │   └── index.ts          # Template exports
│   │   ├── gemini.ts             # Gemini API client
│   │   ├── groq.ts               # Groq API client
│   │   ├── imageCompressor.ts    # Client-side compression
│   │   ├── landingPageGenerator.ts # HTML generator
│   │   ├── deployService.ts      # Deploy simulation
│   │   ├── storage.ts            # localStorage wrapper
│   │   ├── validation.ts         # Form validation
│   │   └── contentValidation.ts  # AI content validation
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   ├── analyze.ts        # POST /api/analyze
│   │   │   ├── deploy.ts         # POST /api/deploy
│   │   │   ├── test-gemini.ts    # GET /api/test-gemini
│   │   │   └── test-groq.ts      # GET /api/test-groq
│   │   ├── create/
│   │   │   ├── step-1.astro      # Business info
│   │   │   ├── step-2.astro      # Photo capture
│   │   │   ├── step-3.astro      # AI review
│   │   │   ├── step-4.astro      # Template selection
│   │   │   └── step-5.astro      # Deployment
│   │   ├── index.astro           # Dashboard
│   │   └── offline.astro         # Offline page
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro      # Base HTML layout
│   │
│   ├── styles/
│   │   └── global.css            # Global styles + Tailwind
│   │
│   └── types/
│       └── project.ts            # TypeScript interfaces
│
├── public/
│   ├── favicon.svg
│   └── octopus-192x192.svg
│
├── .env                          # Local env (gitignored)
├── .dev.vars                     # Cloudflare local secrets
├── astro.config.mjs              # Astro configuration
├── tailwind.config.mjs           # Tailwind configuration
├── wrangler.toml                 # Cloudflare config
├── package.json
├── CHANGELOG.md
└── README.md
```

---

## 🔄 App Flow

```
┌─────────────┐
│  Dashboard  │ ← Project list (Live/Building/Draft)
└──────┬──────┘
       │ Create/Continue
       ▼
┌─────────────┐
│   Step 1    │ ← Business info (name, WhatsApp, category, location)
│  Basic Info │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 2    │ ← Camera/Gallery capture + compression
│ AI Capture  │
└──────┬──────┘
       │ Analyze with Gemini/Groq
       ▼
┌─────────────┐
│   Step 3    │ ← Review & edit AI-generated content
│Content Review│   (headline, storytelling, features)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 4    │ ← Select template (Simple/Warm/Modern)
│Design Theme │   Select color (Green/Blue/Amber/Pink)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Step 5    │ ← Generate HTML + Deploy (simulated)
│  Deployment │   Share via WhatsApp/Copy link
└─────────────┘
```

---

## 🔌 API Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/analyze` | POST | Analyze product image with AI | - |
| `/api/deploy` | POST | Deploy landing page (simulated) | - |
| `/api/test-gemini` | GET | Test Gemini API connection | - |
| `/api/test-groq` | GET | Test Groq API connection | - |

### POST /api/analyze

**Request:**
```json
{
  "image": "base64_encoded_image",
  "category": "kuliner|fashion|jasa|kerajinan",
  "businessName": "Nama Bisnis"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productType": "Kue Tradisional",
    "features": ["Rasa autentik", "Bahan premium", "Tanpa pengawet"],
    "headline": "Kue Tradisional Lezat",
    "storytelling": "Cerita produk 100-200 kata..."
  }
}
```

---

## 🎨 Templates & Themes

### Landing Page Templates

| Template | Style | Best For |
|----------|-------|----------|
| Simple | Clean, minimal | All categories |
| Warm | Friendly, inviting | Kuliner, Kerajinan |
| Modern | Bold, professional | Fashion, Jasa |

### Color Themes

| Theme | Primary | Accent | Best For |
|-------|---------|--------|----------|
| Green | #36e27b | #2bc46a | Default, Fresh |
| Blue | #3b82f6 | #2563eb | Professional |
| Amber | #f59e0b | #d97706 | Warm, Food |
| Pink | #ec4899 | #db2777 | Fashion, Beauty |

---

## 🔧 Environment Variables

### Local Development (.env)
```env
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
```

### Cloudflare Pages
Set in Dashboard → Settings → Environment Variables:
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

---

## 🚀 Deployment

### Git Workflow
```bash
# 1. Create feature branch
git checkout -b feature/nama-fitur

# 2. Make changes & commit
git add -A
git commit -m "feat: description"

# 3. Push (auto-deploy preview)
git push -u origin feature/nama-fitur

# 4. Test preview URL
# https://feature-nama-fitur.octomatiz.pages.dev

# 5. Merge to main (after approval)
git checkout main
git merge feature/nama-fitur
git push origin main
```

### URLs
- **Production:** https://octomatiz.pages.dev
- **Preview:** https://{branch}.octomatiz.pages.dev
- **GitHub:** https://github.com/muhamadbasim/octomatiz

---

## 📈 Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.4.0 | 2024-12-18 | Fix Cloudflare env for AI API |
| 1.3.1 | 2024-12-18 | FAB position fix & text updates |
| 1.3.0 | 2024-12-18 | Dashboard enhancements |
| 1.2.0 | 2024-12-17 | UX improvements bundle |
| 1.1.0 | 2024-12-17 | Image compression feature |
| 1.0.2 | 2024-12-17 | Fix false offline page |
| 1.0.1 | 2024-12-17 | Bug fixes & improvements |
| 1.0.0 | 2024-12-17 | Initial release |

---

## 📝 Notes

- UI/UX language: **Bahasa Indonesia**
- Code language: **English**
- Target users: Freelance digital marketers
- Target clients: UMKM (MSMEs) Indonesia
- Branding: Octopus (gurita) in green (#36e27b)

---

*Document auto-updated by Kiro. See CHANGELOG.md for detailed changes.*
