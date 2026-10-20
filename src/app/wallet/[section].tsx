import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { Action, Copy, Empty, FeatureScreen, Field, Panel, Row } from '@/components/FeatureScreen';
import { useAuth } from '@/utils/authStore';
import { createTopupOrder, featureRequest, validateCoupon, verifyTopupPayment } from '@/utils/featureApi';
import { APP_API_URL } from '@/utils/apiConfig';
import { openRazorpayCheckout } from '@/utils/razorpayCheckout';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { BrandedPage, BRAND, INTER } from '@/components/account/BrandedPage';
import { Text } from '@/components/ui/Text';
import { TextSize } from '@/constants/typography';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Banner artwork lives in assets/images (file name as saved in the project).
const PAYMENT_BANNER = require('../../../assets/images/Secure Travel Payment Illustration.png');
type IconName = React.ComponentProps<typeof Ionicons>['name'];
const waysToPay: { title: string; detail: string; icon: IconName; highlight?: boolean }[] = [
  { title: 'UPI', detail: 'Available when secure checkout is connected', icon: 'phone-portrait-outline' },
  { title: 'Credit / debit card', detail: 'Card details are handled securely by our payment provider', icon: 'card-outline' },
  { title: 'Net banking', detail: 'Pay securely with your bank', icon: 'business-outline' },
  { title: 'LemonTrip wallet', detail: 'Use a verified balance', icon: 'wallet-outline', highlight: true },
];

function PaymentMethodsView() {
  return (
    <BrandedPage banner={PAYMENT_BANNER} title="Payment methods" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      <View style={pm.card}>
        <Text style={pm.cardTitle}>Ways to pay</Text>
        <Text style={pm.cardSub}>Options you can use at checkout.</Text>
        {waysToPay.map((item, index) => (
          <View key={item.title} style={[pm.row, index < waysToPay.length - 1 && pm.divider]}>
            <View style={[pm.iconCircle, item.highlight && pm.iconHighlight]}><Ionicons name={item.icon} size={22} color={BRAND} /></View>
            <View style={pm.flex}>
              <Text style={pm.rowTitle}>{item.title}</Text>
              <Text style={pm.rowDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
        <View style={pm.notice}>
          <View style={pm.noticeIcon}><Ionicons name="shield-checkmark-outline" size={22} color={BRAND} /></View>
          <View style={pm.flex}>
            <Text style={pm.noticeTitle}>Secure and trusted payments</Text>
            <Text style={pm.noticeBody}>Payment methods will become selectable when a secure payment provider is available.</Text>
          </View>
        </View>
      </View>

      <View style={pm.promo}>
        <View style={pm.flex}>
          <Text style={pm.promoTitle}>Fast, secure and hassle-free payments</Text>
          <Text style={pm.promoText}>Enjoy a smoother travel experience with multiple payment options.</Text>
        </View>
        <View style={pm.promoArtBox}><Image source={PAYMENT_BANNER} style={pm.promoArt} resizeMode="cover" /></View>
      </View>
    </BrandedPage>
  );
}

const pm = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title },
  cardSub: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 4, marginBottom: 8 },
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconCircle: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Colors.surfaceMuted },
  iconHighlight: { backgroundColor: Colors.accentSoft },
  rowTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  rowDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  noticeIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption, lineHeight: 17 },
  noticeBody: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  promo: { marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, borderRadius: 22, backgroundColor: Colors.accentSoft, overflow: 'hidden' },
  promoTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge, lineHeight: 22 },
  promoText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 4 },
  promoArtBox: { width: 110, height: 92, borderRadius: 18, overflow: 'hidden' },
  promoArt: { position: 'absolute', right: 0, top: 0, width: 276, height: 92 },
});

const titles: Record<string, string> = { transactions: 'Wallet transactions', 'add-money': 'Add money', 'payment-methods': 'Payment methods', coupons: 'Coupons & promo codes', 'payment-status': 'Payment status' };
export default function WalletSection() {
  useAppLanguage();
  const [topupNote, setTopupNote] = useState(''); const [topupBusy, setTopupBusy] = useState(false);
  const startTopup = async () => {
    const rupees = Number(amount);
    if (!Number.isFinite(rupees) || rupees < 100 || rupees > 100000) { setTopupNote('Enter an amount between INR 100 and INR 100,000.'); return; }
    setTopupBusy(true); setTopupNote('');
    try {
      const order = await createTopupOrder(rupees);
      const receipt = await openRazorpayCheckout({ keyId: order.keyId, orderId: order.orderId, amount: order.amount, currency: order.currency, name: 'LemonTrip', description: 'Wallet top-up', prefill: { email: user?.email || '' } });
      const result = await verifyTopupPayment(receipt);
      setTopupNote(`Payment verified. Your wallet balance is now ₹${result.balance.toLocaleString('en-IN')}. Reference: ${order.topupReference}.`);
    } catch (cause) { setTopupNote(cause instanceof Error ? cause.message : 'Top-up is unavailable right now.'); }
    finally { setTopupBusy(false); }
  };
  const [couponNote, setCouponNote] = useState(''); const [couponBusy, setCouponBusy] = useState(false);
  const checkCoupon = async (code: string) => {
    setCouponBusy(true); setCouponNote('');
    try {
      let firstError = '';
      for (const service of ['flight', 'hotel', 'bus', 'train', 'package']) {
        try { const result = await validateCoupon(code, service); setCouponNote(`Code ${result.code} is valid for ${service} bookings. The final discount is confirmed at checkout.`); return; }
        catch (cause) { if (!firstError && cause instanceof Error) firstError = cause.message; }
      }
      setCouponNote(firstError || 'This coupon could not be verified.');
    } finally { setCouponBusy(false); }
  };
  const { section } = useLocalSearchParams<{ section: string }>(); const user = useAuth(); const [actor, setActor] = useState(''); const [amount, setAmount] = useState(''); const [reference, setReference] = useState(''); const [error, setError] = useState(''); const [transactions, setTransactions] = useState<{ id: string; description: string; amount: number; status: string; date: string }[]>([]);
  useEffect(() => { let active = true; if (section !== 'transactions' || !user) return; void featureRequest<{ transactions: typeof transactions }>(APP_API_URL, '/api/wallet/transactions?page=1&limit=20').then(data => { if (!Array.isArray(data.transactions)) throw new Error('Transactions could not be verified.'); if (active) { setActor(user.id); setTransactions(data.transactions.filter(item => typeof item.id === 'string' && typeof item.description === 'string' && Number.isFinite(item.amount) && typeof item.status === 'string' && typeof item.date === 'string')); } }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Transactions unavailable.'); }); return () => { active = false; }; }, [section, user]);
  if (section === 'payment-methods') return <PaymentMethodsView />;
  return <><FeatureScreen title={titles[section] ?? 'Wallet'} subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">{section === 'add-money' ? <Panel title="How much would you like to add?"><Field label="Amount (INR)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Enter amount" /><Copy>Wallet top-ups are processed in Razorpay test mode. Your balance changes only after payment verification.</Copy>{topupNote ? <Copy>{topupNote}</Copy> : null}<Action label={topupBusy ? 'Creating order...' : 'Continue to secure payment'} disabled={topupBusy || !amount.trim()} onPress={() => void startTopup()} /><Action label="Access website wallet" secondary onPress={() => router.replace('/wallet')} /></Panel> : section === 'payment-methods' ? <Panel title="Ways to pay"><Row title="UPI" detail="Available when secure checkout is connected" icon="phone-portrait-outline" /><Row title="Credit / debit card" detail="Card details are handled by the payment provider" icon="card-outline" /><Row title="Net banking" detail="Pay securely with your bank" icon="business-outline" /><Row title="LemonTrip wallet" detail="Use a verified balance" icon="wallet-outline" /><Copy>Payment methods will become selectable when a secure payment provider is available.</Copy></Panel> : section === 'coupons' ? <><Panel title="Have a promo code?"><Field label="Promo code" value={reference} onChangeText={setReference} autoCapitalize="characters" placeholder="Enter code" /><Action label={couponBusy ? 'Checking...' : 'Check code'} disabled={couponBusy || !reference.trim()} onPress={() => void checkCoupon(reference.trim())} />{couponNote ? <Copy>{couponNote}</Copy> : null}<Copy>Coupon eligibility is verified at checkout. Browse offers for the full terms.</Copy><Action label="Browse offers" onPress={() => router.push('/offers')} /></Panel></> : section === 'payment-status' ? <Panel title="Check a payment"><Field label="Payment reference" value={reference} onChangeText={setReference} placeholder="Reference from your payment receipt" /><Copy>No verified payment result is available on this device. Contact support with your reference for help.</Copy><Action label="Contact payment support" onPress={() => router.push('/contact')} /></Panel> : transactions.length && user && actor === user.id ? transactions.map(item => <Panel key={item.id} title={item.description}><Copy>{item.status} · {item.date}</Copy><Copy>{item.amount.toLocaleString(getAppLocale())}</Copy></Panel>) : <Empty title={!user ? 'Sign in to see your transactions' : 'Transactions unavailable'} copy={error || 'Verified wallet activity will appear here when your wallet service is available.'} icon="receipt-outline" action={!user ? 'Sign in' : 'Wallet support'} route={!user ? '/login' : '/contact'} />}</FeatureScreen><RazorpayCheckoutHost /></>;
}

export function generateStaticParams() { return Object.keys(titles).map(section => ({ section })); }