import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAllDocuments } from "@/lib/ai/gemini";
import { DocType, ProjectFormData } from "@/types";

export async function POST(req: Request) {
  try {
    const body: ProjectFormData & { collection?: string } = await req.json();
    const projectName = body.name?.trim();

    if (!projectName || !body.summary || !body.problemStatement || !body.targetUser || body.features.length === 0) {
      return NextResponse.json({ error: "Seluruh field wajib harus diisi." }, { status: 400 });
    }

    const existingProject = await prisma.project.findFirst({
      where: { name: { equals: projectName, mode: "insensitive" } },
    });
    if (existingProject) {
      return NextResponse.json({ error: `Proyek dengan nama "${projectName}" sudah ada.` }, { status: 400 });
    }

    const collectionConflict = await prisma.collection.findFirst({
      where: { name: { equals: projectName, mode: "insensitive" } },
    });
    if (collectionConflict) {
      return NextResponse.json({ error: `Nama "${projectName}" sudah digunakan sebagai nama Collection.` }, { status: 400 });
    }

    let devUser = await prisma.user.findFirst();
    if (!devUser) {
      devUser = await prisma.user.create({
        data: { email: "developer@vibe.local", passwordHash: "dev-bypass" },
      });
    }

    const targetCollection = body.collection?.trim() || "General";
    await prisma.collection.upsert({
      where: { name: targetCollection },
      update: {},
      create: { name: targetCollection },
    });

    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const project = await prisma.project.create({
      data: {
        userId: devUser.id,
        name: projectName,
        slug: `${slug}-${Date.now()}`,
        summary: body.summary,
        collection: targetCollection,
        input: {
          create: {
            problemStatement: body.problemStatement,
            targetUser: body.targetUser,
            goals: body.goals,
            features: body.features,
            techStack: body.techStack,
            rawJson: body as unknown as object,
          },
        },
      },
    });

    const docs = await generateAllDocuments(body);
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
        prisma.generatedDoc.create({
          data: { projectId: project.id, type: doc.type, contentMarkdown: doc.content },
        })
      )
    );

    return NextResponse.json({ success: true, projectId: project.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
