'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

// Returned rather than thrown: production Next.js hides thrown server action messages.
export type FeePaymentResult = { ok: true } | { ok: false; error: string };

async function send(path: string, method: string, body?: unknown): Promise<FeePaymentResult> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return { ok: false, error: 'Please sign in again' };
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return { ok: false, error: data?.error || 'Something went wrong. Try again.' };
    }
  } catch {
    return { ok: false, error: 'Could not reach Rhoddo. Try again.' };
  }
  revalidatePath('/manage-rhoddo/hosts');
  revalidatePath('/manage-rhoddo');
  return { ok: true };
}

export async function recordFeePayment(organizerId: string, amountINR: number, note: string) {
  return send(`/admin/organizers/${organizerId}/fee-payments`, 'POST', { amountINR, note });
}

export async function undoFeePayment(paymentId: string) {
  return send(`/admin/fee-payments/${paymentId}`, 'DELETE');
}
