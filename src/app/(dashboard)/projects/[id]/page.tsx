import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import WorkspaceView from "@/components/workspace-view";
interface PageProps {
  params: Promise<{ id: string }>;
}
export default async function ProjectWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { documents: true, input: true },
  });
  if (!project) notFound();
  return <WorkspaceView initialProject={project} />;
}
