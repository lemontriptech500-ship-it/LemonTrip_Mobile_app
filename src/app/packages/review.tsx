import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageHero, PackageProgress, PackageSummary, PackageTopBar } from '@/components/packages/PackageUi';
import { EmptyState, FlowScreen, FooterBar, Pill, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import { Colors } from '@/constants/colors';
import { formatLongDate, inr } from '@/data/packages';
import { currentPackageFare, usePackageBooking } from '@/utils/packageBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const GREEN = '#103D30';

export default function PackageReviewScreen() {
  useAppLanguage();
  const { pkg, date, counts, rooms, travellers, contact } = usePackageBooking();
  const [agreed, setAgreed] = useState(false);
  const [showError, setShowError] = useState(false);
  const [termsOpen, setTermsOpen] = useState(true);
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

  const cover = getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image)[0] ?? pkg.image;
  const toTravellers = () => goTo(PACKAGE_ROUTES.travellers);

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton variant="dark" label="Proceed to payment" icon="lock-closed-outline" onPress={proceed} />} />}>
      <PackageTopBar onBack={() => goBackOr(PACKAGE_ROUTES.travellers)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.content}>
          <PackageHero title="Review your booking" subtitle="Check every detail before you pay." image={cover} />
          <PackageProgress current={3} overlap />
          <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} rooms={rooms} compact changeLabel="Edit" changeIcon="create-outline" onChange={() => goTo(PACKAGE_ROUTES.plan)} />

          <View style={s.card}>
            <Head icon="calendar-outline" eyebrow="TRIP DETAILS" title="Trip details" onEdit={() => goTo(PACKAGE_ROUTES.plan)} />
            <View style={s.body}>
              <Line icon="log-in-outline" label="Starts" value={formatLongDate(date)} />
              <Line icon="log-out-outline" label="Ends" value={formatLongDate(endDate)} />
              <Line icon="moon-outline" label="Duration" value={`${pkg.duration}${nights ? ` (${nights} night${nights > 1 ? 's' : ''})` : ''}`} />
              <Line icon="bed-outline" label="Rooms" value={`${rooms} room${rooms > 1 ? 's' : ''} · twin / double sharing`} />
              <Line icon="business-outline" label="Stay" value={pkg.hotels.length ? pkg.hotels.slice(0, 2).join(' · ') : 'Hotel and room category are confirmed in the written quote.'} />
            </View>
          </View>

          <View style={s.card}>
            <Head icon="people-outline" eyebrow="TRAVELLERS" title={`${travellers.length} traveller${travellers.length > 1 ? 's' : ''}`} onEdit={toTravellers} />
            <View style={[s.body, s.paxBox]}>
              {travellers.map((t, i) => (
                <TouchableOpacity key={i} accessibilityRole="button" accessibilityLabel={`Edit ${t.name.trim()}`} onPress={toTravellers} style={[s.pax, i > 0 && s.paxBorder]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{t.name.trim().charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.paxName} numberOfLines={1}>{t.name.trim()}</Text>
                    <Text style={s.paxMeta}>{t.age} yrs · {t.gender === 'M' ? 'Male' : t.gender === 'F' ? 'Female' : 'Other'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textDark} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.card}>
            <Head icon="mail-outline" eyebrow="CONTACT" title="Voucher delivery" onEdit={toTravellers} />
            <View style={s.body}>
              <Line icon="mail-outline" label="Email" value={contact.email} wide />
              <Line icon="call-outline" label="Mobile" value={contact.phone} wide />
              {contact.passport ? <Line icon="document-text-outline" label="Passport (Lead traveller)" value={contact.passport.toUpperCase()} wide /> : null}
              {contact.requests.trim() ? <View style={s.req}><Pill icon="chatbubble-ellipses-outline" label="Special request" /><Text style={s.reqText}>{contact.requests.trim()}</Text></View> : null}
            </View>
          </View>

          <View style={s.card}>
            <Head icon="calculator-outline" eyebrow="FARE" title="Price breakdown" onEdit={() => goTo(PACKAGE_ROUTES.plan)} />
            <View style={s.body}><PackageFareSummary fare={fare} /></View>
          </View>

          <View style={s.card}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: termsOpen }} onPress={() => setTermsOpen((v) => !v)} style={s.cardHead}>
              <Ionicons name="shield-checkmark-outline" size={26} color={GREEN} />
              <Text style={[s.cardTitle, s.flex]}>Cancellation & terms</Text>
              <Ionicons name={termsOpen ? 'chevron-up' : 'chevron-down'} size={20} color={GREEN} />
            </TouchableOpacity>
            {termsOpen ? <View style={s.body}>{rules.map((line) => <View key={line} style={s.bullet}><Text style={s.dot}>•</Text><Text style={s.infoText}>{line}</Text></View>)}</View> : null}
            <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: agreed }} onPress={() => { setAgreed((v) => !v); setShowError(false); }} style={s.agree}>
              <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showError ? Colors.error : GREEN} />
              <Text style={s.agreeText}>I have verified the traveller details and agree to the booking and cancellation terms.</Text>
            </TouchableOpacity>
            {showError ? <Text style={s.error}>Please accept the terms to continue.</Text> : null}
          </View>
        </View>
      </ScrollView>
    </FlowScreen>
  );
}

function Head({ icon, eyebrow, title, onEdit }: { icon: IconName; eyebrow: string; title: string; onEdit: () => void }) {
  return (
    <View style={s.cardHead}>
      <Ionicons name={icon} size={26} color={GREEN} />
      <View style={s.flex}><Text style={s.cardEyebrow}>{eyebrow}</Text><Text style={s.cardTitle}>{title}</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Edit ${title}`} onPress={onEdit} style={s.editBtn}>
        <Ionicons name="create-outline" size={14} color={GREEN} /><Text style={s.edit}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

function Line({ icon, label, value, wide }: { icon: IconName; label: string; value: string; wide?: boolean }) {
  return <View style={s.line}><Ionicons name={icon} size={16} color={Colors.textLight} /><Text style={[s.lineLabel, wide && { width: 108 }]}>{label}</Text><Text style={s.lineValue}>{value}</Text></View>;
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  body: { marginTop: 10 },
  cardEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#E3F0EA' },
  edit: { fontFamily: 'Inter-SemiBold', fontSize: 11, color: GREEN },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  lineLabel: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, width: 76 },
  lineValue: { flex: 1, fontFamily: 'Inter-ExtraBold', fontSize: 12, color: Colors.textDark },
  paxBox: { borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingHorizontal: 12 },
  pax: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  paxBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  avatarText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.white },
  paxName: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.textDark },
  paxMeta: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  req: { alignItems: 'flex-start', gap: 6, marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  reqText: { fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, color: Colors.textDark },
  bullet: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { color: GREEN, fontSize: 12, lineHeight: 17 },
  infoText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 16, color: Colors.textLight },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12 },
  agreeText: { flex: 1, fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, color: Colors.textDark },
  error: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.error, marginTop: 8 },
});