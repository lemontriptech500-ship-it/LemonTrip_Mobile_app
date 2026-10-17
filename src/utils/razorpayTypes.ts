export type RazorpayOptions = {
    keyId: string; orderId: string; amount: number; currency: string;
    name: string; description: string; prefill?: { email?: string; contact?: string; name?: string }; themeColor?: string;
  };
  export type RazorpaySuccess = { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string };
  export class RazorpayCancelled extends Error { constructor() { super('Payment was cancelled.'); this.name = 'RazorpayCancelled'; } }