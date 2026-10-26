import { useAppLanguage } from '@/utils/intl';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageHero, PackageProgress, PackageSummary, PackageTopBar, TypePill } from '@/components/packages/PackageUi';
import { Chip, EmptyState, FlowScreen, FooterBar, Notice, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Ui } from '@/constants/theme';
import { getPackageGallery } from '@/data/packageImages';
import { Ionicons } from '@expo/vector-icons';
import { MAX_GUESTS, totalTravellers } from '@/data/packages';
import { Colors } from '@/constants/colors';
import { AGE_RANGE, inr, travellerType } from '@/data/packages';
import { useAuth } from '@/utils/authStore';
import { currentPackageFare, setContact, setCounts, updateTraveller, usePackageBooking } from '@/utils/packageBookingStore';
import { normalizePhoneInput } from '@/utils/authApi';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';

type Errors = { travellers: Record<number, { name?: string; age?: string; gender?: string }>; email?: string; phone?: string; passport?: string };
type IconName = React.ComponentProps<typeof Ionicons>['name'];
const GREEN = '#103D30';
const GENDERS = [{ id: 'M', label: 'Male' }, { id: 'F', label: 'Female' }, { id: 'O', label: 'Other' }] as const;

export default function PackageTravellersScreen() {
  useAppLanguage();
  const { pkg, date, counts, rooms, travellers, contact } = usePackageBooking();
  const user = useAuth();
  const saved = usePersonalItems('travellers', isTraveller);
  const [errors, setErrors] = useState<Errors>({ travellers: {} });
  const [open, setOpen] = useState<number>(0);

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (!contact.email && user?.email) setContact({ email: user.email });
    if (!contact.phone && user?.phone) setContact({ phone: String(user.phone) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.phone]);

  const derived = currentPackageFare();
  if (!pkg || !derived) {
    return <FlowScreen><ScrollView><ScreenHeader title="Travellers" eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.list)} /><EmptyState icon="people-outline" title="No package selected" text="Pick a package, date and group size first." action={<PrimaryButton label="Browse packages" onPress={() => replaceTo(PACKAGE_ROUTES.list)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, endDate } = derived;

  const validate = () => {
    const next: Errors = { travellers: {} };
    travellers.forEach((t, i) => {
      const type = travellerType(i, counts); const [lo, hi] = AGE_RANGE[type];
      const e: { name?: string; age?: string; gender?: string } = {};
      if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(t.name.trim())) e.name = 'Enter the full name as on the ID / passport.';
      const age = Number(t.age);
      if (t.age === '' || !Number.isInteger(age) || age < lo || age > hi) e.age = `${type} age must be ${lo}–${hi}.`;
      if (!t.gender) e.gender = 'Select gender.';
      if (Object.keys(e).length) next.travellers[i] = e;
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) next.email = 'Enter a valid email address.';
    if (!normalizePhoneInput(contact.phone)) next.phone = 'Enter a valid phone number with country code.';
    if (pkg.international && !/^[A-Za-z0-9]{6,9}$/.test(contact.passport.trim())) next.passport = 'Enter the lead traveller’s passport number.';
    setErrors(next);
    const firstBad = Object.keys(next.travellers).map(Number)[0];
    if (firstBad !== undefined) setOpen(firstBad); else if (next.passport) setOpen(0);
    return !Object.keys(next.travellers).length && !next.email && !next.phone && !next.passport;
  };
  const proceed = () => { if (validate()) { setContact({ phone: normalizePhoneInput(contact.phone) ?? contact.phone }); goTo(PACKAGE_ROUTES.review); } };
  const fillSaved = (index: number, first: string, last: string) => updateTraveller(index, { name: `${first} ${last}`.trim() });

  const cover = getPackageGallery(pkg.id, pkg.title, pkg.destination, pkg.image)[0] ?? pkg.image;
  const guests = totalTravellers(counts);
  const canAdd = counts.adults + counts.children < MAX_GUESTS;
  const addTraveller = () => { setCounts({ adults: counts.adults + 1 }); setOpen(guests); };

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton variant="dark" label="Review booking" icon="arrow-forward" onPress={proceed} />} />}>
      <PackageTopBar onBack={() => goBackOr(PACKAGE_ROUTES.plan)} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <PackageHero title="Traveller details" subtitle="Names must match a valid government ID." image={cover} />
            <PackageProgress current={2} overlap />
            <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} rooms={rooms} compact onChange={() => replaceTo(PACKAGE_ROUTES.list)} />

            {travellers.map((t, i) => {
              const e = errors.travellers[i] ?? {};
              const type = travellerType(i, counts);
              const isOpen = open === i;
              const hasError = Object.keys(e).length > 0;
              return (
                <View key={i} style={s.card}>
                  <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: isOpen }} onPress={() => setOpen(isOpen ? -1 : i)} style={s.cardHead}>
                    <Ionicons name="people-outline" size={26} color={GREEN} />
                    <View style={s.flex}>
                      <Text style={s.cardEyebrow} numberOfLines={1}>{i === 0 ? 'TRAVELLER 1 (Lead traveller)' : `TRAVELLER ${i + 1}`}</Text>
                      {!isOpen && t.name.trim() ? <Text style={s.cardName} numberOfLines={1}>{t.name.trim()}</Text> : null}
                    </View>
                    {hasError && !isOpen ? <Ionicons name="alert-circle" size={18} color={Colors.error} /> : null}
                    <TypePill type={type} />
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={GREEN} />
                  </TouchableOpacity>
                  {isOpen ? (
                    <View style={s.cardBody}>
                      {saved.items.length ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips} style={{ marginBottom: 12 }}>
                          {saved.items.map((x) => <Chip key={x.id} icon="person-outline" label={`${x.firstName} ${x.lastName}`.trim()} onPress={() => fillSaved(i, x.firstName, x.lastName)} />)}
                        </ScrollView>
                      ) : null}
                      <Input label="Full name (as on ID proof)" icon="person-outline" value={t.name} onChangeText={(v) => updateTraveller(i, { name: v })} placeholder="Enter full name" autoCapitalize="words" error={e.name} />
                      <View style={s.pair}>
                        <View style={{ flex: 1 }}><Input label="Age" icon="calendar-outline" keyboardType="number-pad" maxLength={3} value={t.age} onChangeText={(v) => updateTraveller(i, { age: v.replace(/\D/g, '') })} placeholder="Years" error={e.age} /></View>
                        <View style={s.vDivider} />
                        <View style={{ flex: 1.6 }}>
                          <Text style={s.label}>Gender</Text>
                          <View style={s.genders}>
                            {GENDERS.map((g) => (
                              <TouchableOpacity key={g.id} accessibilityRole="button" accessibilityState={{ selected: t.gender === g.id }} onPress={() => updateTraveller(i, { gender: g.id })} style={[s.gender, t.gender === g.id && s.genderOn]}>
                                <Text style={[s.genderText, t.gender === g.id && s.genderTextOn]}>{g.label}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                        </View>
                      </View>
                      {i === 0 && pkg.international ? (
                        <>
                          <Input label="Passport number" icon="document-text-outline" autoCapitalize="characters" autoCorrect={false} maxLength={9} value={contact.passport} onChangeText={(v) => setContact({ passport: v.toUpperCase() })} placeholder="e.g. N1234567" error={errors.passport} />
                          <Text style={s.hint}>Enter a number for your region; include its country code if needed.</Text>
                        </>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })}

            {canAdd ? (
              <TouchableOpacity accessibilityRole="button" onPress={addTraveller} style={s.addBtn}>
                <Ionicons name="add-circle" size={22} color={GREEN} />
                <Text style={s.addText}>Add another traveller</Text>
              </TouchableOpacity>
            ) : null}

            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="mail-outline" size={26} color={GREEN} />
                <View style={s.flex}><Text style={s.cardEyebrow}>CONTACT</Text><Text style={s.cardTitle}>Where should we send your voucher?</Text></View>
              </View>
              <View style={[s.cardBody, s.pair]}>
                <View style={{ flex: 1 }}><Input label="Email" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} /></View>
                <View style={s.vDivider} />
                <View style={{ flex: 1 }}><Input label="Mobile number" icon="call-outline" keyboardType="phone-pad" maxLength={20} value={contact.phone} onChangeText={(v) => setContact({ phone: v })} placeholder="Include country code, e.g. +1" error={errors.phone} /></View>
              </View>
            </View>

            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="document-text-outline" size={26} color={GREEN} />
                <View style={s.flex}><Text style={s.cardEyebrow}>OPTIONAL</Text><Text style={s.cardTitle}>Special requests</Text></View>
              </View>
              <View style={s.cardBody}>
                <View style={[s.inputWrap, { alignItems: 'flex-start', paddingTop: 10 }]}>
                  <Ionicons name="chatbubble-outline" size={16} color={Colors.textLight} style={{ marginTop: 2 }} />
                  <TextInput accessibilityLabel="Special requests" multiline value={contact.requests} onChangeText={(v) => setContact({ requests: v.slice(0, 300) })} placeholder="Dietary needs, celebrations, accessibility…" placeholderTextColor={Colors.textLight} style={[s.input, { minHeight: 56, textAlignVertical: 'top' }]} />
                </View>
                <Text style={s.hint}>Requests are passed to the operator and cannot be guaranteed.</Text>
              </View>
            </View>

            <View style={s.card}>
              <View style={s.cardHead}>
                <Ionicons name="calculator-outline" size={26} color={GREEN} />
                <View style={s.flex}><Text style={s.cardEyebrow}>FARE</Text><Text style={s.cardTitle}>Price summary</Text></View>
              </View>
              <View style={s.cardBody}><PackageFareSummary fare={fare} /></View>
            </View>
            <Notice icon="information-circle-outline">Prices are per person on twin sharing. Final itinerary and hotel details are shared in your booking voucher. Availability is confirmed at booking.</Notice>
            {pkg.international ? <Notice icon="airplane-outline">Passport must be valid for at least 6 months from the travel date. Visa requirements depend on your nationality.</Notice> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlowScreen>
  );
}

function Input({ label, icon, error, ...input }: TextInputProps & { label: string; icon: IconName; error?: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.inputWrap, !!error && s.inputError]}>
        <Ionicons name={icon} size={16} color={Colors.textLight} />
        <TextInput {...input} placeholderTextColor={Colors.textLight} style={s.input} accessibilityLabel={label} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  /* cards */
  card: { ...Ui.card, marginHorizontal: 10, marginBottom: 12, padding: 14, borderRadius: 22 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardBody: { marginTop: 12 },
  cardEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: 11, letterSpacing: 1.2, color: GREEN },
  cardName: { fontFamily: 'Inter-Regular', fontSize: 12, color: Colors.textLight, marginTop: 2 },
  cardTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 16, color: Colors.textDark, marginTop: 2 },
  /* inputs */
  field: { marginBottom: 12 },
  label: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark, marginBottom: 6 },
  inputWrap: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background },
  inputError: { borderColor: Colors.error },
  input: { flex: 1, minWidth: 0, minHeight: 44, fontFamily: 'Inter-Regular', fontSize: 13, color: Colors.textDark },
  pair: { flexDirection: 'row', gap: 10 },
  vDivider: { width: 1, backgroundColor: Colors.border, marginBottom: 12 },
  genders: { flexDirection: 'row', gap: 6 },
  gender: { flex: 1, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  genderOn: { backgroundColor: GREEN, borderColor: GREEN },
  genderText: { fontFamily: 'Inter-SemiBold', fontSize: 12, color: Colors.textDark },
  genderTextOn: { color: Colors.white },
  scrollChips: { flexDirection: 'row', gap: 8 },
  addBtn: { marginHorizontal: 10, marginBottom: 12, minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 25, borderWidth: 1.5, borderColor: GREEN, backgroundColor: Colors.surface },
  addText: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: GREEN },
  error: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: 'Inter-Regular', fontSize: 11, color: Colors.textLight, lineHeight: 16, marginTop: 2 },
});