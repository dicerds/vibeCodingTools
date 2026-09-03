# Workflow

## Local Development
1. Salin `.env.example` ke `.env` dan lengkapi konfigurasi API key.
2. Jalankan dependensi container: `docker compose up -d`.
3. Jalankan migrasi database: `npx prisma migrate dev`.
4. Jalankan server lokal: `npm run dev`.

## Commit Checklist
- [ ] Linting & type checking lolos tanpa error (`npm run lint`, `tsc --noEmit`).
- [ ] Verifikasi TODO.md sudah diperbarui sesuai pekerjaan terakhir.
