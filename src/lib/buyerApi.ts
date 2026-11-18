'use client';

// Buyer calls from registration pages. Goes through /api/backend, which adds the
// buyer's login cookie on the server, so it books into the same account as the app.

export class BuyerApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export async function buyerApi<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path.startsWith('/api/') ? path : `/api/backend${path}`, {
      method: init.method || (init.body === undefined ? 'GET' : 'POST'),
      headers: init.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
  } catch {
    throw new BuyerApiError('Could not reach Rhoddo. Check your connection and try again.', 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new BuyerApiError(data?.error || `Something went wrong (${res.status})`, res.status, data?.code);
  }
  return data as T;
}

export type Buyer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  termsAccepted: boolean;
};

/** The name the API gives new phone sign-ups until they choose one. */
export const PLACEHOLDER_NAME = 'Traveller';
