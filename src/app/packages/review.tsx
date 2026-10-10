import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageProgress, PackageSummary, TypePill } from '@/components/packages/PackageUi';
import { Card, EmptyState, FlowScreen, FooterBar, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatLongDate, inr, travellerType } from '@/data/packages';
import { currentPackageFare, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PackageReviewScreen() {
  const { pkg, date, counts, rooms, travellers, contact } = usePackageBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const derived = currentPackageFare();

  if (!pkg || !derived || travellers.some((t) => !t.name.trim())) {
    return <FlowScreen><ScrollView><ScreenHeader title="Review booking" eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.travellers)} /><EmptyState icon="document-text-outline" title="Nothing to review yet" text="Choose a package and add traveller details first." action={<PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, endDate, nights } = derived;
  const proceed = () => { if (!agreed) { setShowError(true); return; } goTo(PACKAGE_ROUTES.payment); };
  const rules = [
    pkg.cancellation || 'Cancellation charges depend on how close to departure you cancel.',
    pkg.terms ? pkg.terms : 'Carry valid photo ID for every traveller. Names must match exactly.',
    'Booking is confirmed only after successful payment.',
  ];

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} action={<PrimaryButton label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />} />}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <ScreenHeader title="Review your booking" subtitle="Check every detail before you pay." eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.travellers)} />
          <PackageProgress current={2} />
          <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} />

          <Card>
            <SectionTitle eyebrow="TRIP" title="Trip details" right={<TouchableOpacity accessibilityRole="button" onPress={() => goTo(PACKAGE_ROUTES.plan)}><Text style={s.edit}>Change</Text></TouchableOpacity>} />
            <Line icon="log-in-outline" label="Starts" value={formatLongDate(date)} />
            <Line icon="log-out-outline" label="Ends" value={formatLongDate(endDate)} />
            <Line icon="moon-outline" label="Duration" value={`${pkg.duration}${nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}`} />
            <Line icon="bed-outline" label="Rooms" value={`${rooms} room${rooms > 1 ? 's' : ''} · twin / double sharing`} />
            {pkg.hotels.length ? <Line icon="business-outline" label="Stay" value={pkg.hotels.slice(0, 2).join(' · ')} /> : null}
          </Card>

          <Card>
            <SectionTitle eyebrow="TRAVELLERS" title={`${travellers.length} traveller${travellers.length > 1 ? 's' : ''}`} right={<TouchableOpacity accessibilityRole="button" onPress={() => goBackOr(PACKAGE_ROUTES.travellers)}><Text style={s.edit}>Edit</Text></TouchableOpacity>} />
            {travellers.map((t, i) => (
              <View key={i} style={[s.pax, i > 0 && s.paxBorder]}>
                <View style={s.avatar}><Text style={s.avatarText}>{t.name.trim().charAt(0).toUpperCase()}</Text></View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.paxName} numberOfLines={1}>{t.name.trim()}</Text>
                  <Text style={s.paxMeta}>{t.age} yrs · {t.gender === 'M' ? 'Male' : t.gender === 'F' ? 'Female' : 'Other'}</Text>
                </View>
                <TypePill type={travellerType(i, counts)} />
              </View>
            ))}
          </Card>

          <Card>
            <SectionTitle eyebrow="CONTACT" title="Voucher delivery" right={<TouchableOpacity accessibilityRole="button" onPress={() => goBackOr(PACKAGE_ROUTES.travellers)}><Text style={s.edit}>Edit</Text></TouchableOpacity>} />
            <Line icon="mail-outline" label="Email" value={contact.email} />
            <Line icon="call-outline" label="Mobile" value={`+91 ${contact.phone}`} />
            {contact.passport ? <Line icon="document-text-outline" label="Passport" value={contact.passport.toUpperCase()} /> : null}
            {contact.requests.trim() ? <View style={s.req}><Pill icon="chatbubble-ellipses-outline" label="Special request" /><Text style={s.reqText}>{contact.requests.trim()}</Text></View> : null}
          </Card>

          <Card>
            <SectionTitle eyebrow="FARE" title="Price breakdown" />
            <PackageFareSummary fare={fare} />
          </Card>

          <View style={s.info}>
            <View style={s.infoHead}><Ionicons name="alert-circle-outline" size={18} color={Colors.primaryDark} /><Text style={s.infoTitle}>Cancellation & terms</Text></View>
            {rules.map((line) => <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>)}
          </View>

          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showError ? Colors.error : Colors.primary} />
            <Text style={s.agreeText}>I have verified the traveller details and agree to the booking and cancellation terms.</Text>
          </TouchableOpacity>
          {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Line({ icon, label, value }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.primary} /><Text style={s.lineLabel}>{label}</Text><Text style={s.lineValue} numberOfLines={2}>{value}</Text></View>;
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  edit: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primary },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textLight, width: 76 },
  lineValue: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, textAlign: 'right' },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  avatarText: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  paxName: { fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  paxMeta: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, marginTop: 2 },
  req: { alignItems: 'flex-start', gap: 6, marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  reqText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
  info: { marginHorizontal: 20, marginBottom: 14, padding: 16, borderRadius: 20, backgroundColor: Colors.surfaceMuted },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.primaryDark },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 5 },
  dot: { color: Colors.primary, fontSize: TextSize.body, lineHeight: 19 },
  infoText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 19, color: Colors.textDark },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 20, marginTop: 2 },
  agreeText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, color: Colors.textDark },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginHorizontal: 20, marginTop: 8 },
});
