import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { authOptions } from '@/lib/auth';

/**
 * Uploads a dish photo and returns its public URL, which the admin UI then
 * saves onto the MenuItem's imageUrl field via PATCH /api/menu/[id].
 *
 * Requires BLOB_READ_WRITE_TOKEN — automatically provided when you attach
 * a Vercel Blob store to your project (Vercel dashboard → Storage → Create
 * Database → Blob). Without it, this route returns a clear error rather
 * than failing silently; the admin form falls back to a plain "paste an
 * image URL" field either way, so photo support never blocks menu editing.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'MANAGER') {
    return NextResponse.json({ error: 'Only managers can upload dish photos.' }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Photo uploads aren\u2019t configured yet. Attach a Vercel Blob store, or paste an image URL instead.' },
      { status: 501 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed.' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 });
  }

  const blob = await put(`dishes/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
