# OCTOmatiz 🐙

Mobile-first Progressive Web App (PWA) untuk freelance digital marketer membangun landing page UMKM dalam waktu kurang dari 10 menit.

## 🎯 Fitur Utama

- **AI-Powered Content** - Analisis foto produk dengan Gemini AI + Groq fallback
- **3 Template Landing Page** - Simple, Warm, Modern
- **4 Tema Warna** - Green, Blue, Amber, Pink
- **PWA Support** - Install ke home screen, offline support
- **WhatsApp CTA** - Tombol hubungi langsung dengan format Indonesia (+62)

## 🛠️ Tech Stack

- **Framework:** Astro 5.x dengan React Islands
- **Styling:** Tailwind CSS
- **PWA:** @vite-pwa/astro + Workbox
- **AI:** Google Gemini API (primary) + Groq API (fallback)
- **Hosting:** Cloudflare Pages

## 📁 Struktur Project

```
app/
├── src/
│   ├── components/          # Astro & React components
│   │   ├── interactive/     # React islands (client-side)
│   │   └── *.astro          # Static Astro components
│   ├── context/             # React Context (ProjectContext)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities & services
│   │   └── templates/       # Landing page templates
│   ├── pages/               # File-based routing
│   │   ├── api/             # API routes (SSR)
│   │   └── create/          # Step 1-5 wizard
│   ├── styles/              # Global CSS
│   └── types/               # TypeScript types
├── public/                  # Static assets
├── astro.config.mjs         # Astro configuration
└── package.json
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## 🔧 Environment Variables

Buat file `.env` di folder `app/`:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

**Cloudflare Pages:**
Settings → Environment variables → Tambahkan untuk Production & Preview

## 📱 App Flow

1. **Dashboard** - Daftar project UMKM (Live, Building, Draft)
2. **Step 1** - Info dasar (nama bisnis, WhatsApp, kategori)
3. **Step 2** - Capture foto produk
4. **Step 3** - Review konten AI (headline & storytelling)
5. **Step 4** - Pilih template & tema warna
6. **Step 5** - Deploy & share

## 🌿 Git Workflow

```bash
# 1. Buat branch baru
git checkout -b feature/nama-fitur

# 2. Commit changes
git add -A
git commit -m "feat: deskripsi"

# 3. Push branch (Cloudflare auto-deploy preview)
git push -u origin feature/nama-fitur

# 4. Test di preview URL
# https://feature-nama-fitur.octomatiz.pages.dev

# 5. Merge ke main
git checkout main
git merge feature/nama-fitur
git push origin main
```

## 📝 Commit Convention

- `feat:` - Fitur baru
- `fix:` - Bug fix
- `docs:` - Dokumentasi
- `style:` - Formatting
- `refactor:` - Refactoring
- `test:` - Testing
- `chore:` - Maintenance

## 🔗 Links

- **Production:** https://octomatiz.pages.dev
- **GitHub:** https://github.com/muhamadbasim/octomatiz

---

Made with 🐙 by OCTOmatiz Team
