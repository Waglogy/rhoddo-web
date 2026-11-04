import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, HOST_COOKIE } from './auth';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.rhoddo.com';

export type ApiRole = 'admin' | 'host';

export type ApiInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
  noAuth?: boolean;
  as?: ApiRole; // which cookie to read on the server (default 'admin')
};

function isConnRefused(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const o = err as { code?: string; cause?: unknown; errors?: unknown[] };
  if (o.code === 'ECONNREFUSED') return true;
  if (Array.isArray(o.errors)) {
    for (const sub of o.errors) {
      if (isConnRefused(sub)) return true;
    }
  }
  if (o.cause !== undefined) return isConnRefused(o.cause);
  return false;
}

async function readToken(role: ApiRole): Promise<string | undefined> {
  if (typeof window === 'undefined') {
    const c = await cookies();
    const name = role === 'host' ? HOST_COOKIE : ADMIN_COOKIE;
    return c.get(name)?.value;
  }
  return undefined;
}

export async function api<T = any>(path: string, init: ApiInit = {}): Promise<T> {
  const { body, token, noAuth, headers, as = 'admin', ...rest } = init;

  const cookieToken = token || noAuth ? undefined : await readToken(as);
  const finalToken = token ?? cookieToken;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(finalToken ? { Authorization: `Bearer ${finalToken}` } : {}),
        ...(headers || {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch (e) {
    if (isConnRefused(e)) {
      throw new Error(
        `Cannot reach API at ${API_URL}. Start the backend: cd backend && npm run dev`,
      );
    }
    throw e;
  }

  // The saved login is no longer valid, so ask the person to sign in again.
  if (res.status === 401 && cookieToken) redirect(`/api/session-expired?as=${as}`);

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

// Convenience wrapper for /host/* pages
export const hostApi = <T = any>(path: string, init: Omit<ApiInit, 'as'> = {}) =>
  api<T>(path, { ...init, as: 'host' });

export type CategoryOption = { key: string; label: string };

/** The categories hosts and admins can choose from. */
export async function fetchCategoryOptions(): Promise<CategoryOption[]> {
  const { categories } = await api<{ categories: CategoryOption[] }>('/categories', { noAuth: true });
  return categories;
}

export const API_BASE = API_URL;
