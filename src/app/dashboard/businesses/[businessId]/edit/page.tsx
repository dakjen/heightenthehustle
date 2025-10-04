import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EditBusinessProfileDataFetcher from './EditBusinessProfileDataFetcher';

interface BusinessEditPageProps {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function Page({ params: paramsPromise }: BusinessEditPageProps) {
  const params = await paramsPromise; // Await the params promise
  const { user } = await validateRequest();

  if (!user) {
    redirect('/login');
  }

  return <EditBusinessProfileDataFetcher businessId={params.businessId} />;
}
