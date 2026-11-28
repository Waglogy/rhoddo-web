import { NextResponse } from 'next/server';
import { forwardClientHeaders } from '@/lib/forwardClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

// Emails a sign-in code to a buyer registering on the website.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...forwardClientHeaders(req) };
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/email-otp/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: body?.email }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach Rhoddo. Try again.' }, { status: 502 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.error || 'Could not send the code' }, { status: res.status });
  }
  return NextResponse.json({ ok: true, email: data.email });
}
