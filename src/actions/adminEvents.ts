'use server';

import { revalidatePath } from 'next/cache';
import { adminRequest, type ActionResult } from '@/lib/adminAction';

// Each action returns { ok, error } rather than throwing (see lib/adminAction.ts), and only
// refreshes the pages when the change went through.

// Pause (published: false) or publish (published: true) an event. Paused
// events disappear from every user-facing endpoint.
export async function setEventPublished(id: string, published: boolean): Promise<ActionResult> {
  const r = await adminRequest(`/admin/events/${id}/publish`, {
    method: 'PATCH',
    body: { published },
  });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/events');
    revalidatePath('/manage-rhoddo');
  }
  return r;
}

// Puts an event at the top of the app's list, or back into the normal order.
export async function setEventShowFirst(id: string, showFirst: boolean): Promise<ActionResult> {
  const r = await adminRequest(`/admin/events/${id}/show-first`, { method: 'PATCH', body: { showFirst } });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/events');
  }
  return r;
}

// Every host event is reviewed once. Approving sets Rhoddo's commission for it.
export async function reviewEvent(
  id: string,
  review: { decision: 'approved'; commissionPercent: number } | { decision: 'rejected' },
): Promise<ActionResult> {
  const r = await adminRequest(`/admin/events/${id}/review`, { method: 'PUT', body: review });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/events');
    revalidatePath('/manage-rhoddo');
  }
  return r;
}

// Changes an approved event's commission. Bookings already made keep their fee.
export async function setEventCommission(id: string, commissionPercent: number): Promise<ActionResult> {
  const r = await adminRequest(`/admin/events/${id}/commission`, { method: 'PUT', body: { commissionPercent } });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/events');
  }
  return r;
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  const r = await adminRequest(`/admin/events/${id}`, { method: 'DELETE' });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/events');
    revalidatePath('/manage-rhoddo');
  }
  return r;
}
