import EditBusinessProfileDataFetcher from "./EditBusinessProfileDataFetcher";

interface BusinessEditPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function Page({ params: paramsPromise }: BusinessEditPageProps) {
  const params = await paramsPromise; // Await the params promise
  return <div>Editing Business: {params.businessId}</div>;
}
