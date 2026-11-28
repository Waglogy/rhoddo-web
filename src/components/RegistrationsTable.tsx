'use client';

// Every registration for an event as a spreadsheet-like table: one row per person, with
// each registration-form question as a column and photos as thumbnails. Used by hosts
// (their own events) and admins (any event).

import { useMemo, useState } from 'react';

export type TableColumn = { label: string; type: string };
export type RegistrationsData = {
  event: { id: string; title: string; category: string; date?: string };
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

/** Age in whole years on a given day (race day), from YYYY-MM-DD. */
function ageOn(dob: string, on: Date): number | null {
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let age = on.getFullYear() - y;
  if (on.getMonth() + 1 < mo || (on.getMonth() + 1 === mo && on.getDate() < d)) age--;
  return age >= 0 && age < 120 ? age : null;
}

const AGE_GROUPS: Array<{ key: string; label: string; min: number; max: number }> = [
  { key: 'u18', label: 'Under 18', min: 0, max: 17 },
  { key: '18-29', label: '18–29', min: 18, max: 29 },
  { key: '30-44', label: '30–44', min: 30, max: 44 },
  { key: '45+', label: '45 and above', min: 45, max: 200 },
];

function Cell({ value, type, age }: { value: string; type: string; age?: number | null }) {
  if (!value) return <span className="text-mute/60">—</span>;
  if (age != null) return <span className="whitespace-nowrap">{value} <span className="text-mute">({age})</span></span>;
  if (type === 'datetime') return <span className="whitespace-nowrap">{when(value)}</span>;
  if (type === 'status') {
    const s = STATUS[value] ?? { label: value, cls: 'bg-line text-mute' };
    return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
  }
  if (type === 'image' || type === 'file') {
    if (!/^https?:\/\//.test(value)) return <span className="text-mute">{value}</span>;
    if (/\.pdf([?&]|$)/i.test(value)) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap text-gold underline">
          📄 PDF
        </a>
      );
    }
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
  // Columns before this are the booking's own (order, status, pass, who, User ID); form answers follow.
  const FIRST_FORM_COL = 10;
  const [pass, setPass] = useState('');
  const passes = useMemo(() => [...new Set(data.rows.map((r) => r[passCol]))].sort(), [data.rows]);

  // A dropdown for every "choose one" question in the form (Gender, T-shirt size, ...).
  const choiceCols = useMemo(
    () =>
      data.columns
        .map((c, i) => ({ ...c, i }))
        .filter((c) => c.i >= FIRST_FORM_COL && c.type === 'select')
        .map((c) => {
          const counts = new Map<string, number>();
          for (const r of data.rows) if (r[c.i]) counts.set(r[c.i], (counts.get(r[c.i]) ?? 0) + 1);
          return { ...c, options: [...counts.entries()].sort((a, b) => b[1] - a[1]) };
        })
        .filter((c) => c.options.length > 0),
    [data.columns, data.rows],
  );
  const [choice, setChoice] = useState<Record<number, string>>({});

  // Age on race day, from the first date question that looks like a date of birth.
  const dobCol = data.columns.findIndex((c, i) => i >= FIRST_FORM_COL && c.type === 'date' && /birth|dob|born|age/i.test(c.label));
  const raceDay = useMemo(() => (data.event.date ? new Date(data.event.date) : new Date()), [data.event.date]);
  const ages = useMemo(() => data.rows.map((r) => (dobCol >= 0 ? ageOn(r[dobCol], raceDay) : null)), [data.rows, dobCol, raceDay]);
  const [ageGroup, setAgeGroup] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const group = AGE_GROUPS.find((g) => g.key === ageGroup);
    const lo = minAge ? Number(minAge) : group?.min;
    const hi = maxAge ? Number(maxAge) : group?.max;
    return data.rows
      .map((r, idx) => ({ r, age: ages[idx] }))
      .filter(
        ({ r, age }) =>
          (!status || r[statusCol] === status) &&
          (!pass || r[passCol] === pass) &&
          Object.entries(choice).every(([col, v]) => !v || r[Number(col)] === v) &&
          (lo === undefined || (age != null && age >= lo)) &&
          (hi === undefined || (age != null && age <= hi)) &&
          (!needle || r.some((v) => v.toLowerCase().includes(needle))),
      );
  }, [data.rows, ages, q, status, pass, statusCol, choice, ageGroup, minAge, maxAge]);

  const anyFilter = !!(q || status || pass || ageGroup || minAge || maxAge || Object.values(choice).some(Boolean));
  const clearAll = () => {
    setQ('');
    setStatus('');
    setPass('');
    setAgeGroup('');
    setMinAge('');
    setMaxAge('');
    setChoice({});
  };
  /** The rows on screen as a CSV file, made in the browser (same columns as the full download). */
  function downloadFiltered() {
    const cell = (v: string) => {
      const safe = /^[=@\t\r]/.test(v) || /^[+-](?![\d\s]+$)/.test(v) ? `'${v}` : v;
      return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    };
    const lines = [data.columns.map((c) => cell(c.label)).join(','), ...rows.map(({ r }) => r.map(cell).join(','))];
    const blob = new Blob(['\uFEFF' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${data.event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'}-filtered.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const passCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data.rows) m.set(r[passCol], (m.get(r[passCol]) ?? 0) + 1);
    return m;
  }, [data.rows]);

  const confirmedPeople = data.rows.filter((r) => r[statusCol] === 'confirmed').length;

  // On screen, each runner's own details come first; order and buyer info move to the end.
  // The API's order is: Order, Registered at, Status, Pass, People, Person, Registered by, Email, Phone, User ID, ...form answers.
  const order = useMemo(() => {
    const formCols = data.columns.map((_, i) => i).filter((i) => i >= FIRST_FORM_COL);
    // User ID (column 9) is left empty for hosts, so it's only shown when it has values (admins).
    const hasUserIds = data.rows.some((r) => r[9]);
    return [3, 2, ...formCols, 5, 6, 9, 7, 8, 0, 1, 4].filter((i) => i < data.columns.length && (i !== 9 || hasUserIds));
  }, [data.columns, data.rows]);

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
            <option key={p} value={p}>
              {p} ({passCounts.get(p) ?? 0})
            </option>
          ))}
        </select>
        <select className="input min-w-0 sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <div className="flex gap-2 sm:ml-auto">
          {anyFilter && rows.length > 0 && (
            <button type="button" className="btn-ghost whitespace-nowrap" onClick={downloadFiltered}>
              Download filtered ({rows.length})
            </button>
          )}
          <a href={csvHref} className="btn-ghost whitespace-nowrap" download>
            Download all (CSV)
          </a>
        </div>
      </div>

      {(choiceCols.length > 0 || dobCol >= 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {choiceCols.map((c) => (
            <select
              key={c.i}
              className="input w-auto min-w-0"
              value={choice[c.i] ?? ''}
              onChange={(e) => setChoice((x) => ({ ...x, [c.i]: e.target.value }))}
              aria-label={c.label}
            >
              <option value="">{c.label}: all</option>
              {c.options.map(([v, n]) => (
                <option key={v} value={v}>
                  {c.label}: {v} ({n})
                </option>
              ))}
            </select>
          ))}
          {dobCol >= 0 && (
            <>
              <select
                className="input w-auto min-w-0"
                value={ageGroup}
                onChange={(e) => {
                  setAgeGroup(e.target.value);
                  setMinAge('');
                  setMaxAge('');
                }}
                aria-label="Age group"
              >
                <option value="">Age: all</option>
                {AGE_GROUPS.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label} ({ages.filter((a) => a != null && a >= g.min && a <= g.max).length})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 text-sm text-mute">
                <input
                  className="input w-20 min-w-0"
                  inputMode="numeric"
                  placeholder="Min"
                  value={minAge}
                  onChange={(e) => {
                    setMinAge(e.target.value.replace(/\D/g, '').slice(0, 3));
                    setAgeGroup('');
                  }}
                  aria-label="Minimum age"
                />
                –
                <input
                  className="input w-20 min-w-0"
                  inputMode="numeric"
                  placeholder="Max"
                  value={maxAge}
                  onChange={(e) => {
                    setMaxAge(e.target.value.replace(/\D/g, '').slice(0, 3));
                    setAgeGroup('');
                  }}
                  aria-label="Maximum age"
                />
                <span>years on race day</span>
              </div>
            </>
          )}
          {anyFilter && (
            <button type="button" className="text-sm text-primary hover:underline" onClick={clearAll}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {data.event.date && data.rows.length > 0 && (
        <p className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm text-ink">
          🔒 For privacy, form answers and photos are deleted on{' '}
          <strong>
            {new Date(new Date(data.event.date).getTime() + 30 * 864e5).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}
          </strong>{' '}
          (30 days after the event). Download the CSV before then if you need to keep anything, and delete it when you&apos;re done.
        </p>
      )}

      <p className="mt-3 text-sm text-mute">
        {rows.length === data.rows.length ? `${data.rows.length} people` : `${rows.length} of ${data.rows.length} people`} ·{' '}
        {confirmedPeople} confirmed. Photo and file links work for an hour; reload the page for fresh ones.
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
            {rows.map(({ r, age }, i) => (
              <tr key={i} className="hover:bg-bg/60">
                <td className="sticky left-0 border-b border-line bg-panel px-3 py-2 text-xs text-mute">{i + 1}</td>
                {order.map((j) => (
                  <td key={j} className="border-b border-line px-3 py-2 align-middle text-ink">
                    <Cell value={r[j] ?? ''} type={data.columns[j].type} age={j === dobCol ? age : undefined} />
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
