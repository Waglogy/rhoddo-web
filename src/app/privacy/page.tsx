import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Rhoddo',
  description:
    'How Rhoddo collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="theme-site min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-auto sm:h-10" />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm text-mute transition hover:text-ink"
            >
              Back to home
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">Legal</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-mute">Last updated: 21 November 2026</p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-mute">
          <Section n={1} title="Who we are">
            <p>
              Rhoddo is a platform for registering for races, runs and other events in Sikkim, run by
              Waglogy (&quot;we&quot;, &quot;us&quot;). This policy explains what personal data we collect
              through the Rhoddo app and website (the &quot;Service&quot;), why, who can see it, how long we
              keep it, and your rights under India&apos;s Digital Personal Data Protection Act, 2023.
            </p>
            <p className="mt-3">
              Events on Rhoddo are run by independent organisers (&quot;hosts&quot;). For the details you
              give when registering for an event, the host decides what to ask and uses the answers to run
              the event; Rhoddo stores and processes them for the host as described below.
            </p>
          </Section>

          <Section n={2} title="What we collect">
            <h3 className="mt-1 text-base font-semibold text-ink">Your account</h3>
            <List
              items={[
                'Name, email address and mobile number, and whether you have verified them with a one-time code.',
                'If you sign in with Google: your Google name, email and profile picture.',
                'When you accepted our Terms and this policy (with the IP address and device used), as a record of consent.',
              ]}
            />
            <h3 className="mt-4 text-base font-semibold text-ink">Your registrations and bookings</h3>
            <List
              items={[
                'The event, pass, number of people, amount paid, promo code, and the email and mobile number you give for the registration.',
                'Payment references from Razorpay (order and payment IDs). Card, UPI and bank details are handled by Razorpay; we never see or store them.',
                'Your QR passes and when they were scanned at the event.',
              ]}
            />
            <h3 className="mt-4 text-base font-semibold text-ink">Answers to an event&apos;s registration form</h3>
            <p className="mt-2">
              Hosts can ask questions for each person registered, for example full name, date of birth,
              gender, T-shirt size, blood group, emergency contact, medical conditions, and a{' '}
              <strong className="text-ink">photo of an identity document</strong> to confirm age category.
              Some of this is sensitive. Only give what the form asks for. If you register other people, make
              sure they (or, for under-18s, their parent or guardian) agree to you sharing their details.
            </p>
            <h3 className="mt-4 text-base font-semibold text-ink">Collected automatically</h3>
            <List
              items={[
                'Device and app information needed to run the Service and send notifications (device type, app version, notification token).',
                'Basic technical logs (IP address, time, errors) to keep the Service secure and fix problems.',
              ]}
            />
          </Section>

          <Section n={3} title="Why we use it">
            <List
              items={[
                'To create your account, sign you in, and verify your email or phone.',
                'To register you for events, take payment on the host\'s behalf, issue QR passes and check you in.',
                'To send confirmations, passes and important updates about events you registered for.',
                'To give hosts the details they need to run their event and keep participants safe.',
                'To prevent fraud and misuse, and to meet legal and accounting obligations.',
              ]}
            />
            <p className="mt-3">We do not sell your data or use registration-form answers for advertising.</p>
          </Section>

          <Section n={4} title="Who can see it">
            <List
              items={[
                <><strong className="text-ink">The event&apos;s host</strong>: your registration, contact details and form answers, including uploaded photos, for their own events only. Hosts must use them only to run that event (see our Host Terms).</>,
                <><strong className="text-ink">Rhoddo staff</strong>: only when needed to support you, the host, or keep the Service safe.</>,
                <><strong className="text-ink">Service providers</strong> who process data for us: Razorpay (payments, paid directly into the host&apos;s Razorpay account), cloud hosting and storage (our servers and Cloudflare), Brevo (emails), Google (Google sign-in) and Expo/Google (app notifications).</>,
                <><strong className="text-ink">Authorities</strong>, when the law requires it.</>,
              ]}
            />
            <p className="mt-3">
              Uploaded identity photos are stored privately: they are never public, and hosts open them
              through links that stop working after a short time.
            </p>
          </Section>

          <Section n={5} title="How long we keep it">
            <div className="mt-1 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-line">
                  <Row what="Registration-form answers and uploaded photos (ID cards etc.)" how="Deleted automatically 30 days after the event ends" />
                  <Row what="Answers and photos from checkouts that were never paid" how="Deleted after 7 days" />
                  <Row what="Booking records (who, which event and pass, amount paid)" how="Up to 3 years, for accounting and legal reasons" />
                  <Row what="Your account" how="Until you delete it" />
                  <Row what="Encrypted database backups" how="Older copies are kept for up to 6 months, then removed" />
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Hosts may download their participant list before deletion and are responsible for keeping
              and deleting their copy as our Host Terms require.
            </p>
          </Section>

          <Section n={6} title="Children">
            <p>
              Some events, such as fun runs, are open to people under 18. Anyone under 18 must be registered
              by a parent or guardian, who gives consent for their details to be collected and shared with
              the host as described here. We do not knowingly create accounts for children under 13.
            </p>
          </Section>

          <Section n={7} title="Security">
            <p>
              Data is sent over encrypted connections (HTTPS), stored on access-controlled servers, and
              backed up in encrypted form. Access is limited to the people who need it. No system is
              perfectly secure; if a breach affects your data, we will inform you and the authorities as
              the law requires.
            </p>
          </Section>

          <Section n={8} title="Your rights">
            <p>You can:</p>
            <List
              items={[
                'Ask what personal data we hold about you and get a copy.',
                'Correct or update inaccurate details.',
                'Delete your account in the app (Profile → Delete account) or by asking us. This deletes your account, your registrations and your uploaded photos. Deleting your account also cancels your place in upcoming events, so contact the host first if you still want to take part.',
                'Withdraw consent: we will stop processing data that relies on it, though this may mean you cannot take part in an event that needs it.',
                'Nominate someone to exercise these rights for you if you are unable to.',
                'Complain to us, and if not resolved, to the Data Protection Board of India.',
              ]}
            />
          </Section>

          <Section n={9} title="Changes to this policy">
            <p>
              We will post any changes here with a new &quot;Last updated&quot; date, and tell you in the app
              or by email if the change is significant.
            </p>
          </Section>

          <Section n={10} title="Contact and grievances">
            <p>For questions, requests about your data, or complaints, contact our grievance officer:</p>
            <div className="mt-3 rounded-xl border border-line bg-panel p-5">
              <p>
                <strong className="text-ink">Grievance Officer, Rhoddo (Waglogy)</strong>
              </p>
              <p className="mt-1">
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
              <p className="mt-1">Sikkim, India</p>
            </div>
            <p className="mt-3">We acknowledge requests within 7 days and aim to resolve them within 30 days.</p>
          </Section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="text-ink">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-ink">Refunds</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/" className="hover:text-ink">Home</Link>
          </div>
          <div className="text-center text-[11px] text-mute md:text-right">
            Built by <span className="text-gold">WAGLOGY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-xl text-ink">
        {n}. {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function Row({ what, how }: { what: string; how: string }) {
  return (
    <tr>
      <td className="w-1/2 px-4 py-3 text-ink">{what}</td>
      <td className="px-4 py-3">{how}</td>
    </tr>
  );
}
