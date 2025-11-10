import { notFound } from "next/navigation";
import { getSubmissionById } from "../../server-actions";
import SubmissionDetailClientPage from "./SubmissionDetailClientPage";

interface SubmissionDetailPageProps {
  params: Promise<{ submissionId: string }>;
}

export default async function SubmissionDetailPage({ params: paramsPromise }: SubmissionDetailPageProps) {
  const params = await paramsPromise;
  const submissionId = parseInt(params.submissionId);

  if (isNaN(submissionId)) {
    notFound();
  }

  const submission = await getSubmissionById(submissionId);

  if (!submission) {
    notFound();
  }

  return <SubmissionDetailClientPage submission={submission} />;
}