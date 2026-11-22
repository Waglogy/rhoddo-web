import type { Metadata } from 'next';
import { LegalSection, LegalShell } from '@/components/LegalShell';

export const metadata: Metadata = {
  title: 'Contact — Rhoddo',
  description: 'Get help with registrations, payments, refunds or hosting an event on Rhoddo.',
};

export default function Contact() {
  return (
    <LegalShell label="Help" title="Contact us">
      <p className="text-base">
        Questions about a registration, a payment, a refund, or hosting your event on Rhoddo? We&apos;re here to
        help.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a href="tel:+919733814168" className="card block p-6 transition hover:border-primary">
          <div className="label">Call</div>
          <div className="mt-1 font-display text-2xl text-ink">+91 97338 14168</div>
          <p className="mt-1 text-xs">For anything urgent about a registration or payment</p>
        </a>
        <a
          href="https://wa.me/919733814168?text=Hi%20Rhoddo%2C%20I%20need%20help."
          target="_blank"
          rel="noopener noreferrer"
          className="card block p-6 transition hover:border-primary"
        >
          <div className="label">WhatsApp</div>
          <div className="mt-1 font-display text-2xl text-ink">+91 97338 14168</div>
          <p className="mt-1 text-xs">Send a message any time</p>
        </a>
        <a href="mailto:support@rhoddo.com" className="card block p-6 transition hover:border-primary sm:col-span-2">
          <div className="label">Email</div>
          <div className="mt-1 font-display text-2xl text-ink">support@rhoddo.com</div>
          <p className="mt-1 text-xs">For refunds or payment issues, include your order number (it starts with TSH-).</p>
        </a>
      </div>

      <LegalSection title="Registration or event questions">
        <p>
          For questions about a specific event (race timings, kit collection, results), the organiser can
          answer best; their name is on the event page and in your confirmation email.
        </p>
      </LegalSection>

      <LegalSection title="Address">
        <p>Rhoddo is operated by Waglogy, Sikkim, India.</p>
      </LegalSection>
    </LegalShell>
  );
}
