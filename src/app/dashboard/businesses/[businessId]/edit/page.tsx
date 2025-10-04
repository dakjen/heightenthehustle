import EditBusinessProfileDataFetcher from "./EditBusinessProfileDataFetcher";

export default function EditBusinessProfilePageWrapper({ params }: { params: { businessId: string } }) {
  return <EditBusinessProfileDataFetcher params={params} />;
}
