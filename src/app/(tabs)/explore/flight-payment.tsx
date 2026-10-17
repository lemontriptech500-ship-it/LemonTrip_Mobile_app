import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FLIGHT_ROUTES, FlightProgress, formatPrice, goBackOr, replaceTo } from '@/components/flights/FlightFlowUi';
import { FLIGHT_COUPONS, computeFlightTotals, confirmFlightBooking, getFlightBookingDraft, updateFlightBookingDraft, validateFlightCoupon } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { BANKS, WALLET_BALANCE, inr } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

type Method = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet';
const METHODS: { id: Method; label: string; hint: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'razorpay', label: 'Razorpay (test mode)', hint: 'UPI, cards and net banking', icon: 'shield-checkmark-outline' },
  { id: 'upi', label: 'UPI', hint: 'Pay with any UPI app', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay', icon: 'card-outline' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major banks', icon: 'business-outline' },
  { id: 'wallet', label: 'LemonTrip wallet', hint: `Balance ${inr(WALLET_BALANCE)}`, icon: 'wallet-outline' },
];

const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function FlightPaymentScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const draft = getFlightBookingDraft();

  const [method, setMethod] = useState<Method>('razorpay');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(draft.couponCode);
  const [couponInput, setCouponInput] = useState(draft.couponCode ?? '');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState('');
  const [processing, setProcessing] = useState(false);
  const razorpay = useBookingPayment();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const busy = processing || razorpay.processing;
  const locked = busy || (method === 'razorpay' && razorpay.needsVerification);
  const goBack = () => goBackOr(FLIGHT_ROUTES.review);

  if (!selection || draft.travellers.length === 0) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Payment" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState
            icon="card-outline"
            title="No booking to pay for"
            text="Select a flight and add traveller details first."
            action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const totals = computeFlightTotals(selection, { ...draft, couponCode: appliedCode });
  if (!totals) return null;
  const { offer, fare, currency, fareTotal, subtotal, discount, total } = totals;
  const couponsAvailable = currency === 'INR';

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) { setCouponMsg({ ok: false, text: 'Enter a coupon code.' }); return; }
    const r = validateFlightCoupon(code, subtotal);
    if (!r.ok) { setAppliedCode(null); updateFlightBookingDraft({ couponCode: null }); setCouponMsg({ ok: false, text: r.error }); return; }
    setAppliedCode(r.coupon.code); updateFlightBookingDraft({ couponCode: r.coupon.code }); setCouponInput(r.coupon.code);
    setCouponMsg({ ok: true, text: `${r.coupon.code} applied. You save ${formatPrice(r.discount, currency)}.` });
  };
  const removeCoupon = () => { setAppliedCode(null); updateFlightBookingDraft({ couponCode: null }); setCouponInput(''); setCouponMsg(null); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === 'upi' && !/^[\w.-]{2,}@[A-Za-z]{2,}$/.test(upi.trim())) e.upi = 'Enter a valid UPI ID, e.g. name@bank';
    if (method === 'card') {
      if (card.name.trim().length < 2) e.cardName = 'Enter the name on the card.';
      if (card.number.replace(/\s/g, '').length !== 16) e.cardNumber = 'Enter the 16-digit card number.';
      const m = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
      const month = m ? Number(m[1]) : 0;
      const year = m ? 2000 + Number(m[2]) : 0;
      const now = new Date();
      if (!m || month < 1 || month > 12 || year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        e.expiry = 'Enter a valid, unexpired date.';
      }
      if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = '3 or 4 digits.';
    }
    if (method === 'netbanking' && !bank) e.bank = 'Select your bank.';
    if (method === 'wallet' && total > WALLET_BALANCE) e.wallet = `Insufficient wallet balance. You need ${inr(total - WALLET_BALANCE)} more.`;
    setErrors(e);
    return !Object.keys(e).length;
  };

  const pay = () => {
    if (processing || razorpay.processing) return;
    setPayError('');
    if (method === 'razorpay') {
      void razorpay.pay({
        service: 'flights', amount: total, currency, itemName: `${offer.airline.name} ${offer.flightNumber} · ${offer.departure.airportCode} → ${offer.arrival.airportCode}`, tripDate: selection.request.departureDate, couponCode: appliedCode ?? undefined,
      }, { email: draft.contactEmail, contact: draft.contactPhone }, (verified) => {
        const ticket = confirmFlightBooking({ method: 'razorpay', label: 'Razorpay (test)' }, verified);
        if (!ticket) throw new Error('Payment verified but the booking details changed. Contact support with payment ID ' + verified.paymentId + '.');
        replaceTo(FLIGHT_ROUTES.confirmation);
      });
      return;
    }
    if (!validate()) return;
    setProcessing(true);
    // Simulated gateway round-trip. A card ending 0002 is declined to test the failure path.
    timer.current = setTimeout(() => {
      if (method === 'card' && card.number.replace(/\s/g, '').endsWith('0002')) {
        setProcessing(false);
        setPayError('Your bank declined this card. Try another payment method.');
        return;
      }
      const label =
        method === 'upi' ? `UPI - ${upi.trim()}`
        : method === 'card' ? `Card ending ${card.number.replace(/\s/g, '').slice(-4)}`
        : method === 'netbanking' ? bank
        : 'LemonTrip wallet';
      const ticket = confirmFlightBooking({ method, label });
      if (!ticket) {
        setProcessing(false);
        setPayError('Something went wrong. Please try again.');
        return;
      }
      replaceTo(FLIGHT_ROUTES.confirmation);
    }, 1800);
  };

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption="Amount to pay"
          amount={formatPrice(total, currency)}
          action={<PrimaryButton label={busy ? 'Processing...' : method === 'razorpay' && razorpay.needsVerification ? 'Retry verification' : `Pay ${formatPrice(total, currency)}`} icon="lock-closed" loading={busy} onPress={pay} />}
        />
      }
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Secure payment" subtitle="Choose how you would like to pay." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => !locked && goBack()} />
            <FlightProgress current={4} />

            <Card>
              <SectionTitle eyebrow="PAYMENT METHOD" title="Pay using" />
              {METHODS.map((m) => {
                const on = method === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    disabled={locked}
                    onPress={() => { setMethod(m.id); setErrors({}); setPayError(''); }}
                    style={[s.method, on && s.methodOn]}
                  >
                    <View style={[s.radio, on && s.radioOn]}>{on ? <View style={s.radioDot} /> : null}</View>
                    <View style={s.methodIcon}><Ionicons name={m.icon} size={19} color={Colors.primary} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.methodTitle}>{m.label}</Text>
                      <Text style={s.methodHint}>{m.hint}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <View style={s.form}>
                {method === 'razorpay' ? <RazorpayPaymentDetails error={razorpay.error} /> : null}
                {method === 'upi' ? (
                  <Field label="UPI ID" icon="at-outline" autoCapitalize="none" autoCorrect={false} value={upi} onChangeText={setUpi} placeholder="name@bank" error={errors.upi} editable={!processing} />
                ) : null}
                {method === 'card' ? (
                  <>
                    <Field label="NAME ON CARD" icon="person-outline" autoCapitalize="words" value={card.name} onChangeText={(v) => setCard({ ...card, name: v })} placeholder="As printed on the card" error={errors.cardName} editable={!processing} />
                    <Field label="CARD NUMBER" icon="card-outline" keyboardType="number-pad" value={card.number} onChangeText={(v) => setCard({ ...card, number: formatCard(v) })} placeholder="0000 0000 0000 0000" maxLength={19} error={errors.cardNumber} editable={!processing} />
                    <View style={s.pair}>
                      <View style={{ flex: 1 }}>
                        <Field label="EXPIRY" keyboardType="number-pad" value={card.expiry} onChangeText={(v) => setCard({ ...card, expiry: formatExpiry(v) })} placeholder="MM/YY" maxLength={5} error={errors.expiry} editable={!processing} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Field label="CVV" keyboardType="number-pad" secureTextEntry value={card.cvv} onChangeText={(v) => setCard({ ...card, cvv: v.replace(/\D/g, '').slice(0, 4) })} placeholder="***" maxLength={4} error={errors.cvv} editable={!processing} />
                      </View>
                    </View>
                  </>
                ) : null}
                {method === 'netbanking' ? (
                  <View>
                    <Text style={s.label}>SELECT YOUR BANK</Text>
                    <View style={s.banks}>
                      {BANKS.map((b) => <Chip key={b} label={b} selected={bank === b} onPress={() => setBank(b)} />)}
                    </View>
                    {errors.bank ? <Text style={s.error}>{errors.bank}</Text> : null}
                  </View>
                ) : null}
                {method === 'wallet' ? (
                  <View style={s.wallet}>
                    <View style={s.walletRow}><Text style={s.walletLabel}>Wallet balance</Text><Text style={s.walletValue}>{inr(WALLET_BALANCE)}</Text></View>
                    <View style={s.walletRow}><Text style={s.walletLabel}>This booking</Text><Text style={s.walletValue}>- {inr(total)}</Text></View>
                    <View style={[s.walletRow, s.walletTotal]}>
                      <Text style={s.walletLabel}>Balance after</Text>
                      <Text style={[s.walletValue, total > WALLET_BALANCE && { color: Colors.error }]}>{inr(WALLET_BALANCE - total)}</Text>
                    </View>
                    {errors.wallet ? <Text style={s.error}>{errors.wallet}</Text> : null}
                  </View>
                ) : null}
              </View>
              {payError ? (
                <View style={s.payError}>
                  <Ionicons name="close-circle" size={18} color={Colors.error} />
                  <Text style={s.payErrorText}>{payError}</Text>
                </View>
              ) : null}
            </Card>

            {couponsAvailable ? (
              <Card>
                <SectionTitle eyebrow="OFFERS" title="Have a coupon?" />
                <View style={s.couponRow}>
                  <View style={{ flex: 1 }}><Field label="COUPON CODE" icon="pricetag-outline" autoCapitalize="characters" autoCorrect={false} value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. FLY300" editable={!processing} /></View>
                  <View style={s.applyWrap}><PrimaryButton variant={appliedCode ? 'soft' : 'dark'} label={appliedCode ? 'Remove' : 'Apply'} onPress={appliedCode ? removeCoupon : applyCoupon} disabled={processing} /></View>
                </View>
                {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
                {!appliedCode ? <View style={s.suggest}>{FLIGHT_COUPONS.map((c) => <TouchableOpacity key={c.code} accessibilityRole="button" onPress={() => setCouponInput(c.code)} style={s.suggestChip}><Text style={s.suggestCode}>{c.code}</Text><Text style={s.suggestLabel}>{c.label}</Text></TouchableOpacity>)}</View> : null}
              </Card>
            ) : null}

            <Card>
              <SectionTitle eyebrow="SUMMARY" title="Price details" />
              <Row label={`${offer.airline.name} ${offer.flightNumber} · ${fare?.name?.replace(/\s*·\s*sample/i, '') ?? 'Fare'}`} value={formatPrice(fareTotal, currency)} />
              {draft.seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(draft.seatTotal, currency)} /> : null}
              {draft.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(draft.addOnTotal, currency)} /> : null}
              {discount > 0 ? <Row label={`Coupon ${appliedCode ?? ''}`.trim()} value={`− ${formatPrice(discount, currency)}`} tone="good" /> : null}
              <Row label="Total payable" value={formatPrice(total, currency)} bold />
            </Card>

            <Notice icon="lock-closed-outline" title="Secure payment demo">
              This is a demonstration checkout. No real payment is taken and no card details are stored or sent anywhere. Tip: a card ending in 0002 simulates a declined payment.
            </Notice>
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
  pair: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 8 },
  banks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 8 },
  wallet: { padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  walletTotal: { borderTopWidth: 1, borderTopColor: Colors.borderStrong, marginTop: 6, paddingTop: 10 },
  walletLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight },
  walletValue: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  payError: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  couponRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  applyWrap: { width: 104, marginBottom: 12 },
  couponMsg: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, marginBottom: 8 },
  suggest: { gap: 8, marginTop: 4 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  suggestCode: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.primary, backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  suggestLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textDark },
  payErrorText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.error, fontWeight: FontWeight.bold },
});