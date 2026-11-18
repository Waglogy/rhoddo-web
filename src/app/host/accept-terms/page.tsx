import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireHostToken } from '@/lib/auth';
import { hostApi } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AcceptHostTermsForm } from './AcceptHostTermsForm';

// Hosts who signed up before the Host Terms existed, or before they last changed,
// accept them here before using the host panel.
export default async function AcceptHostTermsPage() {
  await requireHostToken();
  const me = await hostApi<{ organizer: { businessName: string; termsAccepted: boolean } }>('/organizer/me');
  if (me.organizer.termsAccepted) redirect('/host');

  return (
    <div className="relative min-h-screen px-6 py-16">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-lg">
        <Link href="/" className="label">← Rhoddo</Link>
        <h1 className="mt-3 font-display text-4xl text-ink">Our Host Terms</h1>
        <p className="mt-3 text-sm text-mute">
          Before you continue, {me.organizer.businessName}, please read and accept the Rhoddo Host
          Terms. They cover Rhoddo&apos;s commission, payments to your Razorpay account, refunds,
          event review, and how you handle buyers&apos; details.
        </p>
        <div className="card mt-8 p-6">
          <AcceptHostTermsForm />
        </div>
      </div>
    </div>
  );
}
