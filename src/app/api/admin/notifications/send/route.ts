import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

// Proxies POST /admin/notifications/send using the httpOnly admin cookie.
// The compose UI (client component) can't read that cookie directly, so it
// calls this route and we forward to the backend verbatim.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(req: Request) {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/admin/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const text = await upstream.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: upstream.status });
}
