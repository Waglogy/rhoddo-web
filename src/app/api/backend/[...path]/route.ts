import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE, HOST_COOKIE, USER_COOKIE } from '@/lib/auth';

// Lets browser code call the host, admin and buyer APIs. The login cookies are httpOnly,
// so scripts can't read them. This route reads the cookie on the server and adds
// the token. Each API area only ever receives its own cookie.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

const COOKIE_FOR_AREA: Record<string, string> = {
  organizer: HOST_COOKIE,
  admin: ADMIN_COOKIE,
  // Buyers registering on the website
  me: USER_COOKIE,
  bookings: USER_COOKIE,
  payments: USER_COOKIE,
};

type Context = { params: Promise<{ path: string[] }> };

async function forward(req: Request, { params }: Context) {
  const { path } = await params;

  const cookieName = Object.hasOwn(COOKIE_FOR_AREA, path[0]) ? COOKIE_FOR_AREA[path[0]] : null;
  const safePath = path.every((part) => part !== '.' && part !== '..' && !/[/\\]/.test(part));
  if (!cookieName || !safePath) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const token = (await cookies()).get(cookieName)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Please sign in again' }, { status: 401 });
  }

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  // Lets the API record who accepted the Host Terms, from where.
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip');
  if (ip) headers['X-Forwarded-For'] = ip;
  const userAgent = req.headers.get('user-agent');
  if (userAgent) headers['User-Agent'] = userAgent;
  // Uploads need the original Content-Type, because it holds the multipart boundary.
  const contentType = req.headers.get('content-type');
  if (contentType) headers['Content-Type'] = contentType;

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const { search } = new URL(req.url);
  const target = `${API_URL}/${path.map(encodeURIComponent).join('/')}${search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'Could not reach Rhoddo. Try again.' }, { status: 502 });
  }

  // Bytes, not text, so downloads such as CSV files arrive unchanged.
  const responseHeaders: Record<string, string> = {
    'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
  };
  const disposition = upstream.headers.get('content-disposition');
  if (disposition) responseHeaders['Content-Disposition'] = disposition;
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
