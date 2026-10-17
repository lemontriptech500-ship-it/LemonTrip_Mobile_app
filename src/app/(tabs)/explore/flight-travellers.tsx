import { useAppLanguage } from '@/utils/intl';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FLIGHT_ROUTES, FlightJourney, FlightProgress, formatPrice, goBackOr, goTo, replaceTo } from '@/components/flights/FlightFlowUi';
import { getFlightBookingDraft, updateFlightBookingDraft, type Gender, type TravellerInfo } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { formatShortDate } from '@/data/trains';
import { useAuth } from '@/utils/authStore';
import { normalizePhoneInput } from '@/utils/authApi';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

const GENDERS: Exclude<Gender, ''>[] = ['Male', 'Female', 'Other'];
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const emptyTraveller = (): TravellerInfo => ({ firstName: '', lastName: '', gender: '', dob: '' });

type TravellerErrors = { firstName?: string; lastName?: string; gender?: string; dob?: string };

function dobError(value: string): string | undefined {
  const v = value.trim();
  if (!v) return undefined; // optional
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Use YYYY-MM-DD.';
  const d = new Date(`${v}T00:00:00`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v) return 'Enter a real date.';
  if (d.getTime() > Date.now()) return 'Date of birth cannot be in the future.';
  return undefined;
}

export default function FlightTravellersScreen() {
  useAppLanguage();
  const selection = getFlightSelection();
  const saved = getFlightBookingDraft();
  const user = useAuth();
  const savedTravellers = usePersonalItems('travellers', isTraveller);
  const count = Math.max(1, selection?.request.travellers ?? 1);

  const [travellers, setTravellers] = useState<TravellerInfo[]>(() => Array.from({ length: count }, (_, i) => saved.travellers[i] ?? emptyTraveller()));
  const [email, setEmail] = useState(saved.contactEmail);
  const [phone, setPhone] = useState(saved.contactPhone);
  const [errors, setErrors] = useState<{ travellers: Record<number, TravellerErrors>; email?: string; phone?: string }>({ travellers: {} });

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (user?.email) setEmail((v) => v || user.email);
    if (user?.phone) setPhone((v) => v || String(user.phone));
  }, [user?.email, user?.phone]);

  if (!selection) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Traveller details" eyebrow="LEMONTRIP / FLIGHTS" onBack={() => goBackOr(FLIGHT_ROUTES.details)} />
          <EmptyState icon="airplane-outline" title="No flight selected" text="Pick a flight and fare before adding travellers." action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />} />
        </ScrollView>
      </FlowScreen>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;

  const update = (index: number, patch: Partial<TravellerInfo>) => setTravellers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  const fillSaved = (index: number, first: string, last: string) => update(index, { firstName: first, lastName: last });

  const validate = () => {
    const next: { travellers: Record<number, TravellerErrors>; email?: string; phone?: string } = { travellers: {} };
    travellers.forEach((t, i) => {
      const e: TravellerErrors = {};
      if (!t.firstName.trim() || !NAME_RE.test(t.firstName.trim())) e.firstName = 'Enter the first name as on your ID.';
      if (!t.lastName.trim() || !NAME_RE.test(t.lastName.trim())) e.lastName = 'Enter the last name as on your ID.';
      if (!t.gender) e.gender = 'Select gender.';
      const dob = dobError(t.dob);
      if (dob) e.dob = dob;
      if (Object.keys(e).length) next.travellers[i] = e;
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!normalizePhoneInput(phone)) next.phone = 'Enter a valid phone number with country code.';
    setErrors(next);
    return !Object.keys(next.travellers).length && !next.email && !next.phone;
  };

  const proceed = () => {
    if (!validate()) return;
    const normalized = normalizePhoneInput(phone) ?? phone.trim();
    setPhone(normalized);
    updateFlightBookingDraft({ travellers, contactEmail: email.trim(), contactPhone: normalized });
    goTo(FLIGHT_ROUTES.seats);
  };

  return (
    <FlowScreen footer={<FooterBar caption={`Fare · ${count} traveller${count > 1 ? 's' : ''}`} amount={formatPrice(fareTotal, currency)} action={<PrimaryButton label="Continue" icon="arrow-forward" onPress={proceed} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Traveller details" subtitle="Names must match a valid government ID." eyebrow="LEMONTRIP / FLIGHTS" onBack={() => goBackOr(FLIGHT_ROUTES.details)} />
            <FlightProgress current={1} />
            <FlightJourney offer={offer} fare={fare} date={formatShortDate(selection.request.departureDate)} />

            {travellers.map((t, i) => {
              const e = errors.travellers[i] ?? {};
              return (
                <Card key={i}>
                  <SectionTitle eyebrow={`TRAVELLER ${i + 1}`} title={`${t.firstName} ${t.lastName}`.trim() || 'Add traveller'} />
                  {savedTravellers.items.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips} style={{ marginBottom: 14 }}>
                      {savedTravellers.items.map((p) => <Chip key={p.id} icon="person-outline" label={`${p.firstName} ${p.lastName}`.trim()} onPress={() => fillSaved(i, p.firstName, p.lastName)} />)}
                    </ScrollView>
                  ) : null}
                  <Field label="FIRST NAME" icon="person-outline" value={t.firstName} onChangeText={(v) => update(i, { firstName: v })} placeholder="As on ID proof" autoCapitalize="words" error={e.firstName} />
                  <Field label="LAST NAME" icon="person-outline" value={t.lastName} onChangeText={(v) => update(i, { lastName: v })} placeholder="As on ID proof" autoCapitalize="words" error={e.lastName} />
                  <Text style={s.label}>GENDER</Text>
                  <View style={s.chips}>{GENDERS.map((g) => <Chip key={g} label={g} selected={t.gender === g} onPress={() => update(i, { gender: g })} />)}</View>
                  {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                  <View style={{ height: 12 }} />
                  <Field label="DATE OF BIRTH (OPTIONAL)" icon="calendar-outline" value={t.dob} onChangeText={(v) => update(i, { dob: v })} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" maxLength={10} error={e.dob} />
                </Card>
              );
            })}

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your ticket?" />
              <Field label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} placeholder="name@example.com" error={errors.email} />
              <Field label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={20} value={phone} onChangeText={setPhone} placeholder="Include country code, e.g. +91" error={errors.phone} />
              <Text style={s.hint}>Your e-ticket and flight updates are sent here.</Text>
            </Card>

            <Notice icon="information-circle-outline">Enter names exactly as on the government ID you will carry while travelling. Name changes after booking may not be allowed.</Notice>
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
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  error: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, lineHeight: 18 },
});
