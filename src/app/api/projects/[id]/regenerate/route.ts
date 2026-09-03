import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllDocuments } from "@/lib/ai/gemini";
import { DocType } from "@/types";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { input: true },
    });
    if (!project || !project.input) {
      return NextResponse.json({ error: "Proyek tidak ditemukan." }, { status: 404 });
    }
    const docs = await generateAllDocuments({
      name: project.name,
      summary: project.summary || "",
      problemStatement: project.input.problemStatement,
      targetUser: project.input.targetUser,
      goals: project.input.goals,
      features: project.input.features,
      techStack: project.input.techStack || undefined,
    });
    const docEntries: { type: DocType; content: string }[] = [
      { type: "PRD", content: docs.PRD },
      { type: "AGENTS", content: docs.AGENTS },
      { type: "ARCHITECTURE", content: docs.ARCHITECTURE },
      { type: "TODO", content: docs.TODO },
      { type: "SKILL", content: docs.SKILL },
      { type: "WORKFLOW", content: docs.WORKFLOW },
      { type: "README", content: docs.README },
    ];
    await Promise.all(
      docEntries.map((doc) =>
        prisma.generatedDoc.upsert({
          where: { projectId_type: { projectId: project.id, type: doc.type } },
          update: { contentMarkdown: doc.content, updatedAt: new Date() },
          create: { projectId: project.id, type: doc.type, contentMarkdown: doc.content },
        })
      )
    );
    await prisma.project.update({ where: { id }, data: { updatedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
