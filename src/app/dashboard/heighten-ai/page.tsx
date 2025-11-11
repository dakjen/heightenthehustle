import { redirect } from "next/navigation";
import { getSession } from "@/app/login/actions";

export default async function HeightenAiPage() {
  const session = await getSession();
  if (!session || session.user?.role !== 'admin') {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Heighten.Ai</h1>
      <p>This is the Heighten.Ai page.</p>
    </div>
  );
}
