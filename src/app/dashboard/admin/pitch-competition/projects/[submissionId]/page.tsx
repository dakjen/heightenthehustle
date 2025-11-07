import { notFound } from "next/navigation";
import { getSubmissionById } from "../../server-actions";
import SubmissionDetailClientPage from "./SubmissionDetailClientPage"; // Renamed from ProjectDetailClientPage

interface SubmissionDetailPageProps {
  params: {
    projectId: string;
  };
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const submissionId = parseInt(params.projectId);

  if (isNaN(submissionId)) {
    notFound();
  }

  const submission = await getSubmissionById(submissionId);

  if (!submission) {
    notFound();
  }

  return <SubmissionDetailClientPage submission={submission} />;
}
