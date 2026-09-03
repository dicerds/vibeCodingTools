"use client";
import ProjectList from "@/components/project-list";
export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header onClick={() => window.location.href = "/"} className="cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-6 gap-4 select-none">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-mono font-bold tracking-wider">VIBE</span>
              <span>Vibe Coder Toolkit</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Workspace terpusat dan generator starter kit 7 berkas .md (PRD, Architecture, Agents, TODO, Skill, Workflow, README).
            </p>
          </div>
        </header>
        <section>
          <ProjectList />
        </section>
      </div>
    </main>
  );
}
