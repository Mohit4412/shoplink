/**
 * Compress an image file client-side before upload.
 * Resizes to max 1200px on the longest side and converts to JPEG at 85% quality.
 * Skips compression for GIFs (animated) and files already under 200KB.
 */
async function compressImage(file: File): Promise<File> {
  // Skip GIFs and already-small files
  if (file.type === 'image/gif' || file.size < 200 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let { width, height } = img;

      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          // Keep original filename but with .jpg extension
          const name = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], name, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export async function uploadImage(file: File, folder: 'avatars' | 'logos' | 'products') {
  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append('file', compressed);
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
