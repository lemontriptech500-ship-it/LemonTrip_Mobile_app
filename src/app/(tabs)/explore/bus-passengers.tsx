import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FareSummary, JourneySummary } from '@/components/buses/BusCards';
import { BUS_ROUTES, BusProgress, Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { INSURANCE_PER_SEAT, inr } from '@/data/buses';
import { useAuth } from '@/utils/authStore';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { currentFare, setContact, setOptions, updatePassenger, useBusBooking } from '@/utils/busBookingStore';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

type Errors = { passengers: Record<number, { name?: string; age?: string; gender?: string }>; email?: string; phone?: string };
const GENDERS = [{ id: 'M', label: 'Male' }, { id: 'F', label: 'Female' }, { id: 'O', label: 'Other' }] as const;

export default function BusPassengersScreen() {
  const { selection, passengers, contact, options } = useBusBooking();
  const user = useAuth();
  const saved = usePersonalItems('travellers', isTraveller);
  const [errors, setErrors] = useState<Errors>({ passengers: {} });

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (!contact.email && user?.email) setContact({ email: user.email });
    if (!contact.phone && user?.phone) setContact({ phone: String(user.phone).replace(/^\+?91/, '').replace(/\D/g, '').slice(-10) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.phone]);

  const derived = currentFare();
  if (!selection || !derived || !selection.seats.length || passengers.length !== selection.seats.length) {
    return <FlowScreen><ScrollView><ScreenHeader title="Passengers" eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.details)} /><EmptyState icon="people-outline" title="No seats selected" text="Pick a bus and choose your seats before adding passengers." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, bus } = derived;

  const validate = () => {
    const next: Errors = { passengers: {} };
    passengers.forEach((p, i) => {
      const e: { name?: string; age?: string; gender?: string } = {};
      if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(p.name.trim())) e.name = 'Enter the full name as on your ID.';
      const age = Number(p.age);
      if (!p.age || !Number.isInteger(age) || age < 1 || age > 120) e.age = 'Age 1–120.';
      if (!p.gender) e.gender = 'Select gender.';
      if (Object.keys(e).length) next.passengers[i] = e;
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) next.email = 'Enter a valid email address.';
    if (!/^[6-9]\d{9}$/.test(contact.phone.replace(/\D/g, ''))) next.phone = 'Enter a valid 10-digit mobile number.';
    setErrors(next);
    return !Object.keys(next.passengers).length && !next.email && !next.phone;
  };
  const proceed = () => { if (validate()) goTo(BUS_ROUTES.review); };
  const fillSaved = (index: number, first: string, last: string) => updatePassenger(index, { name: `${first} ${last}`.trim() });

  return (
    <FlowScreen footer={<FooterBar caption={`Total · ${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} amount={inr(fare.total)} action={<PrimaryButton label="Review booking" icon="arrow-forward" onPress={proceed} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Passenger details" subtitle="One passenger per seat. Names must match a valid government ID." eyebrow="LEMONTRIP / BUS" onBack={() => goBackOr(BUS_ROUTES.details)} />
            <BusProgress current={1} />
            <JourneySummary bus={bus} date={selection.date} seats={selection.seats} />

            {passengers.map((p, i) => {
              const e = errors.passengers[i] ?? {};
              return (
                <Card key={selection.seats[i]}>
                  <SectionTitle eyebrow={`PASSENGER ${i + 1}`} title={p.name.trim() || 'Add traveller'} right={<Pill icon="bed-outline" label={`Seat ${selection.seats[i]}`} tone="brand" />} />
                  {saved.items.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips} style={{ marginBottom: 12 }}>
                      {saved.items.map((t) => <Chip key={t.id} icon="person-outline" label={`${t.firstName} ${t.lastName}`.trim()} onPress={() => fillSaved(i, t.firstName, t.lastName)} />)}
                    </ScrollView>
                  ) : null}
                  <Field label="FULL NAME" icon="person-outline" value={p.name} onChangeText={(v) => updatePassenger(i, { name: v })} placeholder="As on ID proof" autoCapitalize="words" error={e.name} />
                  <View style={s.pair}>
                    <View style={{ flex: 1 }}><Field label="AGE" keyboardType="number-pad" maxLength={3} value={p.age} onChangeText={(v) => updatePassenger(i, { age: v.replace(/\D/g, '') })} placeholder="Years" error={e.age} /></View>
                    <View style={{ flex: 2 }}>
                      <Text style={s.label}>GENDER</Text>
                      <View style={s.chips}>{GENDERS.map((g) => <Chip key={g.id} label={g.label} selected={p.gender === g.id} onPress={() => updatePassenger(i, { gender: g.id })} />)}</View>
                      {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                    </View>
                  </View>
                </Card>
              );
            })}

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your ticket?" />
              <Field label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} />
              <Field label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={10} value={contact.phone} onChangeText={(v) => setContact({ phone: v.replace(/\D/g, '') })} placeholder="10-digit number" error={errors.phone} />
              <Text style={s.hint}>E-ticket and journey alerts are sent here. Country code +91 is assumed.</Text>
            </Card>

            <Card>
              <SectionTitle eyebrow="PREFERENCES" title="Booking options" />
              <ToggleRow title="Travel insurance" text={`Cover for trip delays and baggage loss. ${inr(INSURANCE_PER_SEAT)} per seat.`} value={options.insurance} onChange={(v) => setOptions({ insurance: v })} />
              <View style={s.sep} />
              <ToggleRow title="Journey alerts" text="Get boarding reminders and live-tracking updates by SMS." value={options.delayAlerts} onChange={(v) => setOptions({ delayAlerts: v })} />
            </Card>

            <Card>
              <SectionTitle eyebrow="FARE" title="Price summary" />
              <FareSummary fare={fare} />
            </Card>
            <Notice icon="information-circle-outline">Children above 5 years need their own seat. Carry a valid photo ID while boarding.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlowScreen>
  );
}

function ToggleRow({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggle}>
      <View style={{ flex: 1 }}><Text style={s.toggleTitle}>{title}</Text><Text style={s.toggleText}>{text}</Text></View>
      <Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ true: Colors.secondary, false: Colors.borderStrong }} thumbColor={value ? Colors.accent : Colors.white} />
    </View>
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
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  toggleText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
});
