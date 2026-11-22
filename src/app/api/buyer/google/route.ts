import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { USER_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

// Signs a buyer in with the ID token from Google's button. Same account as Google
// sign-in in the app. The token stays in an httpOnly cookie, like the email code sign-in.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (typeof body?.idToken !== 'string' || !body.idToken) {
    return NextResponse.json({ error: 'Google sign-in did not finish. Try again.' }, { status: 400 });
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: body.idToken }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach Rhoddo. Try again.' }, { status: 502 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.error || 'Google sign-in failed' }, { status: res.status });
  }
  (await cookies()).set(USER_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // the API's tokens last 30 days
  });
  return NextResponse.json({ user: data.user });
}
