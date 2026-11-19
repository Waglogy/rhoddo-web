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

/**
 * A buyer's registration-form answers, folded away until the host opens them.
 * `fileUrls` links each uploaded photo to a private link that works for an hour.
 */
export function BookingFormAnswers({ data, fileUrls = {} }: { data: BookingFormAnswersData; fileUrls?: Record<string, string> }) {
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
                  <dd className="break-words text-ink">
                    {f.type === 'image' && typeof set[f.id] === 'string' && set[f.id] ? (
                      fileUrls[set[f.id] as string] ? (
                        <a href={fileUrls[set[f.id] as string]} target="_blank" rel="noopener noreferrer" className="inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={fileUrls[set[f.id] as string]}
                            alt={f.label}
                            className="h-20 w-20 rounded-lg border border-line object-cover"
                          />
                          <span className="mt-0.5 block text-[11px] text-gold underline">Open photo</span>
                        </a>
                      ) : (
                        'Photo uploaded'
                      )
                    ) : (
                      show(set[f.id])
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </details>
  );
}
