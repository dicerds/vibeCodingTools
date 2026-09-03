import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { documents: true },
    });
    if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    const archive = archiver("zip", { zlib: { level: 9 } });
    const chunks: Buffer[] = [];
    archive.on("data", (chunk) => chunks.push(chunk));
    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on("end", () => resolve(Buffer.concat(chunks)));
      archive.on("error", reject);
    });
    for (const doc of project.documents) {
      archive.append(doc.contentMarkdown, { name: `${doc.type}.md` });
    }
    await archive.finalize();
    const zipBuffer = await zipPromise;
    const cleanName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 24) || "project";
    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${cleanName}-docs.zip"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
