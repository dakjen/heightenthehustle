import EditBusinessProfileDataFetcher from "./EditBusinessProfileDataFetcher";

interface BusinessEditPageProps {
  params: {
    businessId: string;
  };
}

export default async function Page({ params }: BusinessEditPageProps) {
  return <EditBusinessProfileDataFetcher params={params} />;
}
