import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Rhoddo',
  description:
    'How Rhoddo collects, uses, and protects your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-ink">Rhoddo</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-mute transition hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="label">Legal</div>
        <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-mute">
          Last updated: 13 June 2025
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-mute">
          <section>
            <h2 className="font-display text-xl text-ink">1. Introduction</h2>
            <p className="mt-3">
              Rhoddo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
              operated by Waglogy. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you use our
              mobile application and website (collectively, the
              &quot;Service&quot;). By using Rhoddo, you agree to the practices
              described in this policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              2. Information We Collect
            </h2>
            <h3 className="mt-4 text-base font-semibold text-ink">
              a) Information you provide
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Account information: name, email address, phone number when you
                register.
              </li>
              <li>
                Booking details: event selections, ticket preferences, and
                transaction history.
              </li>
              <li>
                Communications: messages you send to us through support or
                feedback channels.
              </li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-ink">
              b) Information collected automatically
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Device information: device model, operating system, unique device
                identifiers.
              </li>
              <li>
                Usage data: pages visited, features used, time spent on the app,
                crash logs.
              </li>
              <li>
                Location data: approximate location based on IP address; precise
                location only with your explicit consent to help discover nearby
                events.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              3. How We Use Your Information
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>To create and manage your account.</li>
              <li>To process event bookings and generate QR passes.</li>
              <li>To show you relevant events in your district or area.</li>
              <li>
                To send booking confirmations, event reminders, and important
                service updates.
              </li>
              <li>To improve our app, fix bugs, and enhance user experience.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              4. Sharing of Information
            </h2>
            <p className="mt-3">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong className="text-ink">Event hosts</strong> — limited
                booking information necessary for event entry and management.
              </li>
              <li>
                <strong className="text-ink">Payment processors</strong> — to
                process your transactions securely. We do not store your payment
                card details.
              </li>
              <li>
                <strong className="text-ink">Service providers</strong> —
                trusted third parties that help us operate the Service (hosting,
                analytics, notifications).
              </li>
              <li>
                <strong className="text-ink">Legal authorities</strong> — when
                required by law or to protect our rights and safety.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              5. Data Storage and Security
            </h2>
            <p className="mt-3">
              Your data is stored on secure servers. We implement
              industry-standard security measures including encryption in transit
              (TLS) and at rest to protect your personal information. However, no
              method of electronic storage is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              6. Data Retention
            </h2>
            <p className="mt-3">
              We retain your personal data for as long as your account is active
              or as needed to provide the Service. Booking records may be
              retained for up to 3 years for legal and accounting purposes. You
              may request deletion of your account and associated data at any
              time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">7. Your Rights</h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate or incomplete data.</li>
              <li>Request deletion of your account and personal data.</li>
              <li>Withdraw consent for location tracking at any time.</li>
              <li>Opt out of promotional communications.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              8. Children&apos;s Privacy
            </h2>
            <p className="mt-3">
              Rhoddo is not intended for children under the age of 13. We do not
              knowingly collect personal information from children under 13. If
              you believe a child has provided us with personal data, please
              contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              9. Third-Party Links
            </h2>
            <p className="mt-3">
              The Service may contain links to third-party websites or services.
              We are not responsible for the privacy practices of these external
              sites. We encourage you to read their privacy policies before
              providing any personal information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              10. Changes to This Policy
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. Changes will
              be posted on this page with an updated &quot;Last updated&quot;
              date. Continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">11. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy or your personal
              data, please contact us:
            </p>
            <div className="mt-3 rounded-xl border border-line bg-panel p-5">
              <p>
                <strong className="text-ink">Waglogy</strong>
              </p>
              <p className="mt-1">
                Email:{' '}
                <a
                  href="mailto:support@rhoddo.com"
                  className="text-gold hover:underline"
                >
                  support@rhoddo.com
                </a>
              </p>
              <p className="mt-1">Sikkim, India</p>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-ink">Rhoddo</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="text-ink">Privacy</Link>
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
