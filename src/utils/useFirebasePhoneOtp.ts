import { useEffect, useState } from 'react';
import { firebasePhoneError, resetFirebasePhoneCode, sendFirebasePhoneCode } from '@/utils/firebasePhoneAuthService';
import type { FirebasePhoneChallenge } from '@/utils/firebasePhoneShared';
export function useFirebasePhoneOtp() {
  const [challenge, setChallenge] = useState<FirebasePhoneChallenge | null>(null);
  const [verifiedIdToken, setVerifiedIdToken] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const showError = (message: string, codeValue = '') => {
    setError(message);
    setErrorCode(codeValue);
  };

  const sendCode = async (phone: string) => {
    if (busy || resendSeconds > 0) return false;
    setBusy(true);
    setError('');
    setErrorCode('');
    try {
      setChallenge(await sendFirebasePhoneCode(phone));
      setVerifiedIdToken('');
      setCode('');
      setResendSeconds(60);
      return true;
    } catch (reason) {
      console.log('FIREBASE SEND ERROR:', reason);
      showError(firebasePhoneError(reason));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    if (verifiedIdToken) return verifiedIdToken;
    if (!challenge) {
      showError('Request a verification code first.');
      return null;
    }
    if (!/^\d{6}$/.test(code)) {
      showError('Enter the six-digit code.');
      return null;
    }
    setBusy(true);
    setError('');
    setErrorCode('');
    try {
      const idToken = await challenge.confirm(code);
      setVerifiedIdToken(idToken);
      return idToken;
    } catch (reason) {
      showError(firebasePhoneError(reason));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    await resetFirebasePhoneCode();
    setChallenge(null);
    setVerifiedIdToken('');
    setCode('');
    setError('');
    setErrorCode('');
    setResendSeconds(0);
  };

  return { challenge, code, setCode: (value: string) => setCode(value.replace(/\D/g, '').slice(0, 6)), error, errorCode, busy, resendSeconds, sendCode, verifyCode, reset, showError };
}
