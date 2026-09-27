import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getSession } from '@/app/login/actions';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename and file body are required' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, { access: 'public' });
    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
