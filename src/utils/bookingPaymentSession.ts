import { createBookingPaymentOrder, verifyBookingPayment, type BookingPaymentInput, type BookingPaymentOrder } from './bookingPaymentApi';
import { openRazorpayCheckout } from './razorpayCheckout';
import type { RazorpayOptions, RazorpaySuccess } from './razorpayTypes';

type Dependencies = { createOrder: typeof createBookingPaymentOrder; checkout: typeof openRazorpayCheckout; verify: typeof verifyBookingPayment };

// Keep a completed Checkout receipt when verification fails. A retry must verify
// that same payment, rather than opening a second charge.
export function createBookingPaymentSession({ createOrder = createBookingPaymentOrder, checkout = openRazorpayCheckout, verify = verifyBookingPayment }: Partial<Dependencies> = {}) {
  let pending: { input: BookingPaymentInput; order: BookingPaymentOrder; receipt: RazorpaySuccess } | null = null;
  return {
    needsVerification: () => pending !== null,
    async pay(input: BookingPaymentInput, prefill: RazorpayOptions['prefill'], onReceipt: () => void) {
      if (!pending) {
        const order = await createOrder(input);
        const receipt = await checkout({ keyId: order.keyId, orderId: order.orderId, amount: order.amount, currency: order.currency, name: 'LemonTrip', description: input.itemName, prefill });
        if (receipt.razorpayOrderId !== order.orderId) throw new Error('The payment belongs to a different order. Contact support with your payment ID.');
        pending = { input, order, receipt };
        onReceipt();
      }
      const verified = await verify(pending.input.service, pending.receipt, pending.order);
      // Preserve the verified receipt until the caller has built the local voucher.
      return verified;
    },
  };
}
