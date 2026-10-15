import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FareSummary } from '@/components/trains/TrainCards';
import { Card, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle, TRAIN_ROUTES, TrainProgress, goBackOr, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { COUPONS, WALLET_BALANCE, inr, validateCoupon } from '@/data/trains';
import { confirmTrainBooking, currentFare, setCoupon, useTrainBooking, type TrainPayment } from '@/utils/trainBookingStore';
import { RazorpayCancelled, openRazorpayCheckout } from '@/utils/razorpayCheckout';
import { createTrainOrder, verifyTrainPayment } from '@/utils/trainPaymentApi';
import { useAuth } from '@/utils/authStore';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

type Method = TrainPayment['method'];
const METHODS: { id: Method; label: string; hint: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'razorpay', label: 'Razorpay (test mode)', hint: 'UPI, cards and net banking', icon: 'card-outline' },
  { id: 'wallet', label: 'LemonTrip wallet', hint: `Balance ${inr(WALLET_BALANCE)}`, icon: 'wallet-outline' },
];


export default function TrainPaymentScreen() {
  useAppLanguage();
  const { selection, passengers, coupon, contact } = useTrainBooking();
  const user = useAuth();
  const [method, setMethod] = useState<Method>('razorpay');
  const [couponInput, setCouponInput] = useState(coupon?.code ?? '');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(coupon ? { ok: true, text: `${coupon.code} applied. You save ${inr(coupon.discount)}.` } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState('');
  const [processing, setProcessing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const derived = currentFare();
  if (!selection || !derived || passengers.some((p) => !p.name.trim())) {
    return <FlowScreen><ScrollView><ScreenHeader title="Payment" eyebrow="LEMONTRIP / RAIL" onBack={() => goBackOr(TRAIN_ROUTES.review)} /><EmptyState icon="card-outline" title="No booking to pay for" text="Select a train and add passenger details first." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare } = derived;

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) { setCouponMsg({ ok: false, text: 'Enter a coupon code.' }); return; }
    // Validate against the pre-discount subtotal.
    const r = validateCoupon(code, fare.subtotal);
    if (!r.ok) { setCoupon(null); setCouponMsg({ ok: false, text: r.error }); return; }
    setCoupon({ code: r.coupon.code, discount: r.discount });
    setCouponInput(r.coupon.code);
    setCouponMsg({ ok: true, text: `${r.coupon.code} applied. You save ${inr(r.discount)}.` });
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(''); setCouponMsg(null); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === 'wallet' && fare.total > WALLET_BALANCE) e.wallet = `Insufficient wallet balance. You need ${inr(fare.total - WALLET_BALANCE)} more.`;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const payWithRazorpay = async () => {
    if (!user) { setPayError('Sign in to pay for your booking.'); return; }
    if (!selection || !derived) return;
    const { result } = derived;
    setProcessing(true);
    try {
      const order = await createTrainOrder({
        amount: fare.total, passengers: passengers.length, trainName: result.train.name,
        route: `${selection.fromCode} → ${selection.toCode}`, journeyDate: selection.date, couponCode: coupon?.code,
      });
      const paid = await openRazorpayCheckout({
        keyId: order.keyId, orderId: order.orderId, amount: order.amount, currency: order.currency,
        name: 'LemonTrip', description: `${result.train.name} train booking`,
        prefill: { email: contact.email, contact: contact.phone, name: user.name },
      });
      await verifyTrainPayment({ razorpayOrderId: paid.razorpayOrderId, razorpayPaymentId: paid.razorpayPaymentId, razorpaySignature: paid.razorpaySignature });
      const ticket = confirmTrainBooking({ method: 'razorpay', label: 'Razorpay (test)' }, paid.razorpayPaymentId);
      if (!ticket) { setPayError('Payment succeeded but the ticket could not be created. Contact support with payment ID ' + paid.razorpayPaymentId + '.'); setProcessing(false); return; }
      replaceTo(TRAIN_ROUTES.confirmation);
    } catch (error) {
      setProcessing(false);
      if (error instanceof RazorpayCancelled) { setPayError('Payment was cancelled. You have not been charged.'); return; }
      setPayError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    }
  };

  const pay = () => {
    if (processing) return;
    setPayError('');
    if (!validate()) return;
    if (method === 'razorpay') { void payWithRazorpay(); return; }
    setProcessing(true);
    // LemonTrip wallet is still a local demo balance.
    timer.current = setTimeout(() => {
      const ticket = confirmTrainBooking({ method, label: 'LemonTrip wallet' });
      if (!ticket) { setProcessing(false); setPayError('Something went wrong. Please try again.'); return; }
      replaceTo(TRAIN_ROUTES.confirmation);
    }, 1800);
  };

  return (
    <FlowScreen footer={<FooterBar caption="Amount to pay" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton label={processing ? 'Processing…' : `Pay ${inr(fare.total)}`} icon="lock-closed" loading={processing} onPress={pay} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Secure payment" subtitle="Choose how you would like to pay." eyebrow="LEMONTRIP / RAIL" onBack={() => !processing && goBackOr(TRAIN_ROUTES.review)} />
            <TrainProgress current={3} />

            <Card>
              <SectionTitle eyebrow="PAYMENT METHOD" title="Pay using" />
              {METHODS.map((m) => {
                const on = method === m.id;
                return (
                  <TouchableOpacity key={m.id} accessibilityRole="radio" accessibilityState={{ selected: on }} disabled={processing} onPress={() => { setMethod(m.id); setErrors({}); setPayError(''); }} style={[s.method, on && s.methodOn]}>
                    <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                    <View style={s.methodIcon}><Ionicons name={m.icon} size={19} color={Colors.primary} /></View>
                    <View style={{ flex: 1 }}><Text style={s.methodTitle}>{m.label}</Text><Text style={s.methodHint}>{m.hint}</Text></View>
                  </TouchableOpacity>
                );
              })}

              <View style={s.form}>
                {method === 'razorpay' ? <Notice icon="shield-checkmark-outline" title="Razorpay test mode">Razorpay Checkout opens next. Use test credentials only, e.g. card 4111 1111 1111 1111 with any future expiry and CVV, or UPI success@razorpay. No real money is charged.</Notice> : null}
                {method === 'wallet' ? (
                  <View style={s.wallet}>
                    <View style={s.walletRow}><Text style={s.walletLabel}>Wallet balance</Text><Text style={s.walletValue}>{inr(WALLET_BALANCE)}</Text></View>
                    <View style={s.walletRow}><Text style={s.walletLabel}>This booking</Text><Text style={s.walletValue}>− {inr(fare.total)}</Text></View>
                    <View style={[s.walletRow, s.walletTotal]}><Text style={s.walletLabel}>Balance after</Text><Text style={[s.walletValue, fare.total > WALLET_BALANCE && { color: Colors.error }]}>{inr(WALLET_BALANCE - fare.total)}</Text></View>
                    {errors.wallet ? <Text style={s.error}>{errors.wallet}</Text> : null}
                  </View>
                ) : null}
              </View>
              {payError ? <View style={s.payError}><Ionicons name="close-circle" size={18} color={Colors.error} /><Text style={s.payErrorText}>{payError}</Text></View> : null}
            </Card>

            <Card>
              <SectionTitle eyebrow="OFFERS" title="Have a coupon?" />
              <View style={s.couponRow}>
                <View style={{ flex: 1 }}><Field label="COUPON CODE" icon="pricetag-outline" autoCapitalize="characters" autoCorrect={false} value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. LEMON10" editable={!processing} /></View>
                <View style={s.applyWrap}><PrimaryButton variant={coupon ? 'soft' : 'dark'} label={coupon ? 'Remove' : 'Apply'} onPress={coupon ? removeCoupon : applyCoupon} disabled={processing} /></View>
              </View>
              {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
              {!coupon ? <View style={s.suggest}>{COUPONS.map((c) => <TouchableOpacity key={c.code} accessibilityRole="button" onPress={() => setCouponInput(c.code)} style={s.suggestChip}><Text style={s.suggestCode}>{c.code}</Text><Text style={s.suggestLabel}>{c.label}</Text></TouchableOpacity>)}</View> : null}
            </Card>

            <Card>
              <SectionTitle eyebrow="SUMMARY" title="Price details" />
              <FareSummary fare={fare} couponCode={coupon?.code} />
            </Card>

            <Notice icon="lock-closed-outline" title="Test mode">Payments run through Razorpay test mode, so no real money moves. Ticket and PNR details are still sample data until a rail provider is connected.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RazorpayCheckoutHost />
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, marginBottom: 8 },
  methodOn: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  methodIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  methodTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  methodHint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 1 },
  form: { marginTop: 10 },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 8 },
  wallet: { padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  walletTotal: { borderTopWidth: 1, borderTopColor: Colors.borderStrong, marginTop: 6, paddingTop: 10 },
  walletLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight },
  walletValue: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  payError: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  payErrorText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.error, fontWeight: FontWeight.bold },
  couponRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  applyWrap: { width: 104, marginBottom: 12 },
  couponMsg: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, marginBottom: 8 },
  suggest: { gap: 8, marginTop: 4 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  suggestCode: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.primary, backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  suggestLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textDark },
});