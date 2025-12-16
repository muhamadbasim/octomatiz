---
inclusion: manual
---

# Git Cheatsheet

## Daily Commands

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

## View History

```bash
# Short log
git log --oneline

# Detailed log
git log

# See what changed in last commit
git show
```

## Rollback Options

### Undo Last Commit (Keep Files)
```bash
git reset --soft HEAD~1
```
Files tetap ada, commit di-undo. Cocok untuk edit ulang.

### Undo Last Commit (Delete Files)
```bash
git reset --hard HEAD~1
```
⚠️ Semua perubahan hilang!

### Rollback ke Commit Tertentu
```bash
git reset --hard <commit-hash>
```
Contoh: `git reset --hard abc1234`

### Revert (Cara Aman)
```bash
git revert HEAD
```
Buat commit baru yang membatalkan commit sebelumnya. History tetap ada.

### Push Setelah Rollback
```bash
git push --force origin main
```

## Branching

```bash
# Buat branch baru
git checkout -b feature/nama-fitur

# Pindah branch
git checkout main

# Merge branch
git merge feature/nama-fitur

# Hapus branch
git branch -d feature/nama-fitur
```

## Undo Changes (Belum Commit)

```bash
# Undo perubahan di satu file
git checkout -- filename.js

# Undo semua perubahan
git checkout -- .

# Unstage file (sudah git add)
git reset HEAD filename.js
```

## Cloudflare Pages Rollback

1. Buka Cloudflare Dashboard → Pages → octomatiz
2. Tab "Deployments"
3. Klik "..." pada deployment yang diinginkan
4. Pilih "Rollback to this deployment"

## Tips

- Commit sering dengan pesan yang jelas
- Selalu `git pull` sebelum mulai kerja
- Gunakan branch untuk fitur baru
- `git status` adalah teman terbaikmu
