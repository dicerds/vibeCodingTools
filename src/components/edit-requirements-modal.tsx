"use client";
import React, { useState, useEffect } from "react";

interface EditRequirementsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditRequirementsModal({ project, isOpen, onClose, onSaved }: EditRequirementsModalProps) {
  const [name, setName] = useState(project.name || "");
  const [summary, setSummary] = useState(project.summary || "");
  const [collection, setCollection] = useState(project.collection || "General");
  const [availableCollections, setAvailableCollections] = useState<string[]>(["General"]);
  const [problemStatement, setProblemStatement] = useState(project.input?.problemStatement || "");
  const [targetUser, setTargetUser] = useState(project.input?.targetUser || "");
  const [featuresText, setFeaturesText] = useState((project.input?.features || []).join("\n"));
  const [techStack, setTechStack] = useState(project.input?.techStack || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerate, setRegenerate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/collections")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) setAvailableCollections(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    const parsedFeatures = featuresText.split("\n").map((f) => f.trim()).filter((f) => f.length > 0);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
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
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");
      if (regenerate) {
        await fetch(`/api/projects/${project.id}/regenerate`, { method: "POST" });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={() => !loading && handleSave()} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl cursor-default space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">Edit Requirements Proyek</h2>
          <span className="text-[11px] text-slate-500">Klik luar kotak untuk auto-save</span>
        </div>
        {error && (
          <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nama Proyek *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          
          <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-medium">Collection</label>
              <span className="text-[11px] text-slate-500">Pilih dari tombol atau ketik baru</span>
            </div>
            <input value={collection} onChange={(e) => setCollection(e.target.value)} placeholder="General" className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
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
            <label className="block text-slate-300 font-medium mb-1">Ringkasan Proyek</label>
            <input required value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Problem Statement</label>
            <textarea required rows={3} value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target Pengguna</label>
            <input required value={targetUser} onChange={(e) => setTargetUser(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Fitur Utama <span className="text-slate-500 text-xs font-normal">(satu baris per fitur)</span></label>
            <textarea required rows={4} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tech Stack</label>
            <input value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="pt-2 flex items-center gap-2">
            <input type="checkbox" id="regenCheck" checked={regenerate} onChange={(e) => setRegenerate(e.target.checked)} className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="regenCheck" className="text-slate-300 text-xs cursor-pointer">Generate ulang 7 berkas .md dengan data baru</label>
          </div>
          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">Batal</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition disabled:opacity-50">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
