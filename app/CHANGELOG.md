# Changelog

Semua perubahan penting pada project OCTOmatiz akan didokumentasikan di file ini.

Format berdasarkan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
dan project ini menggunakan [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
| 1.0.1   | 2024-12-17 | Bug fixes & improvements       |
| 1.0.0   | 2024-12-17 | Initial release                |

---

## How to Update Version

1. Update version di `package.json`
2. Tambahkan entry baru di CHANGELOG.md
3. Commit dengan message: `chore: bump version to x.x.x`
4. Tag release: `git tag -a v1.0.1 -m "Version 1.0.1"`
5. Push: `git push origin main --tags`
