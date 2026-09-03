"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import DocCard from "./doc-card";
import EditRequirementsModal from "./edit-requirements-modal";

export default function WorkspaceView({ initialProject }: { initialProject: any }) {
  const [project, setProject] = useState(initialProject);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenModal, setRegenModal] = useState(false);

  const refreshProject = async () => {
    const res = await fetch(`/api/projects?q=${encodeURIComponent(project.name)}`);
    const data = await res.json();
    const current = (data.projects || []).find((p: any) => p.id === project.id);
    if (current) setProject(current);
  };

  useEffect(() => {
    if (!regenModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRegenerateAll();
      } else if (e.key === "Escape") {
        setRegenModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [regenModal]);

  const handleRegenerateAll = async () => {
    setRegenModal(false);
    setIsRegenerating(true);
    try {
      await fetch(`/api/projects/${project.id}/regenerate`, { method: "POST" });
      await refreshProject();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-6 sm:p-10 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Kembali ke Dashboard Proyek
          </Link>
          <button onClick={() => window.location.reload()} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Refresh Halaman
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                {project.collection || "General"}
              </span>
            </div>
            <h1 onClick={() => window.location.reload()} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight cursor-pointer hover:text-indigo-300 transition" title="Klik untuk refresh">{project.name}</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">{project.summary}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => setIsEditModalOpen(true)} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition">
              Edit Requirements
            </button>
            <button onClick={() => setRegenModal(true)} disabled={isRegenerating} className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition disabled:opacity-50">
              {isRegenerating ? "Memperbarui Dokumen..." : "Regenerate Semua .md"}
            </button>
            <a href={`/api/projects/${project.id}/download`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              Unduh .ZIP
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {project.documents?.map((doc: any) => (
            <DocCard key={doc.id} projectId={project.id} doc={doc} onUpdated={refreshProject} />
          ))}
        </div>
      </div>
      {regenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <div className="p-2 bg-indigo-950/60 border border-indigo-800/60 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              </div>
              <h3 className="text-base font-bold text-white">Regenerate Dokumen?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan meng-generate ulang ke-7 berkas Markdown berdasarkan spesifikasi requirements saat ini. Modifikasi teks manual sebelumnya akan ditimpa.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setRegenModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">
                Batal (Esc)
              </button>
              <button autoFocus onClick={handleRegenerateAll} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                Ya, Generate Ulang (Enter)
              </button>
            </div>
          </div>
        </div>
      )}
      <EditRequirementsModal project={project} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSaved={refreshProject} />
    </main>
  );
}
