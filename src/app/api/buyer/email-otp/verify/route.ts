import { NextResponse } from 'next/server';
import { forwardClientHeaders } from '@/lib/forwardClient';
import { cookies } from 'next/headers';
import { USER_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

// Checks the code and signs the buyer in. The token stays in an httpOnly cookie,
// and browser code reaches the buyer APIs through /api/backend.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/email-otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...forwardClientHeaders(req) },
      body: JSON.stringify({ email: body?.email, code: body?.code }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach Rhoddo. Try again.' }, { status: 502 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.error || 'That code did not work' }, { status: res.status });
  }

  (await cookies()).set(USER_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // the API's tokens last 30 days
  });
  return NextResponse.json({ user: data.user, isNewUser: !!data.isNewUser });
}
