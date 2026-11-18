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

// Puts an event at the top of the app's list, or back into the normal order.
export async function setEventShowFirst(id: string, showFirst: boolean) {
  await adminJson(`/admin/events/${id}/show-first`, { method: 'PATCH', body: { showFirst } });
  revalidatePath('/manage-rhoddo/events');
}

// Every host event is reviewed once. Approving sets Rhoddo's commission for it.
export async function reviewEvent(
  id: string,
  review: { decision: 'approved'; commissionPercent: number } | { decision: 'rejected' },
) {
  await adminJson(`/admin/events/${id}/review`, { method: 'PUT', body: review });
  revalidatePath('/manage-rhoddo/events');
  revalidatePath('/manage-rhoddo');
}

// Changes an approved event's commission. Bookings already made keep their fee.
export async function setEventCommission(id: string, commissionPercent: number) {
  await adminJson(`/admin/events/${id}/commission`, { method: 'PUT', body: { commissionPercent } });
  revalidatePath('/manage-rhoddo/events');
}

export async function deleteEvent(id: string) {
  await adminJson(`/admin/events/${id}`, { method: 'DELETE' });
  revalidatePath('/manage-rhoddo/events');
  revalidatePath('/manage-rhoddo');
}
