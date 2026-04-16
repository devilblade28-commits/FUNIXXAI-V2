---
Task ID: 1
Agent: Main Agent
Task: Audit dan fix kesiapan deploy FunixxAI ke Vercel

Work Log:
- Audit menyeluruh semua file konfigurasi (package.json, next.config.ts, tsconfig.json)
- Review semua API routes (chat, ollama/health, ollama/models)
- Review semua komponen frontend (ChatHeader, ChatArea, ChatMessage, ChatInput, ModelSelector, SettingsDrawer)
- Review Zustand store dan Ollama models
- Identifikasi 7 masalah kritis untuk Vercel deployment
- Fix semua masalah dan jalankan build test

Stage Summary:
- 7 masalah ditemukan dan diperbaiki:
  1. Hapus `output: "standalone"` dari next.config.ts (tidak kompatibel Vercel)
  2. Fix build script dari Docker-style ke standar `next build`
  3. Tambahkan `className="dark"` ke <html> di layout.tsx (dark theme tidak aktif)
  4. Hapus Prisma/SQLite dependency yang tidak terpakai
  5. Set `ignoreBuildErrors: false` di next.config.ts
  6. Buat `.env.example` untuk dokumentasi env vars
  7. Set `reactStrictMode: true` untuk production quality
- Exclude examples/, skills/, upload/, download/, db/ dari TypeScript build
- Clean build berhasil: 0 errors, semua routes terdeteksi dengan benar
- Build output: 1 static page (/), 4 dynamic API routes (/api, /api/chat, /api/ollama/health, /api/ollama/models)
