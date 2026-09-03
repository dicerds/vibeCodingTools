import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const col = searchParams.get("collection") || "";
    const view = searchParams.get("view") || "active";
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    const expiredTrash = await prisma.project.findMany({
      where: { status: "TRASHED", deletedAt: { lt: oneMonthAgo } },
      select: { id: true },
    });
    for (const p of expiredTrash) {
      await prisma.generatedDoc.deleteMany({ where: { projectId: p.id } });
      await prisma.projectFile.deleteMany({ where: { projectId: p.id } });
      await prisma.projectInput.deleteMany({ where: { projectId: p.id } });
      await prisma.project.delete({ where: { id: p.id } });
    }
    const currentStatus = view === "trash" ? "TRASHED" : view === "archive" ? "ARCHIVED" : "ACTIVE";
    const totalCount = await prisma.project.count({
      where: {
        status: currentStatus,
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { summary: { contains: q, mode: "insensitive" } }] } : {}),
      },
    });
    const whereClause: any = { status: currentStatus };
    if (q) {
      whereClause.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
      ];
    }
    if (col && col !== "Semua") {
      whereClause.collection = col;
    }
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: { documents: true, input: true },
      orderBy: { updatedAt: "desc" },
    });
    const dbCollections = await prisma.collection.findMany({ orderBy: { createdAt: "asc" } });
    let allCollections = dbCollections.map((c) => c.name);
    if (!allCollections.includes("General")) {
      await prisma.collection.create({ data: { name: "General" } });
      allCollections.unshift("General");
    }
    return NextResponse.json({ projects, totalCount, allCollections });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE() {
  try {
    const trashed = await prisma.project.findMany({
      where: { status: "TRASHED" },
      select: { id: true },
    });
    for (const p of trashed) {
      await prisma.generatedDoc.deleteMany({ where: { projectId: p.id } });
      await prisma.projectFile.deleteMany({ where: { projectId: p.id } });
      await prisma.projectInput.deleteMany({ where: { projectId: p.id } });
      await prisma.project.delete({ where: { id: p.id } });
    }
    return NextResponse.json({ success: true, count: trashed.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
