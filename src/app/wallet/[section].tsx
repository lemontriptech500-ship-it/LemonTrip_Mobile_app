import { useAppLanguage } from '@/utils/intl';
import { getAppLocale } from '@/utils/intl';
import { Action, Copy, Empty, FeatureScreen, Field, Panel, Row } from '@/components/FeatureScreen';
import { useAuth } from '@/utils/authStore';
import { createTopupOrder, featureRequest, validateCoupon, verifyTopupPayment } from '@/utils/featureApi';
import { APP_API_URL } from '@/utils/apiConfig';
import { openRazorpayCheckout } from '@/utils/razorpayCheckout';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { BrandedPage, BRAND, INTER } from '@/components/account/BrandedPage';
import { Text, TextInput } from '@/components/ui/Text';
import { TouchableOpacity } from '@/components/ui/Pressable';

import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Wallet pages use the same slightly smaller type scale as Explore.
const TextSize = { micro: 10, caption: 11, body: 13, bodyLarge: 14, title: 16, heading: 18, displaySmall: 20, display: 24 } as const;
// Banner artwork lives in assets/images (file name as saved in the project).
const PAYMENT_BANNER = require('../../../assets/images/Secure Travel Payment Illustration.png');
const COUPON_BANNER = require('../../../assets/images/Tropical Travel Essentials in Green.png');
const WALLET_BANNER = require('../../../assets/images/Green Wallet, Golden Rupee, Rising Flight.png');
type IconName = React.ComponentProps<typeof Ionicons>['name'];
const waysToPay: { title: string; detail: string; icon: IconName; highlight?: boolean }[] = [
  { title: 'UPI', detail: 'Available when secure checkout is connected', icon: 'phone-portrait-outline' },
  { title: 'Credit / debit card', detail: 'Card details are handled securely by our payment provider', icon: 'card-outline' },
  { title: 'Net banking', detail: 'Pay securely with your bank', icon: 'business-outline' },
  { title: 'LemonTrip wallet', detail: 'Use a verified balance', icon: 'wallet-outline', highlight: true },
];

function PaymentMethodsView() {
  return (
    <BrandedPage hideBanner banner={PAYMENT_BANNER} title="Payment methods" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      <View style={pm.promo}>
        <View style={pm.flex}>
          <Text style={pm.promoTitle}>Fast, secure and hassle-free payments</Text>
          <Text style={pm.promoText}>Enjoy a smoother travel experience with multiple payment options.</Text>
        </View>
        <View style={pm.promoArtBox}><Image source={PAYMENT_BANNER} style={pm.promoArt} resizeMode="cover" /></View>
      </View>

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
    </BrandedPage>
  );
}

function AddMoneyView({ amount, onChangeAmount, note, busy, onContinue }: { amount: string; onChangeAmount: (value: string) => void; note: string; busy: boolean; onContinue: () => void }) {
  const off = busy || !amount.trim();
  const good = note.startsWith('Payment verified');
  return (
    <BrandedPage hideBanner banner={WALLET_BANNER} title="Add money" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      <View style={pm.card}>
        <Text style={pm.addTitle}>How much would you like to add?</Text>
        <Text style={pm.fieldLabel}>Amount (INR)</Text>
        <View style={pm.amountWrap}>
          <Text style={pm.rupee}>₹</Text>
          <TextInput value={amount} onChangeText={onChangeAmount} accessibilityLabel="Amount (INR)" keyboardType="decimal-pad" placeholder="Enter amount" placeholderTextColor={Colors.textLight} style={pm.amountInput} />
        </View>
        <Text style={pm.addNote}>Wallet top-ups are processed in Razorpay test mode. Your balance changes only after payment verification.</Text>
        {note ? (
          <View accessibilityRole={good ? undefined : 'alert'} style={[pm.resultNote, good ? pm.resultGood : pm.resultBad]}>
            <Ionicons name={good ? 'checkmark-circle' : 'alert-circle'} size={18} color={good ? Colors.success : Colors.error} />
            <Text style={[pm.resultText, !good && { color: Colors.error }]}>{note}</Text>
          </View>
        ) : null}
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy }} disabled={off} onPress={onContinue} activeOpacity={0.85} style={[pm.emptyButton, pm.payButton, off && { opacity: 0.6 }]}>
          <Text style={pm.emptyButtonText}>{busy ? 'Creating order...' : 'Continue to secure payment'}</Text>
          <View style={pm.arrowCircle}><Ionicons name="arrow-forward" size={18} color={BRAND} /></View>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.replace('/wallet')} activeOpacity={0.85} style={pm.outlineButton}>
          <Text style={pm.outlineText}>Access website wallet</Text>
          <Ionicons name="arrow-forward" size={18} color={BRAND} />
        </TouchableOpacity>
      </View>
    </BrandedPage>
  );
}

function CouponsView({ code, onChangeCode, note, busy, onCheck }: { code: string; onChangeCode: (value: string) => void; note: string; busy: boolean; onCheck: () => void }) {
  const off = busy || !code.trim();
  const good = /is valid for/.test(note);
  return (
    <BrandedPage hideBanner banner={COUPON_BANNER} title="Coupons & promo codes" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      <View style={pm.card}>
        <Text style={pm.addTitle}>Have a promo code?</Text>
        <Text style={pm.fieldLabel}>Promo code</Text>
        <View style={pm.amountWrap}>
          <Ionicons name="pricetag-outline" size={22} color={BRAND} />
          <TextInput value={code} onChangeText={onChangeCode} accessibilityLabel="Promo code" autoCapitalize="characters" autoCorrect={false} placeholder="Enter code" placeholderTextColor={Colors.textLight} style={pm.amountInput} />
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy }} disabled={off} onPress={onCheck} activeOpacity={0.85} style={[pm.emptyButton, pm.payButton, off && { opacity: 0.6 }]}>
          <Text style={pm.emptyButtonText}>{busy ? 'Checking...' : 'Check code'}</Text>
          <View style={pm.arrowCircle}><Ionicons name="arrow-forward" size={18} color={BRAND} /></View>
        </TouchableOpacity>
        {note ? (
          <View accessibilityRole={good ? undefined : 'alert'} style={[pm.resultNote, good ? pm.resultGood : pm.resultBad]}>
            <Ionicons name={good ? 'checkmark-circle' : 'alert-circle'} size={18} color={good ? Colors.success : Colors.error} />
            <Text style={[pm.resultText, !good && { color: Colors.error }]}>{note}</Text>
          </View>
        ) : null}
        <Text style={pm.addNote}>Coupon eligibility is verified at checkout. Browse offers for the full terms.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/offers')} activeOpacity={0.85} style={[pm.outlineButton, { marginTop: 14 }]}>
          <Text style={pm.outlineText}>Browse offers</Text>
          <Ionicons name="arrow-forward" size={18} color={BRAND} />
        </TouchableOpacity>
      </View>
    </BrandedPage>
  );
}

function PaymentStatusView({ reference, onChangeReference }: { reference: string; onChangeReference: (value: string) => void }) {
  return (
    <BrandedPage hideBanner banner={PAYMENT_BANNER} title="Payment status" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      <View style={pm.card}>
        <Text style={pm.addTitle}>Check a payment</Text>
        <Text style={pm.fieldLabel}>Payment reference</Text>
        <View style={pm.amountWrap}>
          <Ionicons name="document-text-outline" size={22} color={BRAND} />
          <TextInput value={reference} onChangeText={onChangeReference} accessibilityLabel="Payment reference" autoCorrect={false} placeholder="Enter reference from your payment receipt" placeholderTextColor={Colors.textLight} style={pm.amountInput} />
        </View>
        <Text style={pm.addNote}>No verified payment result is available on this device. Contact support with your reference for help.</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/contact')} activeOpacity={0.85} style={pm.emptyButton}>
          <Text style={pm.emptyButtonText}>Contact payment support</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </BrandedPage>
  );
}

type TransactionItem = { id: string; description: string; amount: number; status: string; date: string };

function TransactionsView({ signedIn, items, error }: { signedIn: boolean; items: TransactionItem[]; error: string }) {
  return (
    <BrandedPage hideBanner banner={PAYMENT_BANNER} title="Wallet transactions" subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">
      {items.length ? (
        <View style={pm.card}>
          <Text style={pm.cardTitle}>Recent activity</Text>
          {items.map((item, index) => (
            <View key={item.id} style={[pm.row, index < items.length - 1 && pm.divider]}>
              <View style={pm.iconCircle}><Ionicons name="receipt-outline" size={22} color={BRAND} /></View>
              <View style={pm.flex}>
                <Text style={pm.rowTitle} numberOfLines={2}>{item.description}</Text>
                <Text style={pm.rowDetail}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)} · {item.date}</Text>
              </View>
              <Text style={pm.txAmount}>{item.amount.toLocaleString(getAppLocale())}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={pm.empty}>
          <View style={pm.emptyIcon}><Ionicons name="receipt-outline" size={34} color={BRAND} /></View>
          <Text style={pm.emptyTitle}>{!signedIn ? 'Sign in to see your transactions' : 'Transactions unavailable'}</Text>
          <Text style={pm.emptyText}>{error || 'Verified wallet activity will appear here when your wallet service is available.'}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push((!signedIn ? '/login' : '/contact') as never)} style={pm.emptyButton} activeOpacity={0.85}>
            <Text style={pm.emptyButtonText}>{!signedIn ? 'Sign in' : 'Wallet support'}</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
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
  iconHighlight: { backgroundColor: Colors.surfaceMuted },
  rowTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  rowDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  noticeIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption, lineHeight: 17 },
  noticeBody: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
  promo: { marginHorizontal: 16, marginTop: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, borderRadius: 22, backgroundColor: Colors.successSoft, overflow: 'hidden' },
  promoTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge, lineHeight: 22 },
  promoText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 4 },
  promoArtBox: { width: 110, height: 92, borderRadius: 18, overflow: 'hidden' },
  promoArt: { position: 'absolute', right: 0, top: 0, width: 276, height: 92 },
  txAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.body },
  empty: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyIcon: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', borderRadius: 36, backgroundColor: Colors.surfaceMuted },
  emptyTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginTop: 14 },
  emptyText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.body, lineHeight: 20, marginTop: 6 },
  emptyButton: { minHeight: 52, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderRadius: 999, backgroundColor: BRAND },
  emptyButtonText: { fontFamily: INTER.bold, color: Colors.white, fontSize: TextSize.body },
  addTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginBottom: 14 },
  fieldLabel: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption, marginBottom: 8 },
  amountWrap: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  rupee: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.heading },
  amountInput: { flex: 1, minWidth: 0, paddingVertical: 10, fontFamily: INTER.regular, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  addNote: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 12 },
  resultNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14 },
  resultGood: { backgroundColor: Colors.successSoft },
  resultBad: { backgroundColor: Colors.errorSoft },
  resultText: { flex: 1, fontFamily: INTER.medium, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17 },
  payButton: { paddingLeft: 20, paddingRight: 6 },
  arrowCircle: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },
  outlineButton: { minHeight: 52, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderRadius: 999, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  outlineText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
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
  if (section === 'add-money') return <><AddMoneyView amount={amount} onChangeAmount={setAmount} note={topupNote} busy={topupBusy} onContinue={() => void startTopup()} /><RazorpayCheckoutHost /></>;
  if (section === 'coupons') return <CouponsView code={reference} onChangeCode={setReference} note={couponNote} busy={couponBusy} onCheck={() => void checkCoupon(reference.trim())} />;
  if (section === 'payment-status') return <PaymentStatusView reference={reference} onChangeReference={setReference} />;
  if (section === 'transactions') return <TransactionsView signedIn={!!user} items={user && actor === user.id ? transactions : []} error={error} />;
  return <><FeatureScreen title={titles[section] ?? 'Wallet'} subtitle="Keep every payment clear and easy to follow." eyebrow="LEMONTRIP WALLET">{section === 'add-money' ? <Panel title="How much would you like to add?"><Field label="Amount (INR)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Enter amount" /><Copy>Wallet top-ups are processed in Razorpay test mode. Your balance changes only after payment verification.</Copy>{topupNote ? <Copy>{topupNote}</Copy> : null}<Action label={topupBusy ? 'Creating order...' : 'Continue to secure payment'} disabled={topupBusy || !amount.trim()} onPress={() => void startTopup()} /><Action label="Access website wallet" secondary onPress={() => router.replace('/wallet')} /></Panel> : section === 'payment-methods' ? <Panel title="Ways to pay"><Row title="UPI" detail="Available when secure checkout is connected" icon="phone-portrait-outline" /><Row title="Credit / debit card" detail="Card details are handled by the payment provider" icon="card-outline" /><Row title="Net banking" detail="Pay securely with your bank" icon="business-outline" /><Row title="LemonTrip wallet" detail="Use a verified balance" icon="wallet-outline" /><Copy>Payment methods will become selectable when a secure payment provider is available.</Copy></Panel> : section === 'coupons' ? <><Panel title="Have a promo code?"><Field label="Promo code" value={reference} onChangeText={setReference} autoCapitalize="characters" placeholder="Enter code" /><Action label={couponBusy ? 'Checking...' : 'Check code'} disabled={couponBusy || !reference.trim()} onPress={() => void checkCoupon(reference.trim())} />{couponNote ? <Copy>{couponNote}</Copy> : null}<Copy>Coupon eligibility is verified at checkout. Browse offers for the full terms.</Copy><Action label="Browse offers" onPress={() => router.push('/offers')} /></Panel></> : section === 'payment-status' ? <Panel title="Check a payment"><Field label="Payment reference" value={reference} onChangeText={setReference} placeholder="Reference from your payment receipt" /><Copy>No verified payment result is available on this device. Contact support with your reference for help.</Copy><Action label="Contact payment support" onPress={() => router.push('/contact')} /></Panel> : transactions.length && user && actor === user.id ? transactions.map(item => <Panel key={item.id} title={item.description}><Copy>{item.status} · {item.date}</Copy><Copy>{item.amount.toLocaleString(getAppLocale())}</Copy></Panel>) : <Empty title={!user ? 'Sign in to see your transactions' : 'Transactions unavailable'} copy={error || 'Verified wallet activity will appear here when your wallet service is available.'} icon="receipt-outline" action={!user ? 'Sign in' : 'Wallet support'} route={!user ? '/login' : '/contact'} />}</FeatureScreen><RazorpayCheckoutHost /></>;
}

export function generateStaticParams() { return Object.keys(titles).map(section => ({ section })); }