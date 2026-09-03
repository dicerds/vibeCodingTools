# PRD: Vibe Coder Toolkit

## Problem Statement
Vibe coder sering memulai proyek langsung dengan AI coding assistant tanpa dokumen rujukan yang jelas, menyebabkan AI kehilangan konteks antar sesi dan file referensi tercecer.

## Goals
- Mempercepat project bootstrapping dari jam/hari ke hitungan menit.
- Menghasilkan 6 file .md standar yang tool-agnostic (Claude Code, Cursor, Windsurf).
- Menyediakan workspace terpusat untuk berkas teks/kode dan hasil unduhan ZIP.

## Target Users
- Primary: Vibe coder, solo/indie hacker, mahasiswa, dan builder berbasis AI assistant.
- Secondary: Technical Founder / PM-Engineer proyek skala kecil.

## Scope
- In Scope: Auth (email/password), CRUD project, form terstruktur, generate 6 berkas .md via LLM, workspace viewer, filter ekstensi file, download ZIP, self-host deployment.
- Out of Scope: IDE di browser, version control/git diff, media processing berat (video/audio), kolaborasi multi-user (v1).
