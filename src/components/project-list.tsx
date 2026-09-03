"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import EditRequirementsModal from "./edit-requirements-modal";

export default function ProjectList() {
  const [projects, setProjects] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [collections, setCollections] = useState<string[]>(["General"]);
  const [selectedCollection, setSelectedCollection] = useState("Semua");
  const [view, setView] = useState<"active" | "archive" | "trash">("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedEdit, setSelectedEdit] = useState<any | null>(null);
  const [showAddCol, setShowAddCol] = useState(false);
  const [newCol, setNewCol] = useState("");
  const [editingCol, setEditingCol] = useState<string | null>(null);
  const [renamedCol, setRenamedCol] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string; isPermanent: boolean } | null>(null);
  const [emptyTrashModal, setEmptyTrashModal] = useState(false);
  const [deleteColModal, setDeleteColModal] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("q", search.trim());
      if (selectedCollection !== "Semua") query.set("collection", selectedCollection);
      query.set("view", view);
      const res = await fetch(`/api/projects?${query.toString()}`);
      const data = await res.json();
      if (data.projects) {
        setProjects(data.projects);
        setTotalCount(data.totalCount || 0);
        setCollections(data.allCollections || ["General"]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [search, selectedCollection, view]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (alertError) {
          e.preventDefault();
          setAlertError(null);
        } else if (deleteModal) {
          e.preventDefault();
          confirmExecuteDelete();
        } else if (deleteColModal) {
          e.preventDefault();
          confirmDeleteCollection();
        } else if (emptyTrashModal) {
          e.preventDefault();
          handleEmptyTrash();
        }
      } else if (e.key === "Escape") {
        setAlertError(null);
        setDeleteModal(null);
        setDeleteColModal(null);
        setEmptyTrashModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [alertError, deleteModal, deleteColModal, emptyTrashModal]);

  const handleUpdateStatus = async (id: string, newStatus: "ACTIVE" | "ARCHIVED" | "TRASHED") => {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadProjects();
  };

  const confirmExecuteDelete = async () => {
    if (!deleteModal) return;
    if (deleteModal.isPermanent) {
      await fetch(`/api/projects/${deleteModal.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/projects/${deleteModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TRASHED" }),
      });
    }
    setDeleteModal(null);
    loadProjects();
  };

  const handleEmptyTrash = async () => {
    await fetch("/api/projects", { method: "DELETE" });
    setEmptyTrashModal(false);
    loadProjects();
  };

  const handleAddCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCol.trim();
    if (!clean) return;

    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertError(data.error || "Gagal menambahkan collection.");
        return;
      }
      setSelectedCollection(clean);
      setNewCol("");
      setShowAddCol(false);
      loadProjects();
    } catch {
      setAlertError("Terjadi gangguan koneksi saat menambahkan collection.");
    }
  };

  const handleRenameCollection = async (oldName: string) => {
    const clean = renamedCol.trim();
    if (!clean || clean === oldName) {
      setEditingCol(null);
      return;
    }

    try {
      const res = await fetch("/api/collections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldName, newName: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertError(data.error || "Gagal mengubah nama collection.");
        return;
      }
      if (selectedCollection === oldName) setSelectedCollection(clean);
      setEditingCol(null);
      loadProjects();
    } catch {
      setAlertError("Terjadi gangguan koneksi saat mengubah nama collection.");
    }
  };

  const confirmDeleteCollection = async () => {
    if (!deleteColModal) return;
    try {
      const res = await fetch("/api/collections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: deleteColModal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlertError(data.error || "Gagal menghapus collection.");
        return;
      }
      if (selectedCollection === deleteColModal) setSelectedCollection("Semua");
      setDeleteColModal(null);
      loadProjects();
    } catch {
      setAlertError("Terjadi gangguan koneksi saat menghapus collection.");
    }
  };

  const viewLabels = { active: "Proyek Aktif", archive: "Arsip", trash: "Tong Sampah" };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button onClick={() => { setView("active"); setSelectedCollection("Semua"); }} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${view === "active" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>Proyek Aktif</button>
          <button onClick={() => { setView("archive"); setSelectedCollection("Semua"); }} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${view === "archive" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>Arsip</button>
          <button onClick={() => { setView("trash"); setSelectedCollection("Semua"); }} className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${view === "trash" ? "bg-rose-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>Tong Sampah</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Cari di ${viewLabels[view]}...`} className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition" />
            <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300">✕</button>
            )}
          </div>
          {view === "active" ? (
            <Link href="/projects/new" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition whitespace-nowrap flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Proyek Baru
            </Link>
          ) : view === "trash" && projects.length > 0 ? (
            <button onClick={() => setEmptyTrashModal(true)} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow transition whitespace-nowrap flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Kosongkan Sampah
            </button>
          ) : null}
        </div>
      </div>

      {view === "trash" && (
        <div className="p-3.5 bg-rose-950/30 border border-rose-900/40 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-300">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span>Pemberitahuan Retensi: Jika projek dibuang ke tong sampah ini akan hilang 1 bulan.</span>
          </div>
          {projects.length > 0 && (
            <button onClick={() => setEmptyTrashModal(true)} className="underline hover:text-white font-medium shrink-0">Hapus Semua</button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Collection:</span>
        <button onClick={() => setSelectedCollection("Semua")} className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${selectedCollection === "Semua" ? "bg-slate-100 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"}`}>
          Semua ({totalCount})
        </button>
        {collections.map((col) => (
          <div key={col} className="relative flex items-center group/col shrink-0">
            {editingCol === col ? (
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-indigo-500 rounded-lg">
                <input autoFocus value={renamedCol} onChange={(e) => setRenamedCol(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleRenameCollection(col); else if (e.key === "Escape") setEditingCol(null); }} className="text-xs px-2 py-0.5 bg-transparent text-white focus:outline-none w-24" />
                <button onClick={() => handleRenameCollection(col)} className="text-[11px] px-2 py-0.5 bg-indigo-600 text-white rounded">Simpan</button>
                <button onClick={() => setEditingCol(null)} className="text-[11px] px-1 text-slate-400 hover:text-white">✕</button>
              </div>
            ) : (
              <div className={`flex items-center rounded-lg border transition ${selectedCollection === col ? "bg-indigo-600 border-indigo-500 text-white font-semibold" : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                <button onClick={() => setSelectedCollection(col)} className="text-xs px-3 py-1.5 whitespace-nowrap">{col}</button>
                {col !== "General" && (
                  <div className="flex items-center pr-1.5 opacity-0 group-hover/col:opacity-100 transition gap-1">
                    <button onClick={() => { setEditingCol(col); setRenamedCol(col); }} className="hover:text-white text-[10px]" title="Ubah nama">✎</button>
                    <button onClick={() => setDeleteColModal(col)} className="hover:text-rose-300 text-[10px]" title="Hapus collection">✕</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {showAddCol ? (
          <form onSubmit={handleAddCollection} className="flex items-center gap-1.5 shrink-0">
            <input autoFocus value={newCol} onChange={(e) => setNewCol(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setShowAddCol(false); }} placeholder="Nama label..." className="text-xs px-3 py-1.5 bg-slate-950 border border-indigo-500 rounded-lg text-white focus:outline-none" />
            <button type="submit" className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500">Simpan</button>
            <button type="button" onClick={() => setShowAddCol(false)} className="text-xs px-2 py-1.5 text-slate-400 hover:text-slate-200">Batal</button>
          </form>
        ) : (
          <button onClick={() => setShowAddCol(true)} className="text-xs px-3 py-1.5 rounded-lg font-medium transition bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 shrink-0">+ Collection</button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
          <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
          <span className="text-xs">Memuat katalog proyek...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 max-w-lg mx-auto">
          {search.trim() ? (
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Tidak ditemukan</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tidak ada nama proyek yang cocok dengan kata kunci <span className="text-indigo-400 font-mono font-medium">"{search}"</span> di dalam <span className="text-slate-200 font-medium">{viewLabels[view]}</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {view === "trash" ? "Tong sampah kosong. Jika projek dibuang ke tong sampah ini akan hilang 1 bulan." : view === "archive" ? "Belum ada proyek yang diarsipkan." : `Belum ada proyek di collection "${selectedCollection}".`}
              </p>
              {view === "active" && (
                <Link href="/projects/new" className="inline-block mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300">Buat proyek baru sekarang →</Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div key={project.id} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition hover:shadow-md group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-indigo-300 border border-slate-700/60 inline-block mb-1.5">{project.collection || "General"}</span>
                    <Link href={`/projects/${project.id}`} className="block text-base font-bold text-white group-hover:text-indigo-400 transition truncate">{project.name}</Link>
                  </div>
                  <span className="text-[10px] font-medium px-2.5 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-md shrink-0 whitespace-nowrap">
                    {project.documents?.length || 7} berkas .md lengkap
                  </span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">{project.summary || "Tidak ada rincian ringkasan."}</p>
                <div className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span>{new Date(project.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-800/80 text-xs">
                {view === "trash" ? (
                  <>
                    <button onClick={() => handleUpdateStatus(project.id, "ACTIVE")} className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      Pulihkan
                    </button>
                    <button onClick={() => setDeleteModal({ id: project.id, name: project.name, isPermanent: true })} className="text-rose-400 hover:text-rose-300 font-medium">Hapus Permanen</button>
                  </>
                ) : view === "archive" ? (
                  <>
                    <Link href={`/projects/${project.id}`} className="text-indigo-400 hover:text-indigo-300 font-semibold">Workspace →</Link>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleUpdateStatus(project.id, "ACTIVE")} className="text-slate-400 hover:text-white">Aktifkan</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => setDeleteModal({ id: project.id, name: project.name, isPermanent: false })} className="text-rose-400 hover:text-rose-300">Sampah</button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href={`/projects/${project.id}`} className="text-indigo-400 hover:text-indigo-300 font-semibold">Workspace →</Link>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedEdit(project)} className="text-slate-400 hover:text-white">Edit</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => handleUpdateStatus(project.id, "ARCHIVED")} className="text-amber-400 hover:text-amber-300">Arsipkan</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => setDeleteModal({ id: project.id, name: project.name, isPermanent: false })} className="text-rose-400 hover:text-rose-300">Hapus</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {alertError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2 bg-amber-950/60 border border-amber-800/60 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-base font-bold text-white">Pemberitahuan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {alertError}
            </p>
            <div className="flex justify-end pt-2">
              <button autoFocus onClick={() => setAlertError(null)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                Mengerti (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <h3 className="text-base font-bold text-white">Konfirmasi Penghapusan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {deleteModal.isPermanent
                ? `Apakah Anda yakin ingin menghapus permanen proyek "${deleteModal.name}"? Seluruh berkas .md di dalamnya akan terhapus dan tidak dapat dipulihkan lagi.`
                : `Apakah Anda yakin ingin memindahkan proyek "${deleteModal.name}" ke Tong Sampah? Proyek akan otomatis terhapus permanen setelah 1 bulan.`}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setDeleteModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">
                Batal (Esc)
              </button>
              <button autoFocus onClick={confirmExecuteDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition focus:ring-2 focus:ring-rose-400 focus:outline-none">
                {deleteModal.isPermanent ? "Ya, Hapus Permanen (Enter)" : "Ya, Pindahkan ke Sampah (Enter)"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteColModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h3 className="text-base font-bold text-white">Hapus Collection</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus collection <span className="text-indigo-400 font-semibold">"{deleteColModal}"</span>? Seluruh proyek di dalamnya akan otomatis dialihkan ke kategori <strong>General</strong>.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setDeleteColModal(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">
                Batal (Esc)
              </button>
              <button autoFocus onClick={confirmDeleteCollection} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition focus:ring-2 focus:ring-rose-400 focus:outline-none">
                Ya, Hapus Collection (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {emptyTrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-950/60 border border-rose-800/60 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </div>
              <h3 className="text-base font-bold text-white">Kosongkan Seluruh Tong Sampah?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan menghapus permanen semua proyek yang saat ini ada di dalam tong sampah beserta seluruh file .md mereka. Tindakan ini <span className="text-rose-400 font-semibold">tidak dapat dibatalkan</span>.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button onClick={() => setEmptyTrashModal(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition">
                Batal (Esc)
              </button>
              <button autoFocus onClick={handleEmptyTrash} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow transition focus:ring-2 focus:ring-rose-400 focus:outline-none">
                Ya, Hapus Semuanya (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEdit && (
        <EditRequirementsModal project={selectedEdit} isOpen={true} onClose={() => setSelectedEdit(null)} onSaved={loadProjects} />
      )}
    </div>
  );
}
