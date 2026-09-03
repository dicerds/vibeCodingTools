export interface ProjectInputPayload {
  name: string;
  summary: string;
  problemStatement: string;
  targetUser: string;
  goals: string[];
  features: string[];
  techStack?: string;
  constraints?: string;
  workflowTools?: string;
}

export function buildSystemPrompt(): string {
  return `Anda adalah senior software architect dan spesialis technical writer. 
Tugas Anda adalah membuat dokumentasi proyek perangkat lunak berkualitas tinggi, ringkas, dan dapat langsung dipahami oleh AI coding assistant (seperti Claude Code, Cursor, Windsurf).
Patuhi format dokumen standar dan jangan mengarang fitur di luar konteks proyek.`;
}

export function buildDocPrompt(type: string, input: ProjectInputPayload): string {
  return `Buatkan dokumen "${type}.md" berdasarkan spesifikasi proyek berikut:
Nama Proyek: ${input.name}
Ringkasan: ${input.summary}
Problem Statement: ${input.problemStatement}
Target User: ${input.targetUser}
Goals: ${input.goals.join(", ")}
Fitur Utama: ${input.features.join(", ")}
Tech Stack Pilihan: ${input.techStack || "Rekomendasikan yang paling relevan"}
Catatan/Batasan: ${input.constraints || "Standar MVP"}
Preferensi Tool AI: ${input.workflowTools || "Claude Code / Cursor"}

Format dokumen harus mengikuti struktur Markdown baku untuk ${type}.md tanpa awalan percakapan.`;
}
