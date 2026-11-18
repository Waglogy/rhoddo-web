'use client';

// Razorpay's own checkout window, for registration pages. The app uses the native
// SDK for the same flow (rhoddo-app- src/lib/razorpay.ts).

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

/** The buyer closed checkout. `failure` is set when a payment attempt had failed first. */
export class CheckoutClosed extends Error {
  constructor(readonly failure?: string) {
    super(failure ?? 'Payment cancelled');
  }
}

type RazorpayInstance = { open: () => void; on: (event: string, cb: (resp: any) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SCRIPT_URL;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return loading;
}

/** Opens checkout and resolves once Razorpay reports a successful payment. */
export async function openRazorpay(options: Record<string, unknown>): Promise<RazorpaySuccess> {
  await loadScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error("Couldn't load the payment window. Try again.");
  return new Promise((resolve, reject) => {
    // Razorpay keeps its window open after a failed attempt so the buyer can retry,
    // so a failure is only reported once they close it.
    let lastFailure: string | undefined;
    const rzp = new Razorpay({
      ...options,
      handler: (resp: RazorpaySuccess) => resolve(resp),
      modal: { ondismiss: () => reject(new CheckoutClosed(lastFailure)), confirm_close: true },
    });
    rzp.on('payment.failed', (resp: any) => {
      lastFailure = resp?.error?.description || 'The payment did not go through.';
    });
    rzp.open();
  });
}
