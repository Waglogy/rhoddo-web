// Server only. Calls the admin API for a server action and returns the outcome instead of
// throwing: production Next.js hides the message of an error thrown from a server action, so
// an admin would see "An error occurred" instead of the API's reason (e.g. "This host hasn't
// added their Razorpay keys"). Callers show `error` as it is.

import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function adminRequest(path: string, init: { method: string; body?: unknown }): Promise<ActionResult> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return { ok: false, error: 'Please sign in again' };
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: init.method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => null);
    return { ok: false, error: (data?.error as string) || `Request failed (${res.status})` };
  } catch {
    return { ok: false, error: 'Could not reach Rhoddo. Try again.' };
  }
}
