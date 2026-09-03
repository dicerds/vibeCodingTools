# Architecture

## Tech Stack
- Frontend & Backend: Next.js (App Router, TypeScript)
- Database: PostgreSQL + Prisma ORM
- Object Storage: MinIO (S3-compatible API)
- Auth: NextAuth.js / Auth.js (JWT Session)
- AI Engine: Anthropic SDK (Claude API)
- Packaging: Docker Compose

## Request Flow
1. User mengisi form spesifikasi proyek di client.
2. Server Action memvalidasi input dan memicu request ke Anthropic LLM.
3. Konten 6 file .md di-generate, disimpan ke MinIO/DB, dan dimuat di Workspace proyek.
