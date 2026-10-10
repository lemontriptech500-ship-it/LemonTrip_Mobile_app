import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PACKAGE_ROUTES, PackageFareSummary, PackageProgress, PackageSummary, TypePill } from '@/components/packages/PackageUi';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { AGE_RANGE, inr, travellerType } from '@/data/packages';
import { useAuth } from '@/utils/authStore';
import { currentPackageFare, setContact, updateTraveller, usePackageBooking } from '@/utils/packageBookingStore';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

type Errors = { travellers: Record<number, { name?: string; age?: string; gender?: string }>; email?: string; phone?: string; passport?: string };
const GENDERS = [{ id: 'M', label: 'Male' }, { id: 'F', label: 'Female' }, { id: 'O', label: 'Other' }] as const;

export default function PackageTravellersScreen() {
  const { pkg, date, counts, travellers, contact } = usePackageBooking();
  const user = useAuth();
  const saved = usePersonalItems('travellers', isTraveller);
  const [errors, setErrors] = useState<Errors>({ travellers: {} });

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (!contact.email && user?.email) setContact({ email: user.email });
    if (!contact.phone && user?.phone) setContact({ phone: String(user.phone).replace(/^\+?91/, '').replace(/\D/g, '').slice(-10) });
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
    if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ''))) next.phone = 'Enter a valid 10-digit mobile number.';
    if (pkg.international && !/^[A-Za-z0-9]{6,9}$/.test(contact.passport.trim())) next.passport = 'Enter the lead traveller’s passport number.';
    setErrors(next);
    return !Object.keys(next.travellers).length && !next.email && !next.phone && !next.passport;
  };
  const proceed = () => { if (validate()) goTo(PACKAGE_ROUTES.review); };
  const fillSaved = (index: number, first: string, last: string) => updateTraveller(index, { name: `${first} ${last}`.trim() });

  return (
    <FlowScreen footer={<FooterBar caption="Total payable" amount={inr(fare.total)} action={<PrimaryButton label="Review booking" icon="arrow-forward" onPress={proceed} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Traveller details" subtitle="Names must match a valid government ID." eyebrow="LEMONTRIP / HOLIDAYS" onBack={() => goBackOr(PACKAGE_ROUTES.plan)} />
            <PackageProgress current={1} />
            <PackageSummary pkg={pkg} date={date} endDate={endDate} counts={counts} />

            {travellers.map((t, i) => {
              const e = errors.travellers[i] ?? {};
              const type = travellerType(i, counts);
              return (
                <Card key={i}>
                  <SectionTitle eyebrow={i === 0 ? 'LEAD TRAVELLER' : `TRAVELLER ${i + 1}`} title={t.name.trim() || 'Add traveller'} right={<TypePill type={type} />} />
                  {saved.items.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips} style={{ marginBottom: 12 }}>
                      {saved.items.map((x) => <Chip key={x.id} icon="person-outline" label={`${x.firstName} ${x.lastName}`.trim()} onPress={() => fillSaved(i, x.firstName, x.lastName)} />)}
                    </ScrollView>
                  ) : null}
                  <Field label="FULL NAME" icon="person-outline" value={t.name} onChangeText={(v) => updateTraveller(i, { name: v })} placeholder="As on ID proof" autoCapitalize="words" error={e.name} />
                  <View style={s.pair}>
                    <View style={{ flex: 1 }}><Field label="AGE" keyboardType="number-pad" maxLength={3} value={t.age} onChangeText={(v) => updateTraveller(i, { age: v.replace(/\D/g, '') })} placeholder="Years" error={e.age} /></View>
                    <View style={{ flex: 2 }}>
                      <Text style={s.label}>GENDER</Text>
                      <View style={s.chips}>{GENDERS.map((g) => <Chip key={g.id} label={g.label} selected={t.gender === g.id} onPress={() => updateTraveller(i, { gender: g.id })} />)}</View>
                      {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                    </View>
                  </View>
                </Card>
              );
            })}

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your voucher?" />
              <Field label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} />
              <Field label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={10} value={contact.phone} onChangeText={(v) => setContact({ phone: v.replace(/\D/g, '') })} placeholder="10-digit number" error={errors.phone} />
              {pkg.international ? <Field label="PASSPORT NUMBER (LEAD TRAVELLER)" icon="document-text-outline" autoCapitalize="characters" autoCorrect={false} maxLength={9} value={contact.passport} onChangeText={(v) => setContact({ passport: v.toUpperCase() })} placeholder="e.g. N1234567" error={errors.passport} /> : null}
              <Text style={s.hint}>Voucher and trip alerts are sent here. Country code +91 is assumed.</Text>
            </Card>

            <Card>
              <SectionTitle eyebrow="OPTIONAL" title="Special requests" />
              <TextInput accessibilityLabel="Special requests" multiline value={contact.requests} onChangeText={(v) => setContact({ requests: v.slice(0, 300) })} placeholder="Dietary needs, celebrations, accessibility…" placeholderTextColor={Colors.textLight} style={s.notes} />
              <Text style={s.hint}>Requests are passed to the operator and cannot be guaranteed.</Text>
            </Card>

            <Card>
              <SectionTitle eyebrow="FARE" title="Price summary" />
              <PackageFareSummary fare={fare} />
            </Card>
            {pkg.international ? <Notice icon="airplane-outline">Passport must be valid for at least 6 months from the travel date. Visa requirements depend on your nationality.</Notice> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scrollChips: { flexDirection: 'row', gap: 8 },
  pair: { flexDirection: 'row', gap: 12 },
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, lineHeight: 18 },
  notes: { minHeight: 84, textAlignVertical: 'top', padding: 12, marginBottom: 8, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textDark },
});
