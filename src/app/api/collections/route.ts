import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let collections = await prisma.collection.findMany({ orderBy: { createdAt: "asc" } });
    if (collections.length === 0) {
      const defaultCol = await prisma.collection.create({ data: { name: "General" } });
      collections = [defaultCol];
    }
    return NextResponse.json(collections.map((c) => c.name));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const cleanName = name?.trim();
    if (!cleanName) {
      return NextResponse.json({ error: "Nama collection tidak boleh kosong." }, { status: 400 });
    }

    const existingCol = await prisma.collection.findFirst({
      where: { name: { equals: cleanName, mode: "insensitive" } },
    });
    if (existingCol) {
      return NextResponse.json({ error: `Collection "${cleanName}" sudah terdaftar.` }, { status: 400 });
    }

    const projectConflict = await prisma.project.findFirst({
      where: { name: { equals: cleanName, mode: "insensitive" } },
    });
    if (projectConflict) {
      return NextResponse.json({ error: `Nama "${cleanName}" sudah digunakan oleh proyek.` }, { status: 400 });
    }

    const created = await prisma.collection.create({ data: { name: cleanName } });
    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { oldName, newName } = await req.json();
    const cleanNew = newName?.trim();
    if (!oldName || !cleanNew) {
      return NextResponse.json({ error: "Parameter nama tidak valid." }, { status: 400 });
    }

    const existingCol = await prisma.collection.findFirst({
      where: { name: { equals: cleanNew, mode: "insensitive" }, NOT: { name: oldName } },
    });
    if (existingCol) {
      return NextResponse.json({ error: `Collection "${cleanNew}" sudah terdaftar.` }, { status: 400 });
    }

    const projectConflict = await prisma.project.findFirst({
      where: { name: { equals: cleanNew, mode: "insensitive" } },
    });
    if (projectConflict) {
      return NextResponse.json({ error: `Nama "${cleanNew}" sudah digunakan oleh proyek.` }, { status: 400 });
    }

    await prisma.collection.upsert({
      where: { name: oldName },
      update: { name: cleanNew },
      create: { name: cleanNew },
    });

    await prisma.project.updateMany({
      where: { collection: oldName },
      data: { collection: cleanNew },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name || name === "General") {
      return NextResponse.json({ error: "Collection General tidak dapat dihapus." }, { status: 400 });
    }
    await prisma.collection.deleteMany({ where: { name } });
    await prisma.project.updateMany({
      where: { collection: name },
      data: { collection: "General" },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
