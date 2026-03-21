import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth';
import { isSupabaseEnabled, uploadSupabaseObject } from '@/server/supabase';
import { deleteUploadedAsset } from '@/server/upload-storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  switch (file.type) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
}

export async function POST(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = String(formData.get('folder') ?? 'misc').trim().toLowerCase();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are supported' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/g, '') || 'misc';
  const extension = getExtension(file);
  const filename = `${randomUUID()}.${extension}`;
  const objectPath = `${user.username}/${safeFolder}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isSupabaseEnabled()) {
    const url = await uploadSupabaseObject(objectPath, buffer, file.type || 'image/jpeg');
    return NextResponse.json({ url });
  }

  const relativeDir = path.join('uploads', user.username, safeFolder);
  const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
  const absolutePath = path.join(absoluteDir, filename);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, buffer);

  return NextResponse.json({
    url: `/${relativeDir.replace(/\\/g, '/')}/${filename}`,
  });
}

export async function DELETE(request: NextRequest) {
  const user = await getRequestSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const url = typeof body?.url === 'string' ? body.url : '';
  if (!url) {
    return NextResponse.json({ error: 'Missing upload URL' }, { status: 400 });
  }

  const deleted = await deleteUploadedAsset(user.username, url);
  if (!deleted) {
    return NextResponse.json({ error: 'Upload does not belong to this merchant' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
