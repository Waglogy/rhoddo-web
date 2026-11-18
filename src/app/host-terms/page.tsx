import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host Terms — Rhoddo',
  description: 'The terms for hosts and organisers who list events and sell tickets on Rhoddo.',
};

// When this text changes in a way hosts must agree to again, change HOST_TERMS_VERSION
// in rhoddo-api/src/lib/legal.ts and the date below.
const LAST_UPDATED = '17 November 2026';

const SECTIONS: Array<{ title: string; body: React.ReactNode }> = [
  {
    title: 'About these Host Terms',
    body: (
      <>
        These Host Terms apply to anyone who registers as a host or organiser on Rhoddo (&quot;you&quot;)
        to list venues and events and sell tickets or registrations through the Rhoddo app and
        website (the &quot;Service&quot;). The Service is operated by Waglogy (&quot;Rhoddo&quot;,
        &quot;we&quot;, &quot;us&quot;). They apply in addition to our{' '}
        <Link href="/terms" className="text-gold hover:underline">Terms &amp; Conditions</Link> and{' '}
        <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>. By creating a
        host account or continuing to use the host panel, you accept them.
      </>
    ),
  },
  {
    title: 'Your account and approval',
    body: (
      <>
        You must give accurate details about yourself and your business, verify your phone number, and
        keep your login secure. You are responsible for everything done through your account. Rhoddo
        reviews every host before approval and may refuse, suspend or close an account, for example if
        details are false, events are misleading or unsafe, or these Host Terms are broken.
      </>
    ),
  },
  {
    title: 'Events and event review',
    body: (
      <>
        You are the organiser of your events and are solely responsible for running them safely and as
        described, including permits, licences, insurance, venue arrangements, capacity limits, and any
        rules for participants such as medical fitness for races. Every new event is reviewed once by
        Rhoddo before it can go live. Approval is not an endorsement, and Rhoddo may pause or remove any
        listing at any time. Listings must be accurate: date, place, prices, what each ticket includes,
        and any age or fitness requirements.
      </>
    ),
  },
  {
    title: 'Payments',
    body: (
      <>
        Buyers pay you directly, through your own Razorpay account connected in the host panel. Rhoddo
        does not collect or hold ticket money. You are responsible for your Razorpay account, its fees,
        and for issuing invoices and paying any taxes (including GST) that apply to your sales. Rhoddo
        never charges buyers a fee on top of your ticket price.
      </>
    ),
  },
  {
    title: "Rhoddo's commission",
    body: (
      <>
        For each confirmed booking, you owe Rhoddo a commission: a percentage of what the buyer paid
        after any promo discount. Your rate is agreed when your account is approved and confirmed for
        each event when it is reviewed, and is shown in the host panel. Free bookings carry no
        commission. A booking keeps the rate in force when it was made, even if the rate later
        changes. Rhoddo shows your commission due in the host panel and you agree to pay it when
        asked, by the method Rhoddo tells you. Unpaid commission may lead to suspension.
      </>
    ),
  },
  {
    title: 'Cancellations and refunds',
    body: (
      <>
        Because buyers pay you directly, you are responsible for refunds. You must publish a clear
        refund policy on each event, and refund buyers in full if you cancel an event, or as your
        policy states if you change it materially. Rhoddo may share your contact details with buyers
        who need to reach you about a refund. Commission on a booking you fully refund may be waived
        at Rhoddo&apos;s discretion.
      </>
    ),
  },
  {
    title: "Buyers' personal data",
    body: (
      <>
        Through bookings, registration forms and gate scanning, you receive buyers&apos; personal data,
        such as names, phone numbers and answers to your form. Only ask for details you genuinely need
        for the event. Use them only to run that event and keep participants safe, keep them secure,
        never sell them or use them for unrelated marketing without consent, and delete them when no
        longer needed. You must comply with India&apos;s Digital Personal Data Protection Act, 2023 and
        other applicable law.
      </>
    ),
  },
  {
    title: 'Your content',
    body: (
      <>
        You keep ownership of the text, images and other content you upload, and you confirm you have
        the rights to use it. You give Rhoddo a licence to display, adapt and promote it on the Service
        and in Rhoddo&apos;s marketing of your events. You must not upload content that is false,
        offensive, infringing or unlawful.
      </>
    ),
  },
  {
    title: 'Responsibility for your events',
    body: (
      <>
        Rhoddo provides the booking platform only and is not the organiser of your events. To the
        extent the law allows, Rhoddo is not liable for the conduct of your events, injuries, loss or
        damage at them, or disputes between you and buyers. You agree to indemnify Rhoddo against
        claims arising from your events, your listings, or your breach of these Host Terms.
      </>
    ),
  },
  {
    title: 'Ending your account',
    body: (
      <>
        You may stop hosting at any time by contacting us, after honouring tickets already sold or
        refunding them. Rhoddo may suspend or delete a host account; deleting it removes your venues,
        events and their bookings from the Service. Commission already due remains payable.
      </>
    ),
  },
  {
    title: 'Changes to these Host Terms',
    body: (
      <>
        We may update these Host Terms. When we make changes you need to agree to, we will ask you to
        accept the new version before you continue using the host panel. The date above shows when they
        last changed.
      </>
    ),
  },
  {
    title: 'Law and contact',
    body: (
      <>
        These Host Terms are governed by the laws of India, and the courts of Sikkim have jurisdiction.
        Questions:{' '}
        <a href="mailto:support@rhoddo.com" className="text-gold hover:underline">support@rhoddo.com</a>.
      </>
    ),
  },
];

export default function HostTerms() {
  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/host/register" className="text-sm text-mute transition hover:text-ink">
              Become a host
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">Legal</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">Host Terms</h1>
        <p className="mt-4 text-sm text-mute">Last updated: {LAST_UPDATED}</p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-mute">
          {SECTIONS.map((s, i) => (
            <section key={s.title}>
              <h2 className="font-display text-xl text-ink">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-3">{s.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-12 text-xs text-mute">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/host-terms" className="text-ink">Host Terms</Link>
          <Link href="/" className="hover:text-ink">Home</Link>
        </div>
      </footer>
    </div>
  );
}
