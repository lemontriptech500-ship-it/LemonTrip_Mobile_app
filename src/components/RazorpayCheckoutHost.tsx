// Web does not need a host: razorpayCheckout.web.ts opens Razorpay's checkout.js directly.
// The in-app WebView version lives in RazorpayCheckoutHost.native.tsx.
export function RazorpayCheckoutHost() {
    return null;
  }