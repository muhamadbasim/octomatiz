# Changelog

Semua perubahan penting pada project OCTOmatiz akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini menggunakan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
