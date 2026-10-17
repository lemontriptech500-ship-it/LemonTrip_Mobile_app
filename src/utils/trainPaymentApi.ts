import { APP_API_URL } from './apiConfig';
import { featureRequest } from './featureApi';

export type TrainOrder = { orderId: string; amount: number; currency: string; keyId: string; bookingId: string; bookingReference: string; testMode?: boolean };

export async function createTrainOrder(input: { amount: number; passengers: number; trainName: string; route: string; journeyDate: string; couponCode?: string }) {
  const data = await featureRequest<TrainOrder>(APP_API_URL, '/api/payments/razorpay/trains/order', { method: 'POST', body: input });
  if (typeof data.orderId !== 'string' || typeof data.keyId !== 'string' || !Number.isFinite(data.amount)) throw new Error('The payment order could not be verified. Please try again.');
  return data;
}

export async function verifyTrainPayment(input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
  const data = await featureRequest<{ status: string; bookingId: string }>(APP_API_URL, '/api/payments/razorpay/trains/verify', { method: 'POST', body: input });
  if (data.status !== 'paid') throw new Error('Payment could not be verified. If money was deducted, contact support with your payment ID.');
  return data;
}
