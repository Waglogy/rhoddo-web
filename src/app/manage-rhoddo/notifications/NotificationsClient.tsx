'use client';

import { useEffect, useMemo, useState } from 'react';

// Small fetch helper — the admin cookie is httpOnly so we can't hit the
// backend from the browser directly. We go through Next.js proxy routes
// under /api/admin/notifications/* which read the cookie server-side.
async function proxyFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data as T;
}

type EventLite = { id: string; title: string; district: string; category: string };

type HistoryRow = {
  title: string;
  body: string;
  eventId: string | null;
  sentAt: string;
  recipients: number;
};

type Audience = 'all_users' | 'event_attendees' | 'district_users' | 'category_interest';

const DISTRICTS = ['Gangtok', 'Pelling', 'Lachung', 'Yuksom', 'Namchi', 'Ravangla'];

const AUDIENCE_LABELS: Record<Audience, string> = {
  all_users: 'All users',
  event_attendees: 'Attendees of an event',
  district_users: 'Users who booked in a district',
  category_interest: 'Users interested in a category',
};

const TITLE_MAX = 80;
const BODY_MAX = 240;

export function NotificationsClient({
  categories,
  events,
  initialHistory,
}: {
  categories: Array<{ key: string; label: string }>;
  events: EventLite[];
  initialHistory: HistoryRow[];
}) {
  // ---------- Form state ----------
  const [audience, setAudience] = useState<Audience>('all_users');
  const [eventId, setEventId] = useState<string>(events[0]?.id ?? '');
  const [district, setDistrict] = useState<string>('Gangtok');
  const [category, setCategory] = useState<string>(categories[0]?.key ?? '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [route, setRoute] = useState('');

  // ---------- Audience preview ----------
  const [reach, setReach] = useState<number | null>(null);
  const [reachLoading, setReachLoading] = useState(false);

  // Debounced fetch so we don't hammer the API while the admin changes filters.
  useEffect(() => {
    let cancelled = false;
    setReachLoading(true);
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ audience });
        if (audience === 'event_attendees' && eventId) params.set('eventId', eventId);
        if (audience === 'district_users') params.set('district', district);
        if (audience === 'category_interest') params.set('category', category);
        const data = await proxyFetch<{ count: number }>(
          `/api/admin/notifications/audience-count?${params.toString()}`,
        );
        if (!cancelled) setReach(data.count);
      } catch {
        if (!cancelled) setReach(null);
      } finally {
        if (!cancelled) setReachLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [audience, eventId, district, category]);

  // ---------- Send state ----------
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<
    | { kind: 'ok'; queued: number; audienceCount: number }
    | { kind: 'error'; message: string }
    | null
  >(null);
  const [history, setHistory] = useState<HistoryRow[]>(initialHistory);

  const canSend =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    title.length <= TITLE_MAX &&
    body.length <= BODY_MAX &&
    (audience !== 'event_attendees' || !!eventId);

  const send = async () => {
    if (!canSend) return;
    // Simple guardrail — confirm before a broadcast reaches >50 people
    // because a wrong blast is hard to undo.
    if ((reach ?? 0) > 50) {
      const ok = window.confirm(
        `This notification will reach ~${reach} people. Send now?`,
      );
      if (!ok) return;
    }

    setSending(true);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        body: body.trim(),
        audience,
      };
      if (audience === 'event_attendees') payload.eventId = eventId;
      if (audience === 'district_users') payload.district = district;
      if (audience === 'category_interest') payload.category = category;
      if (route.trim()) payload.route = route.trim();
      // If the admin selected an event but didn't set a custom route, the
      // backend defaults to /event/:eventId — convenient for nudges.
      if (!route.trim() && eventId && audience !== 'all_users') {
        payload.eventId = eventId;
      }

      const res = await proxyFetch<{
        queued: number;
        failed: number;
        audienceCount: number;
      }>('/api/admin/notifications/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setResult({ kind: 'ok', queued: res.queued, audienceCount: res.audienceCount });

      // Optimistically add to history so the admin sees it without a reload.
      setHistory((h) => [
        {
          title: title.trim(),
          body: body.trim(),
          eventId: audience === 'event_attendees' ? eventId : null,
          sentAt: new Date().toISOString(),
          recipients: res.queued,
        },
        ...h,
      ]);

      // Clear the compose fields so the admin can draft another one quickly.
      setTitle('');
      setBody('');
      setRoute('');
    } catch (err: any) {
      setResult({ kind: 'error', message: err?.message || 'Send failed' });
    } finally {
      setSending(false);
    }
  };

  const eventById = useMemo(
    () => new Map(events.map((e) => [e.id, e])),
    [events],
  );

  // ---------- Festival trigger ----------
  const [festivalSending, setFestivalSending] = useState<'eve' | 'morning' | null>(null);
  const [festivalResult, setFestivalResult] = useState<string | null>(null);

  const triggerFestival = async (type: 'eve' | 'morning') => {
    const label = type === 'eve' ? 'eve-of-festival (7:30 PM)' : 'morning (7:00 AM)';
    const ok = window.confirm(`Send ${label} festival notifications now?`);
    if (!ok) return;

    setFestivalSending(type);
    setFestivalResult(null);
    try {
      await proxyFetch('/api/admin/notifications/festival-trigger', {
        method: 'POST',
        body: JSON.stringify({ type }),
      });
      setFestivalResult(`${type === 'eve' ? 'Eve' : 'Morning'} festival notifications sent.`);
    } catch (err: any) {
      setFestivalResult(`Failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setFestivalSending(null);
    }
  };

  return (
    <div className="space-y-10">
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* ---------- Compose ---------- */}
      <div className="card p-6">
        <div className="label">Compose</div>
        <h2 className="mt-1 font-display text-2xl text-ink">New notification</h2>

        {/* Audience */}
        <div className="mt-6">
          <label className="label">Audience</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAudience(a)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  audience === a
                    ? 'border-gold/70 bg-gold/10 text-ink'
                    : 'border-line bg-bg text-mute hover:border-gold/30 hover:text-ink'
                }`}
              >
                {AUDIENCE_LABELS[a]}
              </button>
            ))}
          </div>
        </div>

        {/* Audience params */}
        {audience === 'event_attendees' && (
          <div className="mt-5">
            <label className="label">Event</label>
            <select
              className="input mt-2"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              {events.length === 0 && <option value="">No events yet</option>}
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} · {e.district}
                </option>
              ))}
            </select>
          </div>
        )}
        {audience === 'district_users' && (
          <div className="mt-5">
            <label className="label">District</label>
            <select
              className="input mt-2"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
        {audience === 'category_interest' && (
          <div className="mt-5">
            <label className="label">Category</label>
            <select
              className="input mt-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Copy */}
        <div className="mt-5">
          <div className="flex items-end justify-between">
            <label className="label">Title</label>
            <span className="text-xs text-mute">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            type="text"
            className="input mt-2"
            placeholder="e.g. Tonight only — Rabdentse Nights"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
          />
        </div>

        <div className="mt-5">
          <div className="flex items-end justify-between">
            <label className="label">Body</label>
            <span className="text-xs text-mute">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            className="input mt-2 min-h-[96px]"
            placeholder="Gates open at 6. 8 Silver seats left."
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, BODY_MAX))}
          />
        </div>

        <div className="mt-5">
          <label className="label">Deep link (optional)</label>
          <input
            type="text"
            className="input mt-2"
            placeholder="/event/abc123  (defaults to event page if event is chosen)"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
          />
        </div>

        {/* Reach hint */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-bg/60 px-4 py-3">
          <div className="text-sm text-mute">Estimated reach</div>
          <div className="font-display text-2xl text-ink">
            {reachLoading ? '…' : reach != null ? reach : '—'}
          </div>
        </div>

        {/* Send */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="text-xs text-mute">
            Recipients also get this in their in-app inbox.
          </div>
          <button
            type="button"
            disabled={!canSend || sending}
            onClick={send}
            className="btn-primary"
          >
            {sending ? 'Sending…' : 'Send notification'}
          </button>
        </div>

        {/* Result banner */}
        {result && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
              result.kind === 'ok'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-ink'
                : 'border-red-500/40 bg-red-500/10 text-ink'
            }`}
          >
            {result.kind === 'ok'
              ? `Sent to ${result.queued} of ${result.audienceCount}.`
              : `Failed: ${result.message}`}
          </div>
        )}
      </div>

      {/* ---------- Preview + History ---------- */}
      <div className="space-y-6">
        {/* Live device-style preview */}
        <div className="card p-5">
          <div className="label">Preview</div>
          <div className="mt-3 rounded-2xl border border-line bg-bg p-4">
            <div className="text-[11px] uppercase tracking-wider text-mute">RHODDO</div>
            <div className="mt-1 text-sm font-semibold text-ink">
              {title || 'Notification title'}
            </div>
            <div className="mt-1 text-xs text-mute">
              {body || 'Notification body copy goes here.'}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card p-5">
          <div className="label">Recent sends</div>
          {history.length === 0 ? (
            <div className="mt-3 text-xs text-mute">No sends yet.</div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {history.map((h, i) => {
                const linkedEvent = h.eventId ? eventById.get(h.eventId) : undefined;
                return (
                  <li key={`${h.sentAt}-${i}`} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm text-ink">{h.title}</div>
                      <div className="text-[11px] text-mute">
                        {new Date(h.sentAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="mt-1 truncate text-xs text-mute">{h.body}</div>
                    <div className="mt-1 text-[11px] text-gold">
                      {h.recipients} recipient{h.recipients !== 1 ? 's' : ''}
                      {linkedEvent ? ` · ${linkedEvent.title}` : ''}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>

    {/* ---------- Festival auto-notifications ---------- */}
    <div className="card p-6">
      <div className="label">Automated</div>
      <h2 className="mt-1 font-display text-2xl text-ink">Festival notifications</h2>
      <p className="mt-1 text-sm text-mute">
        Festival notifications are sent automatically — eve-of-festival at 7:30 PM and
        morning-of at 7:00 AM IST. Use the buttons below to trigger them manually.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={festivalSending !== null}
          onClick={() => triggerFestival('eve')}
          className="rounded-xl border border-line bg-bg px-5 py-3 text-sm text-ink transition hover:border-gold/40 hover:bg-gold/5 disabled:opacity-50"
        >
          {festivalSending === 'eve' ? 'Sending...' : 'Send eve notification (7:30 PM)'}
        </button>
        <button
          type="button"
          disabled={festivalSending !== null}
          onClick={() => triggerFestival('morning')}
          className="rounded-xl border border-line bg-bg px-5 py-3 text-sm text-ink transition hover:border-gold/40 hover:bg-gold/5 disabled:opacity-50"
        >
          {festivalSending === 'morning' ? 'Sending...' : 'Send morning notification (7:00 AM)'}
        </button>
      </div>

      {festivalResult && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink">
          {festivalResult}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-bg/60 px-4 py-3">
        <div className="text-xs font-medium text-ink">Schedule</div>
        <div className="mt-2 space-y-1 text-xs text-mute">
          <div>7:30 PM IST — &quot;Tomorrow: [Festival Name]&quot; sent to all users</div>
          <div>7:00 AM IST — &quot;Happy [Festival Name]!&quot; sent to all users</div>
          <div className="mt-2 text-[11px]">
            Only fires when there is a festival the next day / that day.
            Multiple festivals on the same day are combined into one notification.
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
