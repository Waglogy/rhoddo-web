'use client';

// Photos for Image questions in a registration form. The form comes before sign-in, so a
// chosen photo waits here in the browser (as "local:<id>" in the answers) and is uploaded
// just before paying, when the buyer is signed in. The API keeps it private: only the
// event's host and Rhoddo admins can open it.

import { BuyerApiError } from '@/lib/buyerApi';

type Picked = { file: Blob; name: string; preview: string; key?: string };

const picked = new Map<string, Picked>();

export const isLocalImage = (v: unknown): v is string => typeof v === 'string' && v.startsWith('local:');

/** The preview for a chosen photo, for showing it back in the form. None for a PDF. */
export const localImagePreview = (v: unknown) => (isLocalImage(v) ? picked.get(v)?.preview || undefined : undefined);

/** The name of a chosen file, e.g. "consent-signed.pdf". */
export const localFileName = (v: unknown) => (isLocalImage(v) ? picked.get(v)?.name : undefined);

/** Like pickImage, but a PDF is also accepted (for File questions such as a signed consent form). */
export async function pickFile(file: File): Promise<string> {
  if (file.type !== 'application/pdf') {
    if (!file.type.startsWith('image/')) throw new Error('Choose a photo or a PDF');
    return pickImage(file);
  }
  if (file.size > MAX_BYTES) throw new Error('That PDF is too big. Choose one under 8 MB.');
  const id = `local:${crypto.randomUUID()}`;
  picked.set(id, { file, name: file.name, preview: '' });
  return id;
}

const MAX_SIDE = 2000;
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Keeps a chosen photo and returns the value to store in the answers. Big photos are
 * shrunk to at most 2000px as a JPEG, so they upload quickly on mobile data. Formats the
 * browser can't open (e.g. HEIC on most phones' Chrome) are kept as they are.
 */
export async function pickImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif|heic|heif)$/i.test(file.type)) {
    throw new Error('Choose a JPG, PNG, WebP or HEIC photo');
  }
  let blob: Blob = file;
  try {
    blob = await shrink(file);
  } catch {
    // Keep the original.
  }
  if (blob.size > MAX_BYTES) throw new Error('That photo is too big. Choose one under 8 MB.');
  const id = `local:${crypto.randomUUID()}`;
  picked.set(id, { file: blob, name: file.name, preview: URL.createObjectURL(blob) });
  return id;
}

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024 && file.type !== 'image/heic' && file.type !== 'image/heif') {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('shrink failed'))), 'image/jpeg', 0.85),
  );
}

async function upload(item: Picked): Promise<string> {
  const body = new FormData();
  body.append('file', item.file, item.file.type === 'application/pdf' ? 'file.pdf' : 'photo'); // the API names the file itself, from its type
  let res: Response;
  try {
    res = await fetch('/api/backend/me/form-uploads', { method: 'POST', body });
  } catch {
    throw new BuyerApiError('Could not upload your photo. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new BuyerApiError(data?.error || `Photo upload failed (${res.status})`, res.status, data?.code);
  return data.key as string;
}

/** Uploads any photos still in the browser and returns the answers with their saved keys. */
export async function uploadPickedImages<T extends Record<string, unknown>>(answers: T[]): Promise<T[]> {
  const out: T[] = [];
  for (const set of answers) {
    const next: Record<string, unknown> = { ...set };
    for (const [fieldId, v] of Object.entries(set)) {
      if (!isLocalImage(v)) continue;
      const item = picked.get(v);
      if (!item) throw new Error('Please choose your photo again.');
      item.key ??= await upload(item); // a retry doesn't upload the same photo twice
      next[fieldId] = item.key;
    }
    out.push(next as T);
  }
  return out;
}
