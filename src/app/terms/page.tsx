import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions — Rhoddo',
  description:
    'Terms and conditions governing use of the Rhoddo app and website.',
};

export default function TermsAndConditions() {
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
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-sm text-mute">
          Last updated: 21 November 2026
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-mute">
          <section>
            <h2 className="font-display text-xl text-ink">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By downloading, accessing, or using the Rhoddo mobile application
              or website (the &quot;Service&quot;), you agree to be bound by
              these Terms and Conditions. If you do not agree, please do not use
              the Service. The Service is operated by Waglogy
              (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              2. Eligibility
            </h2>
            <p className="mt-3">
              You must be at least 13 years of age to use Rhoddo. If you are
              under 18, you may use the Service only with the involvement of a
              parent or guardian. A participant under 18 must be registered for an
              event by their parent or guardian, who consents to the participant
              taking part and to their details being shared with the host. Each
              event may also set its own minimum age. By using the Service, you
              represent that you meet these requirements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              3. Account Registration
            </h2>
            <p className="mt-3">
              To book events, you must create an account with accurate and
              complete information. You are responsible for maintaining the
              confidentiality of your login credentials and for all activities
              that occur under your account. Notify us immediately if you
              suspect unauthorised use.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              4. Use of the Service
            </h2>
            <p className="mt-3">You agree to use Rhoddo only for lawful purposes. You must not:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                Use the Service for any fraudulent, abusive, or illegal
                activity.
              </li>
              <li>
                Attempt to interfere with, disrupt, or gain unauthorised access
                to the Service or its servers.
              </li>
              <li>
                Resell, duplicate, or transfer event passes or QR codes without
                authorisation.
              </li>
              <li>
                Scrape, crawl, or use automated means to access the Service
                without our written consent.
              </li>
              <li>
                Impersonate any person or entity, or misrepresent your
                affiliation with any person or entity.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              5. Event Bookings and Passes
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                All bookings are subject to availability and confirmation by the
                event host.
              </li>
              <li>
                Each booking generates a unique QR pass. This pass is
                non-transferable unless the event host explicitly allows
                transfers.
              </li>
              <li>
                Event details (date, time, venue, pricing) are provided by the
                host. We display this information as-is and are not liable for
                inaccuracies by the host.
              </li>
              <li>
                We reserve the right to cancel bookings if we detect fraudulent
                activity.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              6. Payments and Pricing
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>All prices are displayed in Indian Rupees (INR).</li>
              <li>
                Rhoddo does not charge buyers any platform fees. The price you
                see is the price you pay.
              </li>
              <li>
                Payments are processed through secure third-party payment
                gateways. We do not store your payment card information.
              </li>
              <li>
                By completing a purchase, you authorise us to charge the
                specified amount through the chosen payment method.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              7. Cancellations and Refunds
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Cancellation and refund policies are set by individual event
                hosts. Check the event details before booking.
              </li>
              <li>
                If an event is cancelled by the host, you will receive a full
                refund.
              </li>
              <li>
                Refunds, when applicable, will be processed to the original
                payment method within 7-10 business days.
              </li>
              <li>
                No-shows (failure to attend a booked event) are generally not
                eligible for refunds, unless the host&apos;s policy states
                otherwise.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              8. Intellectual Property
            </h2>
            <p className="mt-3">
              All content, design, logos, and branding on Rhoddo are the
              property of Waglogy or our licensors. You may not copy,
              reproduce, modify, distribute, or create derivative works without
              our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              9. User Content
            </h2>
            <p className="mt-3">
              If you submit any content (reviews, feedback, images), you grant
              us a non-exclusive, royalty-free, worldwide licence to use,
              display, and distribute such content in connection with the
              Service. You represent that you have the right to submit such
              content and that it does not violate any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              10. Disclaimers
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                The Service is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, express or
                implied.
              </li>
              <li>
                Rhoddo acts as a platform connecting attendees with event hosts.
                We are not the organiser of any event listed on the platform.
              </li>
              <li>
                We do not guarantee that the Service will be uninterrupted,
                error-free, or free from harmful components.
              </li>
              <li>
                We are not responsible for the quality, safety, or legality of
                any event listed by hosts.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              11. Limitation of Liability
            </h2>
            <p className="mt-3">
              To the maximum extent permitted by applicable law, Waglogy
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, data, or goodwill, arising from your use of or
              inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              12. Indemnification
            </h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless Waglogy, its officers,
              employees, and affiliates from any claims, damages, losses, or
              expenses (including legal fees) arising from your use of the
              Service, your violation of these Terms, or your infringement of
              any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              13. Termination
            </h2>
            <p className="mt-3">
              We may suspend or terminate your account at any time, with or
              without cause, including for violation of these Terms. Upon
              termination, your right to use the Service ceases immediately. Any
              outstanding bookings may be cancelled at our discretion.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              14. Governing Law
            </h2>
            <p className="mt-3">
              These Terms are governed by the laws of India. Any disputes
              arising out of or relating to these Terms or the Service shall be
              subject to the exclusive jurisdiction of the courts in Gangtok,
              Sikkim.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">
              15. Changes to These Terms
            </h2>
            <p className="mt-3">
              We may revise these Terms at any time by posting the updated
              version on this page. The &quot;Last updated&quot; date will be
              revised accordingly. Your continued use of the Service after
              changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">16. Contact Us</h2>
            <p className="mt-3">
              For questions about these Terms, please reach out:
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
            <Logo className="h-8 w-auto" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-mute">
              · Sikkim
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-mute md:justify-start">
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/refund-policy" className="hover:text-ink">Refunds</Link>
            <Link href="/contact" className="hover:text-ink">Contact</Link>
            <Link href="/terms" className="text-ink">Terms</Link>
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
