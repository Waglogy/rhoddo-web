'use client';

// Every registration for an event as a spreadsheet-like table: one row per person, with
// each registration-form question as a column and photos as thumbnails. Used by hosts
// (their own events) and admins (any event).

import { useMemo, useState } from 'react';

export type TableColumn = { label: string; type: string };
export type RegistrationsData = {
  event: { id: string; title: string; category: string };
  columns: TableColumn[];
  rows: string[][];
};

const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-pine/15 text-pine' },
  cancelled: { label: 'Cancelled', cls: 'bg-line text-mute' },
  refunded: { label: 'Refunded', cls: 'bg-line text-ink' },
  needs_refund: { label: 'Needs refund', cls: 'bg-primary/15 text-primary' },
};

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
}

function Cell({ value, type }: { value: string; type: string }) {
  if (!value) return <span className="text-mute/60">—</span>;
  if (type === 'datetime') return <span className="whitespace-nowrap">{when(value)}</span>;
  if (type === 'status') {
    const s = STATUS[value] ?? { label: value, cls: 'bg-line text-mute' };
    return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
  }
  if (type === 'image') {
    if (!/^https?:\/\//.test(value)) return <span className="text-mute">{value}</span>;
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="inline-block" title="Open photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="" className="h-10 w-10 rounded-md border border-line object-cover" loading="lazy" />
      </a>
    );
  }
  return <span className={value.length > 40 ? 'block min-w-[14rem] whitespace-normal' : 'whitespace-nowrap'}>{value}</span>;
}

export function RegistrationsTable({ data, csvHref }: { data: RegistrationsData; csvHref: string }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const statusCol = data.columns.findIndex((c) => c.type === 'status');
  const passCol = 3;
  const [pass, setPass] = useState('');
  const passes = useMemo(() => [...new Set(data.rows.map((r) => r[passCol]))].sort(), [data.rows]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return data.rows.filter(
      (r) =>
        (!status || r[statusCol] === status) &&
        (!pass || r[passCol] === pass) &&
        (!needle || r.some((v) => v.toLowerCase().includes(needle))),
    );
  }, [data.rows, q, status, pass, statusCol]);

  const confirmedPeople = data.rows.filter((r) => r[statusCol] === 'confirmed').length;

  // On screen, each runner's own details come first; order and buyer info move to the end.
  // The API's order is: Order, Registered at, Status, Pass, People, Person, Registered by, Email, Phone, ...form answers.
  const order = useMemo(() => {
    const formCols = data.columns.map((_, i) => i).filter((i) => i >= 9);
    return [3, 2, ...formCols, 5, 6, 7, 8, 0, 1, 4].filter((i) => i < data.columns.length);
  }, [data.columns]);

  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="input min-w-0 sm:max-w-xs"
          placeholder="Search any column"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search registrations"
        />
        <select className="input min-w-0 sm:w-auto" value={pass} onChange={(e) => setPass(e.target.value)} aria-label="Pass">
          <option value="">All passes</option>
          {passes.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className="input min-w-0 sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <a href={csvHref} className="btn-ghost whitespace-nowrap sm:ml-auto" download>
          Download CSV
        </a>
      </div>

      <p className="mt-3 text-sm text-mute">
        {rows.length === data.rows.length ? `${data.rows.length} people` : `${rows.length} of ${data.rows.length} people`} ·{' '}
        {confirmedPeople} confirmed. Photo links work for an hour; reload the page for fresh ones.
      </p>

      <div className="card mt-3 max-h-[70vh] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 border-b border-line bg-panel px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-mute">#</th>
              {order.map((i) => data.columns[i]).map((c, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-10 whitespace-nowrap border-b border-line bg-panel px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-mute"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={data.columns.length + 1} className="px-3 py-8 text-center text-mute">
                  {data.rows.length ? 'Nothing matches.' : 'No registrations yet.'}
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-bg/60">
                <td className="sticky left-0 border-b border-line bg-panel px-3 py-2 text-xs text-mute">{i + 1}</td>
                {order.map((j) => (
                  <td key={j} className="border-b border-line px-3 py-2 align-middle text-ink">
                    <Cell value={r[j] ?? ''} type={data.columns[j].type} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
