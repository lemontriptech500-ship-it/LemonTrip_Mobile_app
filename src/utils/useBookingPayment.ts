import { useEffect, useRef, useState } from 'react';
import { useAuth } from './authStore';
import { createBookingPaymentSession } from './bookingPaymentSession';
import type { BookingPaymentInput, VerifiedBookingPayment } from './bookingPaymentApi';
import type { RazorpayOptions } from './razorpayTypes';
import { RazorpayCancelled } from './razorpayTypes';

export function useBookingPayment() {
  const user = useAuth();
  const [processing, setProcessing] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [error, setError] = useState('');
  const session = useRef<ReturnType<typeof createBookingPaymentSession> | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const pay = async (input: BookingPaymentInput, contact: RazorpayOptions['prefill'], onVerified: (result: VerifiedBookingPayment) => void) => {
    if (busy.current) return;
    if (!user) { setError('Sign in to pay for your booking.'); return; }
    busy.current = true;
    setProcessing(true);
    setError('');
    session.current ??= createBookingPaymentSession();
    try {
      const verified = await session.current.pay(input, { name: user.name, ...contact }, () => { if (mounted.current) setNeedsVerification(true); });
      if (mounted.current) onVerified(verified);
    } catch (cause) {
      if (!mounted.current) return;
      const message = cause instanceof RazorpayCancelled ? 'Payment cancelled. Your booking has not been confirmed.' : cause instanceof Error ? cause.message : 'Payment failed. Please try again.';
      setError(session.current.needsVerification() ? `${message} Your payment is saved for verification; retry without paying again.` : message);
    } finally {
      busy.current = false;
      if (mounted.current) setProcessing(false);
    }
  };
  return { pay, processing, needsVerification, error, locked: processing || needsVerification };
}
