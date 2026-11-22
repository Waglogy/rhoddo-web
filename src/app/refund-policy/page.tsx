import Link from 'next/link';
import type { Metadata } from 'next';
import { LegalSection, LegalShell } from '@/components/LegalShell';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — Rhoddo',
  description: 'How refunds and cancellations work for events booked or registered on Rhoddo.',
};

export default function RefundPolicy() {
  return (
    <LegalShell label="Legal" title="Refund & Cancellation Policy" updated="21 November 2026">
      <LegalSection title="1. Who you pay">
        <p>
          Events on Rhoddo are run by independent organisers (&quot;hosts&quot;). When you pay for a pass or
          registration, the money goes directly to that host&apos;s Razorpay account. Rhoddo does not charge
          you any booking or convenience fee. Refunds are therefore made by the host, from their account,
          to your original payment method.
        </p>
      </LegalSection>

      <LegalSection title="2. Each event's own policy">
        <p>
          Hosts set the cancellation and refund rules for their event and show them on the event page,
          usually in the event description. Please read them before you pay. Where an event&apos;s page says
          nothing about refunds, the rules below apply.
        </p>
      </LegalSection>

      <LegalSection title="3. If you cancel or can't attend">
        <ul className="list-disc space-y-1 pl-5">
          <li>Passes and registrations are non-refundable once paid, unless the event&apos;s own policy says otherwise.</li>
          <li>If you can no longer attend, contact the host as early as possible; they may offer a transfer or credit at their discretion.</li>
          <li>Not attending (a &quot;no-show&quot;) is not refunded.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. If the host cancels or changes the event">
        <ul className="list-disc space-y-1 pl-5">
          <li>If an event is cancelled by the host, you receive a full refund of what you paid.</li>
          <li>If the event is postponed or significantly changed (date, venue or race distance), you may ask the host for a full refund instead of attending the new arrangement.</li>
          <li>Cancellations caused by weather, natural events or official orders follow the event&apos;s own policy; where it says nothing, a full refund applies.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Payment problems (refunded automatically)">
        <ul className="list-disc space-y-1 pl-5">
          <li>If money left your account but no pass was issued (for example the event filled up while you were paying), the payment is refunded automatically.</li>
          <li>If you were charged twice for the same registration, the extra payment is refunded.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. How long refunds take">
        <p>
          Once a refund is made, Razorpay returns it to the original payment method. It usually arrives
          within 5–7 working days, and can take up to 10 working days depending on your bank or UPI app.
        </p>
      </LegalSection>

      <LegalSection title="7. How to ask for a refund">
        <p>
          Contact the event&apos;s host first; their details are on the event page and in your confirmation
          email. If you can&apos;t reach them, or for a payment problem, contact Rhoddo with your order number
          (it starts with TSH-) and we will help:
        </p>
        <div className="rounded-xl border border-line bg-panel p-5">
          <p>
            Email:{' '}
            <a href="mailto:support@rhoddo.com" className="text-gold hover:underline">
              support@rhoddo.com
            </a>
          </p>
          <p className="mt-1">
            Phone / WhatsApp:{' '}
            <a href="tel:+919733814168" className="text-gold hover:underline">
              +91 97338 14168
            </a>
          </p>
        </div>
        <p>
          See also our <Link href="/terms" className="text-gold hover:underline">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
