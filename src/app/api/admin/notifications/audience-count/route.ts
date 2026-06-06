import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from '@/lib/auth';

// Proxies GET /admin/notifications/audience-count using the httpOnly admin
// cookie. Preserves query string so the compose form's live preview works.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function GET(req: Request) {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const incoming = new URL(req.url);
  const qs = incoming.search; // includes leading '?' or ''

  const upstream = await fetch(`${API_URL}/admin/notifications/audience-count${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  const text = await upstream.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: upstream.status });
}
