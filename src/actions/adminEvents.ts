'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

async function adminJson(path: string, init: { method: string; body?: unknown }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) throw new Error('Not signed in');

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

// Pause (published: false) or publish (published: true) an event. Paused
// events disappear from every user-facing endpoint.
export async function setEventPublished(id: string, published: boolean) {
  await adminJson(`/admin/events/${id}/publish`, {
    method: 'PATCH',
    body: { published },
  });
  revalidatePath('/manage-rhoddo/events');
  revalidatePath('/manage-rhoddo');
}

export async function deleteEvent(id: string) {
  await adminJson(`/admin/events/${id}`, { method: 'DELETE' });
  revalidatePath('/manage-rhoddo/events');
  revalidatePath('/manage-rhoddo');
}
