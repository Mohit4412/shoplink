export async function uploadImage(file: File, folder: 'avatars' | 'logos' | 'products') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'Upload failed');
  }

  return payload.url as string;
}

export async function deleteImage(url: string) {
  const response = await fetch('/api/uploads', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (response.status === 400) {
    return false;
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || 'Unable to delete upload');
  }

  return true;
}
