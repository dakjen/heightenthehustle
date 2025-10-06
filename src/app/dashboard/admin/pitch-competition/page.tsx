import { getPitchCompetitionEntries, getUsers, getBusinesses } from "./actions";
import AddProjectModal from "./AddProjectModal";
import { db } from "@/db";
import { pitchCompetitions } from "@/db/schema";
import { revalidatePath } from "next/cache";

export default async function PitchCompetitionPage() {
  const entries = await getPitchCompetitionEntries();
  const users = await getUsers();
  const businesses = await getBusinesses();

  async function addProject(project: { userId: string; businessId: string; pitchVideoUrl: string; pitchDeckUrl: string; }) {
    'use server';
    await db.insert(pitchCompetitions).values({
      userId: parseInt(project.userId),
      businessId: parseInt(project.businessId),
      pitchVideoUrl: project.pitchVideoUrl,
      pitchDeckUrl: project.pitchDeckUrl,
    });
    revalidatePath("/dashboard/admin/pitch-competition");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Pitch Competition Management</h1>
        <AddProjectModal users={users} businesses={businesses} onAdd={addProject} />
      </div>
      <div className="mt-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pitch Video
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pitch Deck
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.business.businessName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.pitchVideoUrl && (
                    <a href={entry.pitchVideoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View Video
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.pitchDeckUrl && (
                    <a href={entry.pitchDeckUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900">
                      View Deck
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
