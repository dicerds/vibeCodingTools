import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.generatedDoc.deleteMany({ where: { projectId: id } });
    await prisma.projectFile.deleteMany({ where: { projectId: id } });
    await prisma.projectInput.deleteMany({ where: { projectId: id } });
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, summary, collection, status, problemStatement, targetUser, goals, features, techStack } = body;

    if (name !== undefined) {
      const cleanName = name.trim();
      if (!cleanName) return NextResponse.json({ error: "Nama proyek tidak boleh kosong." }, { status: 400 });
      const projectConflict = await prisma.project.findFirst({
        where: { name: { equals: cleanName, mode: "insensitive" }, NOT: { id } },
      });
      if (projectConflict) {
        return NextResponse.json({ error: `Proyek dengan nama "${cleanName}" sudah ada.` }, { status: 400 });
      }
      const collectionConflict = await prisma.collection.findFirst({
        where: { name: { equals: cleanName, mode: "insensitive" } },
      });
      if (collectionConflict) {
        return NextResponse.json({ error: `Nama "${cleanName}" sudah digunakan sebagai nama Collection.` }, { status: 400 });
      }
    }

    if (collection !== undefined) {
      const cleanCol = collection.trim() || "General";
      const projectConflict = await prisma.project.findFirst({
        where: { name: { equals: cleanCol, mode: "insensitive" }, NOT: { id } },
      });
      if (projectConflict) {
        return NextResponse.json({ error: `Nama collection "${cleanCol}" bertabrakan dengan nama proyek yang ada.` }, { status: 400 });
      }
      await prisma.collection.upsert({
        where: { name: cleanCol },
        update: {},
        create: { name: cleanCol },
      });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (summary !== undefined) dataToUpdate.summary = summary;
    if (collection !== undefined) dataToUpdate.collection = collection.trim() || "General";
    if (status !== undefined) {
      dataToUpdate.status = status;
      dataToUpdate.deletedAt = status === "TRASHED" ? new Date() : null;
    }
    if (problemStatement !== undefined || targetUser !== undefined || features !== undefined) {
      dataToUpdate.input = {
        upsert: {
          create: { problemStatement: problemStatement || "", targetUser: targetUser || "", goals: goals || [], features: features || [], techStack },
          update: { problemStatement: problemStatement || "", targetUser: targetUser || "", goals: goals || [], features: features || [], techStack },
        },
      };
    }
    const updated = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      include: { input: true, documents: true },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
