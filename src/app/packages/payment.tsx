import { useBookingPayment } from '@/utils/useBookingPayment';
import { RazorpayPaymentDetails } from '@/components/RazorpayPaymentDetails';
import { RazorpayCheckoutHost } from '@/components/RazorpayCheckoutHost';
import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageHero, PackageProgress, PackageSummary, PackageTopBar } from '@/components/packages/PackageUi';
import { EmptyState, FlowScreen, FooterBar, Notice, PrimaryButton, goBackOr, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { PACKAGE_COUPONS, inr, validatePackageCoupon } from '@/data/packages';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import { Ionicons } from '@expo/vector-icons';
import { confirmPackageBooking, currentPackageFare, setCoupon, usePackageBooking } from '@/utils/packageBookingStore';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { TextInput } from '@/components/ui/Text';

const GREEN = '#103D30';

export default function PackagePaymentScreen() {
  useAppLanguage();
  const { pkg, travellers, coupon, contact, date, counts, rooms } = usePackageBooking();
  const [couponInput, setCouponInput] = useState(coupon?.code ?? '');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(coupon ? { ok: true, text: `${coupon.code} applied. You save ${inr(coupon.discount)}.` } : null);
  const payment = useBookingPayment();
  const { processing, locked } = payment;

  const derived = currentPackageFare();
  if (!pkg || !derived || travellers.some((t) => !t.name.trim())) {
    return <FlowScreen><ScrollView><ScreenHeader title="Payment" eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.review)} /><EmptyState icon="card-outline" title="No booking to pay for" text="Choose a package and add traveller details first." action={<PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, endDate } = derived;

  const applyCoupon = (value?: string) => {
    const code = (value ?? couponInput).trim();
    if (value) setCouponInput(code);
    if (!code) { setCouponMsg({ ok: false, text: 'Enter a coupon code.' }); return; }
    // Validate against the pre-discount subtotal.
    const r = validatePackageCoupon(code, fare.subtotal);
    if (!r.ok) { setCoupon(null); setCouponMsg({ ok: false, text: r.error }); return; }
    setCoupon({ code: r.coupon.code, discount: r.discount });
    setCouponInput(r.coupon.code);
    setCouponMsg({ ok: true, text: `${r.coupon.code} applied. You save ${inr(r.discount)}.` });
  };
  const removeCoupon = () => { setCoupon(null); setCouponInput(''); setCouponMsg(null); };

  const pay = () => void payment.pay({
    service: 'packages', amount: fare.total, currency: 'INR', itemName: `${pkg.title} · ${pkg.duration}`, tripDate: date, couponCode: coupon?.code,
  }, { email: contact.email, contact: contact.phone }, (verified) => {
    const booking = confirmPackageBooking({ method: 'razorpay', label: 'Razorpay (test)' }, verified);
    if (!booking) throw new Error('Payment verified but the booking details changed. Contact support with payment ID ' + verified.paymentId + '.');
    replaceTo(PACKAGE_ROUTES.confirmation);
  });

  const cover = getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image)[0] ?? pkg.image;

  return (
    <FlowScreen footer={<FooterBar caption="Amount to pay" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton variant="dark" label={processing ? 'Processing…' : payment.needsVerification ? 'Retry verification' : `Pay ${inr(fare.total)}`} icon="lock-closed" loading={processing} onPress={pay} />} />}>
      <PackageTopBar onBack={() => !processing && goBackOr(PACKAGE_ROUTES.review)} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <PackageHero title="Secure payment" subtitle="Complete your booking with Razorpay test checkout." image={cover} />
            <PackageProgress current={4} overlap />
            <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} rooms={rooms} compact />

            <View style={s.card}>
              <Text style={s.eyebrow}>PAYMENT METHOD</Text>
              <Text style={s.title}>Secure checkout</Text>
              <View style={s.body}><RazorpayPaymentDetails compact error={payment.error} /></View>
            </View>

            <View style={s.card}>
              <Text style={s.eyebrow}>OFFERS</Text>
              <Text style={s.title}>Have a coupon?</Text>
              <View style={[s.body, s.couponRow]}>
                <View style={s.couponInput}>
                  <Ionicons name="pricetag-outline" size={16} color={GREEN} />
                  <TextInput accessibilityLabel="Coupon code" autoCapitalize="characters" autoCorrect={false} value={couponInput} onChangeText={(v) => { setCouponInput(v.toUpperCase()); setCouponMsg(null); }} placeholder="e.g. HOLIDAY10" placeholderTextColor={Colors.textLight} editable={!locked} style={s.input} />
                </View>
                <TouchableOpacity accessibilityRole="button" disabled={locked} onPress={coupon ? removeCoupon : () => applyCoupon()} style={[s.applyBtn, coupon && s.applyBtnSoft]}>
                  <Text style={[s.applyText, coupon && { color: GREEN }]}>{coupon ? 'Remove' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
              {couponMsg ? <Text style={[s.couponMsg, { color: couponMsg.ok ? Colors.success : Colors.error }]}>{couponMsg.text}</Text> : null}
              {!coupon ? (
                <View style={s.suggest}>
                  {PACKAGE_COUPONS.map((c) => (
                    <View key={c.code} style={s.suggestRow}>
                      <Ionicons name="pricetag-outline" size={18} color={Colors.textDark} />
                      <Text style={s.suggestCode}>{c.code}</Text>
                      <Text style={s.suggestLabel} numberOfLines={2}>{c.label}</Text>
                      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Apply ${c.code}`} disabled={locked} onPress={() => applyCoupon(c.code)} style={s.suggestBtn}><Text style={s.suggestBtnText}>Apply</Text></TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={s.card}>
              <Text style={s.eyebrow}>SUMMARY</Text>
              <Text style={s.title}>Price details</Text>
              <View style={s.body}><PackageFareSummary fare={fare} couponCode={coupon?.code} /></View>
            </View>

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
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  body: { marginTop: 10 },
  eyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  title: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  couponRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponInput: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  input: { flex: 1, minWidth: 0, minHeight: 44, fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.textDark },
  applyBtn: { minWidth: 92, minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, borderRadius: 14, backgroundColor: GREEN },
  applyBtnSoft: { backgroundColor: '#E3F0EA' },
  applyText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
  couponMsg: { fontFamily: 'Inter-SemiBold', fontSize: 11, marginTop: 8 },
  suggest: { gap: 8, marginTop: 12 },
  suggestRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  suggestCode: { fontFamily: 'Inter-ExtraBold', fontSize: 12, color: GREEN, backgroundColor: '#E3F0EA', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  suggestLabel: { flex: 1, minWidth: 0, fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight },
  suggestBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1.5, borderColor: GREEN, backgroundColor: Colors.surface },
  suggestBtnText: { fontFamily: 'Inter-ExtraBold', fontSize: 12, color: GREEN },
});