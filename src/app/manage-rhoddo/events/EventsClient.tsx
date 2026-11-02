'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { formatDate, formatINR } from '@/lib/format';
import { setEventPublished, deleteEvent } from '@/actions/adminEvents';

export type EventRow = {
  id: string;
  title: string;
  category: string;
  district: string;
  date: string;
  priceFromINR: number;
  published: boolean;
  bookingCount: number;
  venue: { name: string };
  organizer: {
    id: string;
    businessName: string;
    name: string;
    status: string;
  } | null;
};

type Filter = 'all' | 'live' | 'paused';

// Bucket key for a host. Organizer-owned events group by the organizer;
// legacy/platform events fall under a single "Platform" bucket.
const PLATFORM = '__platform__';

function StatusPill({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-block rounded-full border border-pine/60 bg-pine/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-pine">
      Live
    </span>
  ) : (
    <span className="inline-block rounded-full border border-primary/60 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
      Paused
    </span>
  );
}

export function EventsClient({ events }: { events: EventRow[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [grouped, setGrouped] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    if (filter === 'all') return events;
    return events.filter((e) => (filter === 'live' ? e.published : !e.published));
  }, [events, filter]);

  const liveCount = events.filter((e) => e.published).length;
  const pausedCount = events.length - liveCount;

  function runAction(id: string, fn: () => Promise<void>) {
    setErr(null);
    setBusyId(id);
    startTransition(() => {
      fn()
        .catch((e) => setErr(e instanceof Error ? e.message : 'Something went wrong'))
        .finally(() => setBusyId(null));
    });
  }

  // Group rows by host for the grouped view.
  const groups = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; sub: string | null; status: string | null; events: EventRow[] }
    >();
    for (const e of rows) {
      const key = e.organizer?.id ?? PLATFORM;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: e.organizer?.businessName ?? 'Platform (no host)',
          sub: e.organizer?.name ?? null,
          status: e.organizer?.status ?? null,
          events: [],
        });
      }
      map.get(key)!.events.push(e);
    }
    // Platform bucket last, otherwise alphabetical by host name.
    return Array.from(map.values()).sort((a, b) => {
      if (a.key === PLATFORM) return 1;
      if (b.key === PLATFORM) return -1;
      return a.label.localeCompare(b.label);
    });
  }, [rows]);

  return (
    <div>
      {err && (
        <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-ink">
          {err}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', `All (${events.length})`],
              ['live', `Live (${liveCount})`],
              ['paused', `Paused (${pausedCount})`],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-xl border px-4 py-2 text-xs uppercase tracking-wider transition ${
                filter === f
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-line text-mute hover:border-ink hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setGrouped((g) => !g)}
          className={`rounded-xl border px-4 py-2 text-xs uppercase tracking-wider transition ${
            grouped
              ? 'border-gold bg-gold/10 text-gold'
              : 'border-line text-mute hover:border-ink hover:text-ink'
          }`}
        >
          Group by host
        </button>
      </div>

      {rows.length === 0 && (
        <div className="card mt-6 p-6 text-sm text-mute">No events match this filter.</div>
      )}

      {grouped
        ? groups.map((g) => (
            <div key={g.key} className="mt-8">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="font-display text-xl text-ink">{g.label}</h2>
                {g.sub && <span className="text-xs text-mute">· {g.sub}</span>}
                {g.status && (
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                    {g.status}
                  </span>
                )}
                <span className="text-xs text-mute">
                  · {g.events.length} event{g.events.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="card mt-3 divide-y divide-line">
                {g.events.map((e) => (
                  <EventRowItem
                    key={e.id}
                    e={e}
                    busy={pending && busyId === e.id}
                    onToggle={() =>
                      runAction(e.id, () => setEventPublished(e.id, !e.published))
                    }
                    onDelete={() => runAction(e.id, () => deleteEvent(e.id))}
                  />
                ))}
              </div>
            </div>
          ))
        : rows.length > 0 && (
            <div className="card mt-6 divide-y divide-line">
              {rows.map((e) => (
                <EventRowItem
                  key={e.id}
                  e={e}
                  busy={pending && busyId === e.id}
                  onToggle={() => runAction(e.id, () => setEventPublished(e.id, !e.published))}
                  onDelete={() => runAction(e.id, () => deleteEvent(e.id))}
                />
              ))}
            </div>
          )}
    </div>
  );
}

function EventRowItem({
  e,
  busy,
  onToggle,
  onDelete,
}: {
  e: EventRow;
  busy: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
      <Link href={`/manage-rhoddo/events/${e.id}`} className="min-w-0 flex-1 transition hover:opacity-80">
        <div className="flex items-center gap-2">
          <div className="truncate text-base text-ink">{e.title}</div>
          <StatusPill published={e.published} />
        </div>
        <div className="mt-1 text-xs text-mute">
          {e.venue.name} · {e.district} · {e.category} · {formatDate(e.date)}
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-display text-base text-gold">{formatINR(e.priceFromINR)}</div>
          <div className="text-[11px] text-mute">{e.bookingCount} bookings</div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onToggle}
            className={`text-xs disabled:opacity-50 ${
              e.published ? 'btn-ghost' : 'btn-primary'
            }`}
          >
            {busy ? '…' : e.published ? 'Pause' : 'Publish'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (
                window.confirm(
                  `Delete "${e.title}"? This permanently removes the event, its ticket tiers and bookings. This cannot be undone.`,
                )
              ) {
                onDelete();
              }
            }}
            className="btn-danger text-xs disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
