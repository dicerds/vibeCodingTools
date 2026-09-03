import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProjectInputPayload } from "./prompts";
export interface AllGeneratedDocs {
  PRD: string;
  AGENTS: string;
  ARCHITECTURE: string;
  TODO: string;
  SKILL: string;
  WORKFLOW: string;
  README: string;
}
function generateFallbackDocs(input: ProjectInputPayload): AllGeneratedDocs {
  const stack = input.techStack || "Next.js, Prisma, PostgreSQL, Tailwind CSS";
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return {
    PRD: `# PRD: ${input.name}\n\n## Problem Statement\n${input.problemStatement}\n\n## Goals\n${input.goals.map((g) => `- ${g}`).join("\n")}\n\n## Target Users\n${input.targetUser}\n\n## Functional Requirements\n${input.features.map((f, i) => `- FR-${i + 1}: ${f}`).join("\n")}\n\n## Non-Functional Requirements\n- Performa tinggi dan persistensi database relasional.\n- Skema modular untuk skalabilitas.\n\n## Scope\n- In Scope: Implementasi fitur dasar (${input.features.join(", ")}).\n- Out of Scope: Fitur enterprise tahap lanjut.`,
    AGENTS: `# Agent Instructions\n\n## Project Context\n${input.name} - ${input.summary}\n\n## Role & Behavior Expectations\n- Senior Software Engineer dengan standar clean code.\n- Patuhi type-safety dan validasi data server-side.\n\n## Tech Stack\n${stack}\n\n## Do's and Don'ts\n- Do: Terapkan penanganan error terpusat.\n- Don't: Menuliskan secret key di repository.`,
    ARCHITECTURE: `# Architecture\n\n## Overview\nArsitektur modular berbasis service layer menghubungkan antarmuka web, API handlers, dan database PostgreSQL.\n\n## Tech Stack\n${stack}\n\n## Struktur Folder\n\`\`\`text\n${slug}/\n├── src/\n│   ├── app/\n│   ├── components/\n│   └── lib/\n├── prisma/\n├── docs/\n└── package.json\n\`\`\`\n\n## Data Model Utama\n- User: Identitas pengguna.\n- Project: Entitas workspace proyek.\n- GeneratedDoc: Berkas markdown persist.\n\n## Alur Data\n1. Klien mengirim permintaan melalui API route.\n2. Server memvalidasi input lalu menyimpan transaksi ke database.`,
    TODO: `# TODO\n\n## Milestone 1: Setup Lingkungan\n- [ ] Konfigurasi repository dan dependensi dasar.\n- [ ] Setup database dan variabel lingkungan.\n\n## Milestone 2: Fitur Utama\n${input.features.map((f) => `- [ ] Implementasi ${f}`).join("\n")}\n\n## Milestone 3: Testing & Produksi\n- [ ] Uji alur sistem end-to-end.\n- [ ] Siapkan file docker-compose produksi.`,
    SKILL: `# Project Skills\n\n## Skill: Component Builder\n- Kapan dipakai: Mengembangkan modul tampilan baru.\n- Instruksi: Gunakan Tailwind CSS modular dan pastikan responsif.\n\n## Skill: Data Validator\n- Kapan dipakai: Menerima payload di API endpoint.\n- Instruksi: Validasi setiap field sebelum memanggil Prisma ORM.`,
    WORKFLOW: `# Workflow\n\n## Alur Pengembangan\n1. Tarik pembaruan git terbaru.\n2. Jalankan docker dan local server dev.\n3. Perbarui TODO.md sesuai tugas yang dikerjakan.\n\n## Checklist Sebelum Commit\n- [ ] Bebas error typescript dan lint.\n- [ ] Dokumentasi TODO.md tersinkronisasi.`,
    README: `# ${input.name}\n\n## Deskripsi Singkat\n${input.summary}\n\n## Fitur Utama\n${input.features.map((f) => `- ${f}`).join("\n")}\n\n## Tech Stack\n${stack}\n\n## Struktur Folder Proyek\n\`\`\`text\n${slug}/\n├── src/\n│   ├── app/              # Routing dan view halaman\n│   ├── components/       # Komponen UI interaktif\n│   └── lib/              # Modul integrasi database dan AI\n├── prisma/               # Skema ORM Prisma\n├── docs/                 # Dokumentasi PRD, architecture, TODO\n├── .env.example          # Salinan template environment variable\n└── package.json\n\`\`\`\n\n## Cara Menjalankan Proyek Secara Lokal\n1. Instalasi dependensi:\n\`\`\`bash\nnpm install\n\`\`\`\n2. Setup berkas lingkungan:\n\`\`\`bash\ncp .env.example .env\n\`\`\`\n3. Sinkronkan skema database:\n\`\`\`bash\nnpx prisma db push\n\`\`\`\n4. Jalankan development server:\n\`\`\`bash\nnpm run dev\n\`\`\`\n\n## Dokumen Terkait\n- PRD.md: Spesifikasi kebutuhan produk\n- architecture.md: Desain arsitektur & struktur folder\n- agents.md: Panduan instruksi untuk AI coding assistant\n- TODO.md: Rencana task pengembangan`
  };
}
export async function generateAllDocuments(input: ProjectInputPayload): Promise<AllGeneratedDocs> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return generateFallbackDocs(input);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });
  const prompt = `Lead Software Architect. Generate 7 Markdown files for:
Name: ${input.name}
Summary: ${input.summary}
Problem: ${input.problemStatement}
Target: ${input.targetUser}
Goals: ${input.goals.join(", ")}
Features: ${input.features.join(", ")}
Stack: ${input.techStack || "Next.js, Prisma, PostgreSQL, Tailwind CSS"}

Return strictly valid JSON with exact keys:
{
  "PRD": "markdown",
  "AGENTS": "markdown",
  "ARCHITECTURE": "markdown",
  "TODO": "markdown",
  "SKILL": "markdown",
  "WORKFLOW": "markdown",
  "README": "markdown with folder structure tree matched to tech stack and run steps"
}`;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed: AllGeneratedDocs = JSON.parse(text);
    if (parsed.PRD && parsed.AGENTS && parsed.ARCHITECTURE && parsed.TODO && parsed.SKILL && parsed.WORKFLOW && parsed.README) {
      return parsed;
    }
    return generateFallbackDocs(input);
  } catch {
    return generateFallbackDocs(input);
  }
}
