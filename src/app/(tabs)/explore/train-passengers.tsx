import { ScreenHeader } from '@/components/ScreenHeader';
import { FareSummary, JourneySummary } from '@/components/trains/TrainCards';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle, TRAIN_ROUTES, TrainProgress, goBackOr, goTo, replaceTo } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { CLASS_INFO, berthOptions, inr } from '@/data/trains';
import { useAuth } from '@/utils/authStore';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { MAX_PASSENGERS, addPassenger, currentFare, removePassenger, setContact, setOptions, updatePassenger, useTrainBooking } from '@/utils/trainBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

type Errors = { passengers: Record<number, { name?: string; age?: string; gender?: string }>; email?: string; phone?: string };
const GENDERS = [{ id: 'M', label: 'Male' }, { id: 'F', label: 'Female' }, { id: 'O', label: 'Other' }] as const;

export default function TrainPassengersScreen() {
  const { selection, passengers, contact, options } = useTrainBooking();
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
  if (!selection || !derived) {
    return <FlowScreen><ScrollView><ScreenHeader title="Passengers" eyebrow="LEMONTRIP / RAIL" onBack={() => goBackOr(TRAIN_ROUTES.results)} /><EmptyState icon="people-outline" title="No train selected" text="Pick a train and class before adding passengers." action={<PrimaryButton label="Search trains" onPress={() => replaceTo(TRAIN_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, result } = derived;
  const berths = berthOptions(selection.classCode);

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
  const proceed = () => { if (validate()) goTo(TRAIN_ROUTES.review); };
  const fillSaved = (index: number, first: string, last: string) => updatePassenger(index, { name: `${first} ${last}`.trim() });

  return (
    <FlowScreen footer={<FooterBar caption={`Total · ${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} amount={inr(fare.total)} action={<PrimaryButton label="Review booking" icon="arrow-forward" onPress={proceed} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Passenger details" subtitle="Names must match a valid government ID." eyebrow="LEMONTRIP / RAIL" onBack={() => goBackOr(TRAIN_ROUTES.details)} />
            <TrainProgress current={1} />
            <JourneySummary result={result} date={selection.date} className={CLASS_INFO[selection.classCode].name} quota={selection.quota} />

            {passengers.map((p, i) => {
              const e = errors.passengers[i] ?? {};
              return (
                <Card key={i}>
                  <SectionTitle eyebrow={`PASSENGER ${i + 1}`} title={p.name.trim() || 'Add traveller'} right={passengers.length > 1 ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove passenger ${i + 1}`} onPress={() => removePassenger(i)} hitSlop={8} style={s.remove}><Ionicons name="trash-outline" size={17} color={Colors.error} /></TouchableOpacity> : undefined} />
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
                  <Text style={[s.label, { marginTop: 14 }]}>BERTH / SEAT PREFERENCE</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips}>
                    {berths.map((b) => <Chip key={b} label={b} selected={p.berth === b} onPress={() => updatePassenger(i, { berth: b })} />)}
                  </ScrollView>
                </Card>
              );
            })}

            <View style={s.addWrap}>
              <PrimaryButton variant="soft" icon="person-add-outline" label={passengers.length >= MAX_PASSENGERS ? `Maximum ${MAX_PASSENGERS} passengers` : 'Add another passenger'} disabled={passengers.length >= MAX_PASSENGERS} onPress={addPassenger} />
            </View>

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your ticket?" />
              <Field label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} />
              <Field label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={10} value={contact.phone} onChangeText={(v) => setContact({ phone: v.replace(/\D/g, '') })} placeholder="10-digit number" error={errors.phone} />
              <Text style={s.hint}>E-ticket and journey alerts are sent here. Country code +91 is assumed.</Text>
            </Card>

            <Card>
              <SectionTitle eyebrow="PREFERENCES" title="Booking options" />
              <ToggleRow title="Auto-upgrade" text="Move to a higher class for free if seats are available." value={options.autoUpgrade} onChange={(v) => setOptions({ autoUpgrade: v })} />
              <View style={s.sep} />
              <ToggleRow title="Book only if confirmed" text="Skip the booking if a confirmed berth is not available for everyone." value={options.confirmedOnly} onChange={(v) => setOptions({ confirmedOnly: v })} />
            </Card>

            <Card>
              <SectionTitle eyebrow="FARE" title="Price summary" />
              <FareSummary fare={fare} />
            </Card>
            <Notice icon="information-circle-outline">Children under 5 travel free without a berth. Add them as a passenger if you need a berth of their own.</Notice>
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
  label: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  error: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginTop: 4 },
  remove: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.errorSoft },
  addWrap: { marginHorizontal: 20, marginBottom: 14 },
  hint: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, lineHeight: 18 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark },
  toggleText: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
});
