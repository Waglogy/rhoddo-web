import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { HOST_COOKIE } from '@/lib/auth';

// Proxies POST /tickets/checkin using the httpOnly host cookie.
// The scanner UI (client component) can't read that cookie directly,
// so it calls this route and we forward to the backend verbatim —
// status code AND structured body — so the UI can switch on `reason`.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

export async function POST(req: Request) {
  const c = await cookies();
  const token = c.get(HOST_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { status: 'error', reason: 'unauthorized', error: 'Log in as a host first' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: 'error', reason: 'bad_request', error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${API_URL}/tickets/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await upstream.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { status: 'error', reason: 'bad_upstream', error: text || 'Upstream error' };
  }

  return NextResponse.json(data, { status: upstream.status });
}
