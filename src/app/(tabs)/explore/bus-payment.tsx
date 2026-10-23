import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { FareSummary } from '@/components/buses/BusCards';
import { BRAND, BUS_ROUTES, BusBanner, BusCardBox, BusFooter, BusHeading, BusNotice, BusShell, BusSteps, EmptyState, INTER, PrimaryButton, goBackOr, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { COUPONS, inr, validateCoupon } from '@/data/buses';
import { confirmBusBooking, currentFare, setCoupon, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function BusPaymentScreen() {
  useAppLanguage();
  const { selection, passengers, coupon, contact } = useBusBooking();
  const [couponInput, setCouponInput] = useState(coupon?.code ?? '');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(coupon ? { ok: true, text: `${coupon.code} applied. You save ${inr(coupon.discount)}.` } : null);
  const payment = useBookingPayment();
  const { processing, locked } = payment;

  const derived = currentFare();
  if (!selection || !derived || !selection.seats.length || passengers.length !== selection.seats.length || passengers.some((p) => !p.name.trim())) {
    return (
      <BusShell onBack={() => goBackOr(BUS_ROUTES.review)}>
        <ScrollView>
          <BusBanner title="Secure payment" text="Complete your booking with Razorpay test checkout." />
          <EmptyState icon="card-outline" title="No booking to pay for" text="Select your seats and add passenger details first." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} />
        </ScrollView>
      </BusShell>
    );
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

  const pay = () => void payment.pay({
    service: 'buses', amount: fare.total, currency: 'INR', itemName: `${derived.bus.operator} · ${selection.fromCode} → ${selection.toCode}`, tripDate: selection.date, couponCode: coupon?.code,
  }, { email: contact.email, contact: contact.phone }, (verified) => {
    const booking = confirmBusBooking({ method: 'razorpay', label: 'Razorpay (test)' }, verified);
    if (!booking) throw new Error('Payment verified but the booking details changed. Contact support with payment ID ' + verified.paymentId + '.');
    replaceTo(BUS_ROUTES.confirmation);
  });

  return (
    <BusShell onBack={() => !processing && goBackOr(BUS_ROUTES.review)} footer={<BusFooter caption="Amount to pay" amount={inr(fare.total)} label={processing ? 'Processing…' : payment.needsVerification ? 'Retry verification' : `Pay ${inr(fare.total)}`} icon="lock-closed" loading={processing} onPress={pay} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <BusBanner title="Secure payment" text="Complete your booking with Razorpay test checkout." />
            <BusSteps current={3} />

            <BusCardBox>
              <BusHeading eyebrow="PAYMENT METHOD" title="Secure checkout" />
              <RazorpayPaymentDetails error={payment.error} />
            </BusCardBox>

            <BusCardBox>
              <BusHeading eyebrow="OFFERS" title="Have a coupon?" />
              <View style={s.couponRow}>
                <View style={s.couponInput}>
                  <Ionicons name="pricetag-outline" size={20} color={Colors.textLight} />
                  <TextInput value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. LEMON10" placeholderTextColor={Colors.textLight} autoCapitalize="characters" autoCorrect={false} editable={!locked} style={s.couponText} accessibilityLabel="Coupon code" />
                </View>
                <TouchableOpacity accessibilityRole="button" disabled={locked} onPress={coupon ? removeCoupon : applyCoupon} activeOpacity={0.85} style={s.apply}>
                  <Text style={s.applyText}>{coupon ? 'Remove' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
              {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
              {!coupon ? <View style={s.suggest}>{COUPONS.map((c) => <TouchableOpacity key={c.code} accessibilityRole="button" disabled={locked} onPress={() => setCouponInput(c.code)} style={s.suggestChip} activeOpacity={0.85}><Text style={s.suggestCode}>{c.code}</Text><Text style={s.suggestLabel}>{c.label}</Text></TouchableOpacity>)}</View> : null}
            </BusCardBox>

            <BusCardBox>
              <BusHeading eyebrow="SUMMARY" title="Price details" />
              <FareSummary fare={fare} couponCode={coupon?.code} />
            </BusCardBox>

            <BusNotice icon="lock-closed-outline" title="Test booking">Payments use Razorpay test mode. Tickets and vouchers are sample bookings until the travel provider is connected.</BusNotice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RazorpayCheckoutHost />
    </BusShell>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
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
});