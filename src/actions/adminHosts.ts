'use server';

import { revalidatePath } from 'next/cache';
import { adminRequest, type ActionResult } from '@/lib/adminAction';

// Each action returns { ok, error } rather than throwing (see lib/adminAction.ts), and only
// refreshes the pages when the change went through.

// Approving needs Rhoddo's commission for the host, unless they already have one.
export async function setOrganizerStatus(
  id: string,
  status: 'pending' | 'approved' | 'suspended',
  commissionPercent?: number,
): Promise<ActionResult> {
  const r = await adminRequest(`/admin/organizers/${id}/status`, {
    method: 'PUT',
    body: { status, ...(commissionPercent !== undefined && { commissionPercent }) },
  });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/hosts');
    revalidatePath('/manage-rhoddo');
  }
  return r;
}

export async function markOrganizerPhoneVerified(id: string): Promise<ActionResult> {
  const r = await adminRequest(`/admin/organizers/${id}/phone-verified`, { method: 'PUT' });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/hosts');
  }
  return r;
}

// The host's starting rate for events reviewed from now on.
export async function setOrganizerCommission(id: string, commissionPercent: number): Promise<ActionResult> {
  const r = await adminRequest(`/admin/organizers/${id}/commission`, {
    method: 'PUT',
    body: { commissionPercent },
  });
  if (r.ok) {
    revalidatePath('/manage-rhoddo/hosts');
  }
  return r;
}
