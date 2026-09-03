import ProjectList from "@/components/project-list";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 sm:p-10 bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Vibe Coder Toolkit
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Kompilasi spesifikasi dan starter kit dokumentasi AI siap pakai.
          </p>
        </header>
        <ProjectList />
      </div>
    </main>
  );
}
