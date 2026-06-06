'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export async function setOrganizerStatus(
  id: string,
  status: 'pending' | 'approved' | 'suspended',
) {
  await adminJson(`/admin/organizers/${id}/status`, { method: 'PUT', body: { status } });
  revalidatePath('/admin/hosts');
  revalidatePath('/admin');
}

export async function setOrganizerCredit(id: string, freeTicketsRemaining: number) {
  await adminJson(`/admin/organizers/${id}/credit`, {
    method: 'PUT',
    body: { freeTicketsRemaining },
  });
  revalidatePath('/admin/hosts');
  revalidatePath('/admin');
}
