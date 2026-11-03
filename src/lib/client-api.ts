"use client";

// Goes through /api/backend, which adds the login token on the server. Only
// /organizer/* and /admin/* paths work here.
export async function clientApi<T = any>(
  path: string,
  init: { method?: string; body?: unknown; isFormData?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (!init.isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api/backend${path}`, {
    method: init.method || 'GET',
    headers,
    body: init.isFormData
      ? (init.body as any)
      : init.body !== undefined
        ? JSON.stringify(init.body)
        : undefined,
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // Non-JSON error page; fall through to the generic message below.
  }
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}
