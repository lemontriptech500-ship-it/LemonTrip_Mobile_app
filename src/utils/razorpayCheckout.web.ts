import { RazorpayCancelled, type RazorpayOptions, type RazorpaySuccess } from './razorpayTypes';

export { RazorpayCancelled };
export type { RazorpayOptions, RazorpaySuccess };

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
const win = () => window as unknown as { Razorpay?: RazorpayCtor };

function loadScript(): Promise<void> {
  if (win().Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay Checkout could not load.'));
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<RazorpaySuccess> {
  await loadScript();
  const Razorpay = win().Razorpay;
  if (!Razorpay) throw new Error('Razorpay Checkout is unavailable.');
  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: options.keyId, order_id: options.orderId, amount: options.amount, currency: options.currency,
      name: options.name, description: options.description, prefill: options.prefill, theme: { color: options.themeColor ?? '#ffd21a' },
      handler: (r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) =>
        resolve({ razorpayPaymentId: r.razorpay_payment_id, razorpayOrderId: r.razorpay_order_id, razorpaySignature: r.razorpay_signature }),
      modal: { ondismiss: () => reject(new RazorpayCancelled()) },
    });
    checkout.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed. Please try again.')));
    checkout.open();
  });
}