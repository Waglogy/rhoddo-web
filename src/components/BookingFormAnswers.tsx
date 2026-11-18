import type { FormField } from '@/components/RegistrationFormEditor';

export type BookingFormAnswersData = {
  name: string;
  perTicket: boolean;
  fields: FormField[];
  answers: Array<Record<string, string | number | boolean | string[]>>;
};

function show(v: string | number | boolean | string[] | undefined): string {
  if (v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

/** A buyer's registration-form answers, folded away until the host opens them. */
export function BookingFormAnswers({ data }: { data: BookingFormAnswersData }) {
  return (
    <details className="mt-2 text-xs">
      <summary className="cursor-pointer text-gold hover:underline">
        {data.name} · {data.answers.length > 1 ? `${data.answers.length} people` : 'answers'}
      </summary>
      <div className="mt-2 space-y-3">
        {data.answers.map((set, i) => (
          <div key={i} className="rounded-lg border border-line bg-bg p-3">
            {data.answers.length > 1 && <div className="mb-1 text-[10px] uppercase tracking-wider text-mute">Person {i + 1}</div>}
            <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,14rem)_1fr]">
              {data.fields.map((f) => (
                <div key={f.id} className="contents">
                  <dt className="text-mute">{f.label}</dt>
                  <dd className="break-words text-ink">{show(set[f.id])}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}
