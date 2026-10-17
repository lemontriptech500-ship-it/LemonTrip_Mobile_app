import type { RazorpayOptions, RazorpaySuccess } from './razorpayTypes';

// Small bridge between openRazorpayCheckout() and the <RazorpayCheckoutHost /> modal mounted on the payment screen.
export type CheckoutRequest = { options: RazorpayOptions; resolve: (result: RazorpaySuccess) => void; reject: (error: Error) => void };

let host: ((request: CheckoutRequest) => void) | null = null;

export function registerCheckoutHost(handler: (request: CheckoutRequest) => void) {
  host = handler;
  return () => { if (host === handler) host = null; };
}

export const hasCheckoutHost = () => host !== null;

export function requestCheckout(options: RazorpayOptions): Promise<RazorpaySuccess> {
  return new Promise((resolve, reject) => {
    if (!host) { reject(new Error('Checkout is not ready. Please try again.')); return; }
    host({ options, resolve, reject });
  });
}