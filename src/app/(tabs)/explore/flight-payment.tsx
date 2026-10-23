import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { BRAND, FLIGHT_ROUTES, FlightBanner, FlightHeading, FlightShell, FlightSteps, INTER, formatPrice, goBackOr, replaceTo } from '@/components/flights/FlightFlowUi';
import { FLIGHT_COUPONS, computeFlightTotals, confirmFlightBooking, getFlightBookingDraft, updateFlightBookingDraft, validateFlightCoupon } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { BANKS, WALLET_BALANCE, inr } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Method = 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet';
const METHODS: { id: Method; label: string; hint: string; icon: IconName }[] = [
  { id: 'razorpay', label: 'Razorpay (test mode)', hint: 'UPI, cards and net banking', icon: 'shield-checkmark-outline' },
  { id: 'upi', label: 'UPI', hint: 'Pay with any UPI app', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Credit / Debit card', hint: 'Visa, Mastercard, RuPay', icon: 'card-outline' },
  { id: 'netbanking', label: 'Net banking', hint: 'All major banks', icon: 'business-outline' },
  { id: 'wallet', label: 'LemonTrip wallet', hint: `Balance: ${inr(WALLET_BALANCE)}`, icon: 'wallet-outline' },
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
      <FlightShell onBack={goBack}>
        <ScrollView>
          <FlightBanner title="Secure payment" text="Choose how you would like to pay." />
          <EmptyState
            icon="card-outline"
            title="No booking to pay for"
            text="Select a flight and add traveller details first."
            action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />}
          />
        </ScrollView>
      </FlightShell>
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

  const payLabel = busy ? 'Processing...' : method === 'razorpay' && razorpay.needsVerification ? 'Retry verification' : `Pay ${formatPrice(total, currency)}`;
  const footer = (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption}>Amount to pay</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{formatPrice(total, currency)}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" disabled={busy} onPress={pay} activeOpacity={0.85} style={[s.continue, busy && { opacity: 0.7 }]}>
        <Text style={s.continueText} numberOfLines={1}>{payLabel}</Text>
        {busy ? <ActivityIndicator color={BRAND} /> : <Ionicons name="lock-closed" size={19} color={BRAND} />}
      </TouchableOpacity>
    </View>
  );

  return (
    <FlightShell onBack={() => !locked && goBack()} footer={footer}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <FlightBanner title="Secure payment" text="Choose how you would like to pay." />
            <FlightSteps current={4} />

            <View style={s.card}>
              <FlightHeading eyebrow="PAYMENT METHOD" title="Pay using" />
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
                    <View style={s.methodIcon}><Ionicons name={m.icon} size={24} color={BRAND} /></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.methodTitle}>{m.label}</Text>
                      <Text style={s.methodHint}>{m.hint}</Text>
                    </View>
                    {m.id === 'wallet' ? <View style={s.useWallet}><Text style={s.useWalletText}>Use wallet</Text></View> : null}
                  </TouchableOpacity>
                );
              })}

              <View style={s.form}>
                {method === 'razorpay' ? <RazorpayPaymentDetails error={razorpay.error} /> : null}
                {method === 'upi' ? (
                  <Input label="UPI ID" icon="at-outline" autoCapitalize="none" autoCorrect={false} value={upi} onChangeText={setUpi} placeholder="name@bank" error={errors.upi} editable={!processing} />
                ) : null}
                {method === 'card' ? (
                  <>
                    <Input label="NAME ON CARD" icon="person-outline" autoCapitalize="words" value={card.name} onChangeText={(v) => setCard({ ...card, name: v })} placeholder="As printed on the card" error={errors.cardName} editable={!processing} />
                    <Input label="CARD NUMBER" icon="card-outline" keyboardType="number-pad" value={card.number} onChangeText={(v) => setCard({ ...card, number: formatCard(v) })} placeholder="0000 0000 0000 0000" maxLength={19} error={errors.cardNumber} editable={!processing} />
                    <View style={s.pair}>
                      <View style={{ flex: 1 }}>
                        <Input label="EXPIRY" keyboardType="number-pad" value={card.expiry} onChangeText={(v) => setCard({ ...card, expiry: formatExpiry(v) })} placeholder="MM/YY" maxLength={5} error={errors.expiry} editable={!processing} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Input label="CVV" keyboardType="number-pad" secureTextEntry value={card.cvv} onChangeText={(v) => setCard({ ...card, cvv: v.replace(/\D/g, '').slice(0, 4) })} placeholder="***" maxLength={4} error={errors.cvv} editable={!processing} />
                      </View>
                    </View>
                  </>
                ) : null}
                {method === 'netbanking' ? (
                  <View>
                    <Text style={s.label}>SELECT YOUR BANK</Text>
                    <View style={s.banks}>
                      {BANKS.map((b) => <TouchableOpacity key={b} accessibilityRole="button" accessibilityState={{ selected: bank === b }} onPress={() => setBank(b)} style={[s.chip, bank === b && s.chipOn]} activeOpacity={0.85}><Text style={[s.chipText, bank === b && s.chipTextOn]}>{b}</Text></TouchableOpacity>)}
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
            </View>

            {couponsAvailable ? (
              <View style={s.card}>
                <FlightHeading eyebrow="OFFERS" title="Have a coupon?" />
                <View style={s.couponRow}>
                  <View style={s.couponInput}>
                    <Ionicons name="pricetag-outline" size={20} color={Colors.textLight} />
                    <TextInput value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. FLY300" placeholderTextColor={Colors.textLight} autoCapitalize="characters" autoCorrect={false} editable={!processing} style={s.couponText} accessibilityLabel="Coupon code" />
                  </View>
                  <TouchableOpacity accessibilityRole="button" disabled={processing} onPress={appliedCode ? removeCoupon : applyCoupon} activeOpacity={0.85} style={s.apply}>
                    <Text style={s.applyText}>{appliedCode ? 'Remove' : 'Apply'}</Text>
                  </TouchableOpacity>
                </View>
                {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
                {!appliedCode ? <View style={s.suggest}>{FLIGHT_COUPONS.map((c) => <TouchableOpacity key={c.code} accessibilityRole="button" onPress={() => setCouponInput(c.code)} style={s.suggestChip} activeOpacity={0.85}><Text style={s.suggestCode}>{c.code}</Text><Text style={s.suggestLabel}>{c.label}</Text></TouchableOpacity>)}</View> : null}
              </View>
            ) : null}

            <View style={s.card}>
              <FlightHeading eyebrow="SUMMARY" title="Price details" />
              <Row label={`${offer.airline.name} ${offer.flightNumber} · ${fare?.name?.replace(/\s*·\s*sample/i, '') ?? 'Fare'}`} value={formatPrice(fareTotal, currency)} />
              {fare?.price.baseFare !== undefined || fare?.price.taxes !== undefined ? <Text style={s.sub}>Includes {[fare?.price.baseFare !== undefined && `base ${formatPrice(fare.price.baseFare, currency)}`, fare?.price.taxes !== undefined && `taxes ${formatPrice(fare.price.taxes, currency)}`, fare?.price.fees !== undefined && `fees ${formatPrice(fare.price.fees, currency)}`].filter(Boolean).join(', ')}</Text> : null}
              {draft.seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(draft.seatTotal, currency)} /> : null}
              {draft.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(draft.addOnTotal, currency)} /> : null}
              {discount > 0 ? <Row label={`Coupon ${appliedCode ?? ''}`.trim()} value={`− ${formatPrice(discount, currency)}`} good /> : null}
              <View style={s.divider} />
              <Row label="Total payable" value={formatPrice(total, currency)} bold />
            </View>

            <View style={s.notice}>
              <Ionicons name="lock-closed-outline" size={26} color={Colors.textLight} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.noticeTitle}>Secure payment demo</Text>
                <Text style={s.noticeText}>This is a demonstration checkout. No real payment is taken and no card details are stored or sent anywhere. Tip: a card ending in 0002 simulates a declined payment.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RazorpayCheckoutHost />
    </FlightShell>
  );
}


function Input({ label, error, icon, ...input }: TextInputProps & { label: string; error?: string; icon?: IconName }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, !!error && s.inputError]}>
        {icon ? <Ionicons name={icon} size={20} color={Colors.textLight} /> : null}
        <TextInput {...input} placeholderTextColor={Colors.textLight} style={s.inputText} accessibilityLabel={label} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

function Row({ label, value, bold, good }: { label: string; value: string; bold?: boolean; good?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={[s.rowLabel, bold && s.rowBold]} numberOfLines={2}>{label}</Text>
      <Text style={[s.rowValue, bold && s.rowBold, good && { color: Colors.secondary }]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceMuted, marginBottom: 10 },
  methodOn: { borderColor: BRAND, borderWidth: 1.5, backgroundColor: '#FDF3C4' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.borderStrong, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: BRAND, borderWidth: 2 },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND },
  methodIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  methodTitle: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  methodHint: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  useWallet: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#E3EFE9' },
  useWalletText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND },
  form: { marginTop: 4 },
  field: { marginBottom: 12 },
  pair: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: INTER.semibold, fontSize: TextSize.caption, letterSpacing: 0.6, color: Colors.secondary, marginBottom: 8 },
  input: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  inputText: { flex: 1, minWidth: 0, minHeight: 52, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  banks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  chipTextOn: { color: Colors.white },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 6 },
  wallet: { padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  walletTotal: { borderTopWidth: 1, borderTopColor: Colors.borderStrong, marginTop: 6, paddingTop: 10 },
  walletLabel: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  walletValue: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  payError: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  payErrorText: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.error },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponInput: { flex: 1, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  couponText: { flex: 1, minWidth: 0, minHeight: 52, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  apply: { minWidth: 96, height: 54, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 18, backgroundColor: BRAND },
  applyText: { fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.white },
  couponMsg: { fontFamily: INTER.semibold, fontSize: TextSize.caption, marginTop: 10 },
  suggest: { gap: 8, marginTop: 12 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  suggestCode: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND, backgroundColor: '#FDF3C4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  suggestLabel: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 5 },
  rowLabel: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight },
  rowValue: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND, textAlign: 'right' },
  rowBold: { fontFamily: INTER.extrabold, fontSize: TextSize.title, color: BRAND },
  sub: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, marginBottom: 4 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.body },
  noticeText: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { minWidth: 110 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { flex: 1, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 18, borderRadius: 27, backgroundColor: Colors.accent },
  continueText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge },
});