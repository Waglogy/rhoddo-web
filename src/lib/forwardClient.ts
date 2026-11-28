// Server only. Headers that tell the API who the visitor is, for routes that call the API
// from this server. Without them the API sees this server's address for every visitor,
// so all of them would share one rate limit (rhoddo-api/src/lib/clientIp.ts).
//
// The API only believes X-Rhoddo-Client-IP when X-Rhoddo-Web-Key matches its own
// WEB_PROXY_KEY. Set the same value in this site's environment. Never NEXT_PUBLIC_: it
// must not reach browsers.

/** The visitor's IP as our host reports it. x-real-ip first: hosts set it themselves. */
export function visitorIp(req: Request): string | null {
  return (
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null
  );
}

export function forwardClientHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const ip = visitorIp(req);
  const key = process.env.WEB_PROXY_KEY?.trim();
  if (ip && key) {
    headers['X-Rhoddo-Client-IP'] = ip;
    headers['X-Rhoddo-Web-Key'] = key;
  }
  const userAgent = req.headers.get('user-agent');
  if (userAgent) headers['User-Agent'] = userAgent;
  return headers;
}
