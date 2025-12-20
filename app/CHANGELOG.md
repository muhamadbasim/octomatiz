# Changelog

Semua perubahan penting pada project OCTOmatiz akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini menggunakan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.0] - 2024-12-20

### Added
- **Cloudflare D1 Database** - Migrasi dari localStorage ke D1 untuk persistent storage
  - Device registration dengan unique ID
  - Project CRUD operations via API
  - Automatic localStorage migration on first load
- **Admin Dashboard** (`/admin`) - SaaS unit economics dashboard
  - Vital Signs: MRR, Churn, NRR metrics
  - Efficiency: CAC, LTV, LTV:CAC ratio
  - Charts: MRR Trend, Cohort Heatmap, LTV:CAC by segment
  - Real Stats section showing D1 data (Total Projects, Devices, Deployments)
- **API Routes** for D1 operations
  - `/api/device/register` - Device registration
  - `/api/projects` - List/Create projects
  - `/api/projects/[id]` - Get/Update/Delete project
  - `/api/migrate` - Migrate localStorage data
  - `/api/admin/stats` - Real D1 statistics

### Changed
- All step components now use D1 API instead of localStorage
- ProjectContext updated to use async D1 operations
- 114 property-based tests for D1 operations

---

## [1.6.0] - 2024-12-19

### Added
- **URL Shortener Integration** - Short URL untuk landing page yang mudah dibagikan
  - Primary: clck.ru (Yandex) - reliable dari Cloudflare Workers
  - Fallback: v.gd → internal `/s/{code}` shortener
  - Tampilan 2 link di Step 5: short URL (hijau) + original URL (putih)
- **Internal Short URL Route** - `/s/[code]` untuk fallback shortener dengan KV mapping

### Changed
- Step 5 success screen sekarang menampilkan 2 link yang bisa di-copy
- Service Worker denylist ditambah `/s/` route

---

## [1.5.0] - 2024-12-18

### Added
- **Real Landing Page Deployment** - Landing page sekarang benar-benar di-deploy ke Cloudflare KV
  - Route `/p/[slug]` untuk serve landing page dari KV storage
  - Dynamic URL generation berdasarkan environment (preview/production)
  - Unique slug generation untuk setiap landing page
- **Step 2 → Step 3 Data Flow Fix** - AI-generated content sekarang persist dengan benar
  - Save langsung ke localStorage sebelum navigasi (bypass React context race condition)

### Fixed
- **Service Worker Cache** - Route `/p/*` dan `/api/*` tidak di-cache oleh Service Worker
- **Dynamic Base URL** - URL landing page sesuai dengan environment (preview branch vs production)

---

## [1.4.0] - 2024-12-18

### Fixed
- **Cloudflare Environment Variables** - AI API sekarang berfungsi di production
  - Gunakan `context.locals.runtime.env` untuk akses env di Cloudflare
  - Fallback ke `import.meta.env` untuk local development
  - Tambah `platformProxy` di astro config

### Added
- **wrangler.toml** - Konfigurasi Cloudflare Pages
- **.dev.vars** - File secrets untuk local dev dengan Cloudflare adapter

---

## [1.3.1] - 2024-12-18

### Fixed
- **FAB Position** - Tombol floating "+" sekarang di atas navbar (tidak terhalang)
- **useProjects Hook** - Expose `updateProject` untuk edit proyek live

### Changed
- Dashboard heading: "Project Terbaru Anda" → "Orang Yang Sudah Dibantu Kamu"
- Step 1 heading: "Siapa Klienmu?" → "Siapa yang akan dibantu hari ini?"

---

## [1.3.0] - 2024-12-18

### Added
- **Copy Link dengan Toast** - Tombol copy link di dashboard dengan notifikasi toast
- **Edit Project** - Tombol edit untuk proyek yang sudah live
- **Template Preview** - Preview full-screen template sebelum memilih di Step 4
- **Toast Notification** - Komponen toast untuk feedback aksi user

### Changed
- Dashboard stats sekarang menampilkan "Sudah Live" bukan "Bulan Ini"
- Proyek live bisa diklik untuk membuka website di tab baru

---

## [1.2.0] - 2024-12-17

### Added
- **Delete Confirmation Modal** - Konfirmasi sebelum hapus proyek dengan UI yang lebih baik
- **Loading Skeleton** - Skeleton loading di dashboard saat memuat data
- **Image Preview Modal** - Klik foto produk di Step 3 untuk melihat full-size
- **Tips Modal** - Tombol Tips di Step 2 sekarang berfungsi dengan panduan foto produk
- **Retry dengan Exponential Backoff** - API calls otomatis retry hingga 3x dengan delay bertambah

### Changed
- Dashboard sekarang menampilkan skeleton saat loading
- Step 3 menampilkan preview foto produk yang bisa di-zoom

---

## [1.0.0] - 2024-12-17

### 🎉 Initial Release

#### Added
- **PWA Dashboard** dengan Astro + React Islands
- **5-Step Wizard** untuk membuat landing page UMKM
- **AI Content Generation** dengan Google Gemini API
- **Groq API Fallback** ketika Gemini rate limited
- **3 Landing Page Templates** (Simple, Warm, Modern)
- **4 Color Themes** (Green, Blue, Amber, Pink)
- **WhatsApp CTA** dengan format Indonesia (+62)
- **PWA Support** (install prompt, offline indicator)
- **Auto-save** form data ke localStorage
- **Project Management** (create, edit, delete drafts)

#### Technical
- Astro 5.x dengan `output: 'server'`
- React 19 untuk interactive islands
- Tailwind CSS untuk styling
- @vite-pwa/astro untuk PWA
- Cloudflare Pages deployment

---

## [1.1.0] - 2024-12-17

### Added
- **Image Compression** - Compress foto produk client-side sebelum kirim ke AI API
  - Target size: < 500KB
  - Max dimensions: 1200x1200px
  - Menampilkan ukuran file setelah compress
  - Loading state saat compress

### Changed
- Step 2 sekarang menampilkan ukuran file gambar yang sudah dioptimalkan

---

## [1.0.2] - 2024-12-17

### Fixed
- **False Offline Page** - Disable `navigateFallback` di PWA config untuk mencegah halaman offline muncul padahal koneksi ada
- Bug ini menyebabkan `/create/step-*` menampilkan "Kamu Sedang Offline" di mobile padahal online

---

## [1.0.1] - 2024-12-17

### Fixed
- **Astro Config** - Ubah `output: 'hybrid'` ke `output: 'server'` untuk kompatibilitas Astro 5.x
- **Network Detection** - Perbaiki false offline indicator dengan actual connectivity check
- **Install Prompt** - Tampilkan langsung tanpa delay 30 detik

### Changed
- WhatsApp link format dengan prefix +62 untuk nomor Indonesia

---

## [Unreleased]

### Planned
- [ ] Real deployment ke Cloudflare Pages (bukan simulasi)
- [ ] Image optimization dengan astro:assets
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Template marketplace

---

## Version History

| Version | Date       | Description                    |
|---------|------------|--------------------------------|
| 1.7.0   | 2024-12-20 | Cloudflare D1 database migration |
| 1.6.0   | 2024-12-19 | URL shortener with clck.ru     |
| 1.5.0   | 2024-12-18 | Real landing page deployment   |
| 1.4.0   | 2024-12-18 | Fix Cloudflare env for AI API  |
| 1.3.1   | 2024-12-18 | FAB position fix & text updates|
| 1.3.0   | 2024-12-18 | Dashboard enhancements         |
| 1.2.0   | 2024-12-17 | UX improvements bundle         |
| 1.1.0   | 2024-12-17 | Image compression feature      |
| 1.0.2   | 2024-12-17 | Fix false offline page on mobile |
| 1.0.1   | 2024-12-17 | Bug fixes & improvements       |
| 1.0.0   | 2024-12-17 | Initial release                |

---

## How to Update Version

1. Update version di `package.json`
2. Tambahkan entry baru di CHANGELOG.md
3. Commit dengan message: `chore: bump version to x.x.x`
4. Tag release: `git tag -a v1.0.1 -m "Version 1.0.1"`
5. Push: `git push origin main --tags`
