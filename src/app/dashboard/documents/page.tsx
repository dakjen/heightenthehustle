import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getAllUserBusinesses } from "../businesses/actions";
import { getMyDocuments } from "./actions";
import { DOCUMENT_KINDS } from "./constants";
import DocumentUploadForm from "./DocumentUploadForm";
import DocumentList from "./DocumentList";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await requireUser();
  if (user.role !== "external") redirect("/dashboard/admin/documents");

  const [docs, businesses] = await Promise.all([getMyDocuments(), getAllUserBusinesses(user.id)]);
  const kindsOnFile = new Set(docs.map((d) => d.kind));

  return (
    <div className="w-full max-w-4xl mx-auto">
      <header className="mb-6 hth-fade-up">
        <p className="text-[#910000] uppercase tracking-[0.3em] text-xs font-semibold mb-2">Secure Documents</p>
        <h1 className="text-5xl text-gray-900 leading-none">Your documents, kept private.</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          W-9s, pitch decks, financials and anything the team needs from you. Files are stored privately and only you and HTH staff can open them.
        </p>
      </header>

      {!kindsOnFile.has("W-9") && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hth-fade-up">
          <strong>Heads up:</strong> we need a W-9 on file before we can send any funding or prize money. Upload it below when you can.
        </div>
      )}

      <div className="hth-fade-up hth-fade-up-delay-1">
        <DocumentUploadForm
          kinds={DOCUMENT_KINDS}
          businesses={businesses.filter((b) => !b.isArchived).map((b) => ({ id: b.id, businessName: b.businessName }))}
        />
      </div>

      <section className="mt-8 hth-fade-up hth-fade-up-delay-2">
        <h2 className="mb-3 text-3xl text-gray-900">On file</h2>
        <DocumentList documents={docs} />
      </section>
    </div>
  );
}
