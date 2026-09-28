import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';
import { checkUpload, uploadPublicFile, MATERIAL_MAX_BYTES } from '@/lib/uploads';

/**
 * Upload a class syllabus.
 *
 * The only caller is the admin class editor (SyllabusUploadInput), so this
 * needs the classes permission — it is not a general-purpose file drop. The
 * blob key is built server-side from the caller's id; the client only gets to
 * suggest a display name.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let user;
  try {
    user = await requirePermission('canManageClasses');
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Filename and file body are required' }, { status: 400 });
  }

  // Reject oversized uploads before reading the body when the client declares a length.
  const declaredLength = Number(request.headers.get('content-length') ?? '0');
  if (declaredLength > MATERIAL_MAX_BYTES) {
    return NextResponse.json({ error: 'File must be 10 MB or smaller.' }, { status: 413 });
  }

  try {
    const bytes = await request.arrayBuffer();
    const file = new File([bytes], filename, {
      type: request.headers.get('content-type') || 'application/octet-stream',
    });

    const problem = checkUpload(file, 'material');
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const url = await uploadPublicFile(file, 'class-syllabi', user.id);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
