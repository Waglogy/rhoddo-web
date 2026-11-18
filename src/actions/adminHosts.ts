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

// Approving needs Rhoddo's commission for the host, unless they already have one.
export async function setOrganizerStatus(
  id: string,
  status: 'pending' | 'approved' | 'suspended',
  commissionPercent?: number,
) {
  await adminJson(`/admin/organizers/${id}/status`, {
    method: 'PUT',
    body: { status, ...(commissionPercent !== undefined && { commissionPercent }) },
  });
  revalidatePath('/manage-rhoddo/hosts');
  revalidatePath('/manage-rhoddo');
}

export async function markOrganizerPhoneVerified(id: string) {
  await adminJson(`/admin/organizers/${id}/phone-verified`, { method: 'PUT' });
  revalidatePath('/manage-rhoddo/hosts');
}

// The host's starting rate for events reviewed from now on.
export async function setOrganizerCommission(id: string, commissionPercent: number) {
  await adminJson(`/admin/organizers/${id}/commission`, {
    method: 'PUT',
    body: { commissionPercent },
  });
  revalidatePath('/manage-rhoddo/hosts');
}
