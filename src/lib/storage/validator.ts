// Whitelist ekstensi dokumen teks, kode, dan konfigurasi yang relevan untuk vibe coding
export const ALLOWED_EXTENSIONS = [
  ".md", ".txt", ".json", ".yaml", ".yml", ".env.example", ".csv",
  ".js", ".ts", ".jsx", ".tsx", ".py", ".go", ".rs", ".java", ".rb", ".php", ".html", ".css", ".sql",
  ".toml", ".ini", ".gitignore", "Dockerfile", ".dockerignore"
];

// Blacklist eksplisit untuk file biner dan media berat
export const BLOCKED_EXTENSIONS = [
  ".mp4", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".flac",
  ".iso", ".dmg", ".exe"
];

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateFile(filename: string, sizeBytes: number): { valid: boolean; error?: string } {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `Ukuran file melebihi batas ${MAX_FILE_SIZE_MB}MB.` };
  }

  const lowerName = filename.toLowerCase();
  const isBlocked = BLOCKED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  if (isBlocked) {
    return { valid: false, error: "Tipe file media atau biner tidak diizinkan." };
  }

  const isAllowed = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext) || lowerName === ext.toLowerCase());
  if (!isAllowed) {
    return { valid: false, error: "Format file tidak didukung untuk workspace vibe coding." };
  }

  return { valid: true };
}
