// "Facing an issue? Call or WhatsApp us", shown wherever people register or see their pass.

export const SUPPORT_PHONE = '9733814168';
const DISPLAY = '97338 14168';

export function SupportNote({ context, className = '' }: { context?: string; className?: string }) {
  const message = `Hi Rhoddo, I need help${context ? ` with ${context}` : ''}.`;
  return (
    <div className={`rounded-2xl border border-line bg-bg/60 px-4 py-3 text-sm ${className}`}>
      <p className="text-ink">
        Facing an issue? We&apos;re here to help.{' '}
        <span className="text-mute">Call or WhatsApp us at</span>{' '}
        <a href={`tel:+91${SUPPORT_PHONE}`} className="whitespace-nowrap font-medium text-ink underline decoration-line underline-offset-2">
          {DISPLAY}
        </a>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a href={`tel:+91${SUPPORT_PHONE}`} className="btn-ghost px-3 py-1.5 text-xs">
          📞 Call
        </a>
        <a
          href={`https://wa.me/91${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  );
}
