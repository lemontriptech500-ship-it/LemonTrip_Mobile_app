import { APP_API_URL } from './apiConfig';
import { featureRequest } from './featureApi';
import type { RazorpaySuccess } from './razorpayTypes';

export type BookingPaymentService = 'flights' | 'buses' | 'hotels' | 'packages' | 'cart';
export type BookingPaymentInput = { service: BookingPaymentService; amount: number; currency: string; itemName: string; tripDate?: string; couponCode?: string };
export type BookingPaymentOrder = { orderId: string; amount: number; currency: string; keyId: string; bookingId: string; bookingReference: string; testMode: boolean };
export type VerifiedBookingPayment = { bookingId: string; paymentId: string; orderId: string };

export async function createBookingPaymentOrder({ service, ...input }: BookingPaymentInput): Promise<BookingPaymentOrder> {
  if (input.currency !== 'INR') throw new Error('Razorpay test checkout currently supports INR bookings only. Choose an INR fare.');
  const order = await featureRequest<BookingPaymentOrder>(APP_API_URL, `/api/payments/razorpay/${service}/order`, { method: 'POST', body: input });
  if (!order.testMode || !order.keyId?.startsWith('rzp_test_') || !order.orderId?.startsWith('order_') || !order.bookingId || order.currency !== 'INR' || order.amount !== Math.round(input.amount * 100)) {
    throw new Error('The test payment order could not be verified. Please try again.');
  }
  return order;
}

export async function verifyBookingPayment(service: BookingPaymentService, receipt: RazorpaySuccess, order: BookingPaymentOrder): Promise<VerifiedBookingPayment> {
  if (receipt.razorpayOrderId !== order.orderId) throw new Error('The payment belongs to a different order. Contact support with your payment ID.');
  const verified = await featureRequest<{ status: string; bookingId: string }>(APP_API_URL, `/api/payments/razorpay/${service}/verify`, { method: 'POST', body: receipt });
  if (verified.status !== 'paid' || verified.bookingId !== order.bookingId) throw new Error('Payment could not be verified. Retry verification with the same payment.');
  return { bookingId: verified.bookingId, paymentId: receipt.razorpayPaymentId, orderId: order.orderId };
}
