import { notFound } from "next/navigation";
import { getPitchCompetitionEntryById } from "../../actions";
import ProjectDetailClientPage from "./ProjectDetailClientPage";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
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
