import { notFound } from "next/navigation";
import { getPitchCompetitionEntryById } from "../../actions";
import ProjectDetailClientPage from "./ProjectDetailClientPage";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params: paramsPromise }: ProjectDetailPageProps) {
  const params = await paramsPromise; // Await the params promise
  const projectId = parseInt(params.projectId);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getPitchCompetitionEntryById(projectId);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClientPage project={project} />;
}
