'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { HOST_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

export async function updateHostProfile(form: {
  name: string;
  businessName: string;
  phone: string;
}) {
  const token = (await cookies()).get(HOST_COOKIE)?.value;
  if (!token) throw new Error('Not signed in');

  const name = form.name.trim();
  const businessName = form.businessName.trim();
  if (!name || !businessName) {
    throw new Error('Name and business name are required');
  }

  const body: Record<string, string> = { name, businessName };
  const phone = form.phone.trim();
  if (phone) body.phone = phone;

  const res = await fetch(`${API_URL}/organizer/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  // Returned rather than thrown: production Next.js hides thrown action messages,
  // and hosts need to read errors like "already used by another host account".
  if (!res.ok) {
    return { ok: false as const, error: (data?.error as string) || `Request failed (${res.status})` };
  }

  revalidatePath('/host/account');
  revalidatePath('/host');
  return { ok: true as const };
}
