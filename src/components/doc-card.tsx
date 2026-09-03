"use client";
import React, { useState } from "react";
interface DocCardProps {
  projectId: string;
  doc: {
    id: string;
    type: string;
    contentMarkdown: string;
    updatedAt: Date | string;
  };
  onUpdated?: () => void;
}
export default function DocCard({ projectId, doc, onUpdated }: DocCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(doc.contentMarkdown);
  const [isSaving, setIsSaving] = useState(false);
  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.type}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/docs/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentMarkdown: content }),
      });
      if (res.ok) {
        setIsEditing(false);
        if (onUpdated) onUpdated();
      }
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-md hover:border-slate-700 transition">
      <div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-indigo-950 text-indigo-400 border border-indigo-800/60 rounded">
            {doc.type}.md
          </span>
          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={isSaving} className="text-xs px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition disabled:opacity-50">
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
                <button onClick={() => { setContent(doc.contentMarkdown); setIsEditing(false); }} className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition">
                  Batal
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition">
                Edit .md
              </button>
            )}
            <button onClick={handleCopy} className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition">
              {copied ? "Tersalin" : "Salin"}
            </button>
            <button onClick={handleDownload} className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded border border-slate-700 font-medium transition">
              Unduh
            </button>
          </div>
        </div>
        {isEditing ? (
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={14} className="w-full text-xs bg-slate-950 p-3 rounded-lg text-slate-200 font-mono border border-indigo-500/50 focus:outline-none focus:border-indigo-400" />
        ) : (
          <pre className="text-xs bg-slate-950/80 p-4 rounded-lg text-slate-300 overflow-x-auto max-h-72 whitespace-pre-wrap font-mono border border-slate-800/80">
            {content}
          </pre>
        )}
      </div>
    </div>
  );
}
