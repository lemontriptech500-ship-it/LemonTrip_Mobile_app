import { ScreenHeader } from '@/components/ScreenHeader';
import { FlightProgress, formatPrice } from '@/components/flights/FlightFlowUi';
import { confirmFlightBooking, getFlightBookingDraft } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, Row, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { BANKS, WALLET_BALANCE, inr } from '@/data/trains';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Method = 'upi' | 'card' | 'netbanking' | 'wallet';
const METHODS: { id: Method; label: string; hint: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
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
  const selection = getFlightSelection();
  const draft = getFlightBookingDraft();

  const [method, setMethod] = useState<Method>('upi');
  const [upi, setUpi] = useState('');
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [bank, setBank] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [payError, setPayError] = useState('');
  const [processing, setProcessing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/flight-booking/seats' as never);
  };

  if (!selection || draft.travellers.length === 0) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Payment" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState
            icon="card-outline"
            title="No booking to pay for"
            text="Select a flight and add traveller details first."
            action={<PrimaryButton label="Search flights" onPress={() => router.replace('/(tabs)/explore/flights' as never)} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;
  const total = fareTotal + draft.seatTotal + draft.addOnTotal;

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
    if (processing) return;
    setPayError('');
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
      router.replace('/flight-booking/confirmation' as never);
    }, 1800);
  };

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption="Amount to pay"
          amount={formatPrice(total, currency)}
          action={<PrimaryButton label={processing ? 'Processing...' : `Pay ${formatPrice(total, currency)}`} icon="lock-closed" loading={processing} onPress={pay} />}
        />
      }
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Secure payment" subtitle="Choose how you would like to pay." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => !processing && goBack()} />
            <FlightProgress current={3} />

            <Card>
              <SectionTitle eyebrow="PAYMENT METHOD" title="Pay using" />
              {METHODS.map((m) => {
                const on = method === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    disabled={processing}
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

            <Card>
              <SectionTitle eyebrow="SUMMARY" title="Price details" />
              <Row label={`${offer.airline.name} ${offer.flightNumber} - ${fare?.name ?? 'Fare'}`} value={formatPrice(fareTotal, currency)} />
              {draft.seatTotal > 0 ? <Row label={`Seats (${draft.seats.join(', ')})`} value={formatPrice(draft.seatTotal, currency)} /> : null}
              {draft.addOnTotal > 0 ? <Row label="Add-ons" value={formatPrice(draft.addOnTotal, currency)} /> : null}
              <Row label="Total" value={formatPrice(total, currency)} bold />
            </Card>

            <Notice icon="lock-closed-outline" title="Secure payment demo">
              This is a demonstration checkout. No real payment is taken and no card details are stored or sent anywhere. Tip: a card ending in 0002 simulates a declined payment.
            </Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  methodTitle: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  methodHint: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, marginTop: 1 },
  form: { marginTop: 10 },
  pair: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.9, color: Colors.textLight, marginBottom: 8 },
  banks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginTop: 8 },
  wallet: { padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  walletTotal: { borderTopWidth: 1, borderTopColor: Colors.borderStrong, marginTop: 6, paddingTop: 10 },
  walletLabel: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textLight },
  walletValue: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  payError: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.errorBorder },
  payErrorText: { flex: 1, fontFamily: 'Manrope', fontSize: 13, color: Colors.error, fontWeight: '700' },
});
