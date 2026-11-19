import type { EventFormDef, FormFieldType } from '@/components/RegistrationFormEditor';

const TYPE_LABELS: Record<FormFieldType, string> = {
  short_text: 'Short answer',
  long_text: 'Paragraph',
  number: 'Number',
  date: 'Date',
  phone: 'Phone',
  email: 'Email',
  select: 'Choose one',
  multi_select: 'Choose several',
  checkbox: 'Tick box',
  image: 'Photo upload',
};

/** Read-only view of an event's registration form, for admins reviewing the event. */
export function RegistrationFormPreview({ form, csvHref }: { form: EventFormDef; csvHref: string }) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="label">Registration form</div>
          <h2 className="font-display text-xl text-ink">{form.name}</h2>
          {form.description && <p className="mt-1 max-w-2xl text-sm text-mute">{form.description}</p>}
          <p className="mt-1 text-xs text-mute">
            {form.perTicket ? 'Asked for every person registered' : 'Asked once per registration'}
          </p>
        </div>
        <a href={csvHref} className="btn-ghost whitespace-nowrap" download>
          Download answers (CSV)
        </a>
      </div>
      <ol className="mt-4 space-y-2 text-sm">
        {form.fields.map((f, i) => (
          <li key={f.id} className="text-ink">
            <span className="text-mute">{i + 1}.</span> {f.label}
            {f.required && <span className="text-primary"> *</span>}
            <span className="text-xs text-mute">
              {' '}
              · {TYPE_LABELS[f.type]}
              {f.options?.length ? `: ${f.options.join(', ')}` : ''}
            </span>
            {f.help && <div className="ml-4 text-xs text-mute">{f.help}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
