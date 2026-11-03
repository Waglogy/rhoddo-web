'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { HOST_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

// Returned rather than thrown: production Next.js hides thrown server action
// messages, and hosts need to read errors like "Incorrect code".
export type PhoneResult = { ok: true } | { ok: false; error: string };

async function post(path: string, body: unknown): Promise<PhoneResult> {
  const token = (await cookies()).get(HOST_COOKIE)?.value;
  if (!token) return { ok: false, error: 'Please sign in again' };

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => null);
    return { ok: false, error: data?.error || 'Something went wrong. Try again.' };
  } catch {
    return { ok: false, error: 'Could not reach Rhoddo. Try again.' };
  }
}

export async function sendHostPhoneCode(phone: string): Promise<PhoneResult> {
  return post('/organizer/phone/request', { phone });
}

export async function confirmHostPhoneCode(phone: string, code: string): Promise<PhoneResult> {
  const result = await post('/organizer/phone/verify', { phone, code });
  if (result.ok) revalidatePath('/host', 'layout');
  return result;
}
