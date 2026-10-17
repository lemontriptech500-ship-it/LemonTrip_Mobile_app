import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { APP_API_URL } from './apiConfig';
import { hasCheckoutHost, requestCheckout } from './razorpayBus';
import { RazorpayCancelled, type RazorpayOptions, type RazorpaySuccess } from './razorpayTypes';

export { RazorpayCancelled };
export type { RazorpayOptions, RazorpaySuccess };

// Preferred: in-app WebView (see components/RazorpayCheckoutHost.native.tsx).
// Fallback when react-native-webview is not available: the backend's hosted page in an in-app browser sheet.
async function openInBrowser(options: RazorpayOptions): Promise<RazorpaySuccess> {
  const returnUrl = Linking.createURL('razorpay-result');
  const params = new URLSearchParams({
    order: options.orderId, name: options.name, description: options.description, redirect: returnUrl,
    email: options.prefill?.email ?? '', contact: options.prefill?.contact ?? '', customer: options.prefill?.name ?? '',
  });
  const result = await WebBrowser.openAuthSessionAsync(`${APP_API_URL}/pay/checkout?${params.toString()}`, returnUrl);
  if (result.type !== 'success' || !result.url) throw new RazorpayCancelled();

  const query = Linking.parse(result.url).queryParams ?? {};
  const value = (key: string) => (typeof query[key] === 'string' ? (query[key] as string) : '');
  const status = value('status');
  if (status === 'cancelled') throw new RazorpayCancelled();
  if (status !== 'success') throw new Error(value('reason') || 'Payment failed. Please try again.');
  const razorpayPaymentId = value('razorpay_payment_id'), razorpayOrderId = value('razorpay_order_id'), razorpaySignature = value('razorpay_signature');
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) throw new Error('Payment details were not returned. If money was deducted, contact support.');
  return { razorpayPaymentId, razorpayOrderId, razorpaySignature };
}

export function openRazorpayCheckout(options: RazorpayOptions): Promise<RazorpaySuccess> {
  return hasCheckoutHost() ? requestCheckout(options) : openInBrowser(options);
}