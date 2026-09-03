"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [collection, setCollection] = useState("General");
  const [availableCollections, setAvailableCollections] = useState<string[]>(["General"]);
  const [problemStatement, setProblemStatement] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [techStack, setTechStack] = useState("");

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableCollections(data);
        }
      })
      .catch(() => {});
  }, []);

  const outputFiles = [
    { name: "PRD.md", desc: "Spesifikasi problem, target user, persona, scope, dan functional requirements." },
    { name: "architecture.md", desc: "Arsitektur sistem, tech stack terintegrasi, skema data, dan request flow." },
    { name: "agents.md", desc: "System rules, coding conventions, do's & don'ts untuk AI agent." },
    { name: "TODO.md", desc: "Roadmap milestone implementasi berurutan yang siap dieksekusi task demi task." },
    { name: "skill.md", desc: "Definisi kemampuan & instruksi spesifik domain proyek untuk AI assistant." },
    { name: "workflow.md", desc: "Alur kerja development harian, pengujian lokal, dan checklist sebelum commit." },
    { name: "README.md", desc: "File root repo lengkap dengan struktur folder tree sesuai tech stack & panduan run." },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const parsedFeatures = featuresText.split("\n").map((f) => f.trim()).filter((f) => f.length > 0);
    if (parsedFeatures.length === 0) {
      setError("Isi minimal 1 fitur utama.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          summary,
          collection: collection.trim() || "General",
          problemStatement,
          targetUser,
          goals: [summary],
          features: parsedFeatures,
          techStack,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat dokumen.");
      router.push(`/projects/${data.projectId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 font-medium transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Kembali ke Dashboard Proyek
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Kickstart Proyek Baru</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Lengkapi spesifikasi untuk generate 7 dokumen starter kit terstandar.</p>
            </div>
            <Link href="/" className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition">
              Batal
            </Link>
          </div>
          {error && <div className="p-3 mb-6 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-lg">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Nama Proyek *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="contoh: ShopLite — Toko Online Sederhana" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" />
            </div>
            
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-medium">Collection / Topik</label>
                <span className="text-[11px] text-slate-500">Pilih daftar atau ketik nama baru</span>
              </div>
              <input 
                value={collection} 
                onChange={(e) => setCollection(e.target.value)} 
                placeholder="Pilih dari tombol di bawah atau ketik langsung..." 
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" 
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Tersedia:</span>
                {availableCollections.map((col) => {
                  const isSelected = collection.trim().toLowerCase() === col.toLowerCase();
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setCollection(col)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-500 text-white font-semibold shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {col}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Elevator Pitch / Ringkasan Singkat *</label>
              <input required value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Platform e-commerce ringan untuk UMKM yang ingin jualan online tanpa ribet..." className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Problem Statement *</label>
              <textarea required rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} placeholder="UMKM sering kesulitan jualan online karena platform besar terlalu rumit..." className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Pengguna *</label>
              <input required value={targetUser} onChange={(e) => setTargetUser(e.target.value)} placeholder="Pemilik UMKM, penjual online skala kecil-menengah, dan pembeli individu" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Fitur Utama * <span className="text-slate-500 font-normal text-[11px]">(satu baris per fitur)</span></label>
              <textarea required rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={"Autentikasi dua peran (admin toko dan pembeli)\nKatalog produk dengan filter kategori & pencarian\nManajemen pesanan & status pengiriman"} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none font-mono text-xs transition" />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Pilihan Tech Stack (Opsional)</label>
              <input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="Next.js, Prisma, PostgreSQL, Tailwind CSS" className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none transition" />
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                  <span>Sedang Men-generate 7 Dokumen .md...</span>
                </>
              ) : (
                "Generate 7 Dokumen .md"
              )}
            </button>
          </form>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Output 7 Dokumen Yang Dihasilkan
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Berkas siap pakai yang langsung dipahami oleh AI coding assistant maupun manusia:
              </p>
            </div>
            <div className="space-y-2.5">
              {outputFiles.map((file, idx) => (
                <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition">
                  <div className="text-xs font-mono font-bold text-indigo-400 mb-0.5">{file.name}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{file.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
