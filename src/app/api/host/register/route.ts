import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { HOST_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/auth/organizer/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error || 'Registration failed' },
      { status: res.status }
    );
  }

  const c = await cookies();
  c.set(HOST_COOKIE, data.token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true, organizer: data.organizer });
}
