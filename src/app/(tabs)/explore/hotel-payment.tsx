import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HotelFareSummary } from '@/components/hotels/HotelBookingCards';
import { Card, EmptyState, Field, FlowScreen, FooterBar, HOTEL_ROUTES, HotelProgress, Notice, PrimaryButton, SectionTitle, goBackOr, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { HOTEL_COUPONS, inr, validateHotelCoupon } from '@/data/hotelBooking';
import { confirmHotelBooking, currentFare, setCoupon, useHotelBooking } from '@/utils/hotelBookingStore';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

export default function HotelPaymentScreen() {
  useAppLanguage();
  const { selection, guestNames, coupon, contact } = useHotelBooking();
  const [couponInput, setCouponInput] = useState(coupon?.code ?? '');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(coupon ? { ok: true, text: `${coupon.code} applied. You save ${inr(coupon.discount)}.` } : null);
  const payment = useBookingPayment();
  const { processing, locked } = payment;

  const derived = currentFare();
  if (!selection || !derived || !derived.nights || !guestNames[0]?.trim()) {
    return <FlowScreen><ScrollView><ScreenHeader title="Payment" eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.review)} /><EmptyState icon="card-outline" title="No booking to pay for" text="Select a room and add guest details first." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare } = derived;

  const applyCoupon = () => {
    const code = couponInput.trim();
    if (!code) { setCouponMsg({ ok: false, text: 'Enter a coupon code.' }); return; }
    // Validate against the pre-discount subtotal.
    const r = validateHotelCoupon(code, fare.subtotal);
    if (!r.ok) { setCoupon(null); setCouponMsg({ ok: false, text: r.error }); return; }
    setCoupon({ code: r.coupon.code, discount: r.discount });
    setCouponInput(r.coupon.code);
    setCouponMsg({ ok: true, text: `${r.coupon.code} applied. You save ${inr(r.discount)}.` });
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(''); setCouponMsg(null); };

  const pay = () => void payment.pay({
    service: 'hotels', amount: fare.total, currency: 'INR', itemName: `${selection.hotel.name} · ${derived.room.name}`, tripDate: selection.checkIn, couponCode: coupon?.code,
  }, { email: contact.email, contact: contact.phone }, (verified) => {
    const booking = confirmHotelBooking({ method: 'razorpay', label: 'Razorpay (test)' }, verified);
    if (!booking) throw new Error('Payment verified but the booking details changed. Contact support with payment ID ' + verified.paymentId + '.');
    replaceTo(HOTEL_ROUTES.confirmation);
  });

  return (
    <FlowScreen footer={<FooterBar caption="Amount to pay" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton label={processing ? 'Processing…' : payment.needsVerification ? 'Retry verification' : `Pay ${inr(fare.total)}`} icon="lock-closed" loading={processing} onPress={pay} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Secure payment" subtitle="Complete your booking with Razorpay test checkout." eyebrow="LEMONTRIP / HOTELS" onBack={() => !processing && goBackOr(HOTEL_ROUTES.review)} />
            <HotelProgress current={3} />

            <Card>
              <SectionTitle eyebrow="PAYMENT METHOD" title="Secure checkout" />
              <RazorpayPaymentDetails error={payment.error} />
            </Card>

            <Card>
              <SectionTitle eyebrow="OFFERS" title="Have a coupon?" />
              <View style={s.couponRow}>
                <View style={{ flex: 1 }}><Field label="COUPON CODE" icon="pricetag-outline" autoCapitalize="characters" autoCorrect={false} value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. LEMON10" editable={!locked} /></View>
                <View style={s.applyWrap}><PrimaryButton variant={coupon ? 'soft' : 'dark'} label={coupon ? 'Remove' : 'Apply'} onPress={coupon ? removeCoupon : applyCoupon} disabled={locked} /></View>
              </View>
              {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
              {!coupon ? <View style={s.suggest}>{HOTEL_COUPONS.map((c) => <TouchableOpacity key={c.code} accessibilityRole="button" disabled={locked} onPress={() => setCouponInput(c.code)} style={s.suggestChip}><Text style={s.suggestCode}>{c.code}</Text><Text style={s.suggestLabel}>{c.label}</Text></TouchableOpacity>)}</View> : null}
            </Card>

            <Card>
              <SectionTitle eyebrow="SUMMARY" title="Price details" />
              <HotelFareSummary fare={fare} couponCode={coupon?.code} />
            </Card>

            <Notice icon="lock-closed-outline" title="Test booking">Payments use Razorpay test mode. Tickets and vouchers are sample bookings until the travel provider is connected.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <RazorpayCheckoutHost />
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  couponRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  applyWrap: { width: 104, marginBottom: 12 },
  couponMsg: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.bold, marginBottom: 8 },
  suggest: { gap: 8, marginTop: 4 },
  suggestChip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  suggestCode: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.primary, backgroundColor: Colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  suggestLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textDark },
});
