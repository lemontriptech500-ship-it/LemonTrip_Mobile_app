// Fallback for TypeScript and unsupported platforms. Metro uses razorpayCheckout.native.ts on iOS/Android
// and razorpayCheckout.web.ts on web. Shared types live in razorpayTypes.ts so these files never import each other.
import { RazorpayCancelled, type RazorpayOptions, type RazorpaySuccess } from './razorpayTypes';

export { RazorpayCancelled };
export type { RazorpayOptions, RazorpaySuccess };

export async function openRazorpayCheckout(_options: RazorpayOptions): Promise<RazorpaySuccess> {
  throw new Error('Razorpay Checkout is not available on this platform.');
}