import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { FareSummary, JourneySummary } from '@/components/buses/BusCards';
import { BRAND, BUS_ROUTES, BusBanner, BusCardBox, BusFooter, BusHeading, BusInput, BusNotice, BusShell, BusSteps, BusTag, EmptyState, INTER, PrimaryButton, goBackOr, goTo, replaceTo } from '@/components/buses/BusUi';
import { Colors } from '@/constants/colors';
import { INSURANCE_PER_SEAT, inr } from '@/data/buses';
import { useAuth } from '@/utils/authStore';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { currentFare, setContact, setOptions, updatePassenger, useBusBooking } from '@/utils/busBookingStore';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

type Errors = { passengers: Record<number, { name?: string; age?: string; gender?: string }>; email?: string; phone?: string };
const GENDERS = [{ id: 'M', label: 'Male' }, { id: 'F', label: 'Female' }, { id: 'O', label: 'Other' }] as const;

export default function BusPassengersScreen() {
  useAppLanguage();
  const { selection, passengers, contact, options } = useBusBooking();
  const user = useAuth();
  const saved = usePersonalItems('travellers', isTraveller);
  const [errors, setErrors] = useState<Errors>({ passengers: {} });
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (!contact.email && user?.email) setContact({ email: user.email });
    if (!contact.phone && user?.phone) setContact({ phone: String(user.phone).replace(/^\+?91/, '').replace(/\D/g, '').slice(-10) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.phone]);

  const derived = currentFare();
  if (!selection || !derived || !selection.seats.length || passengers.length !== selection.seats.length) {
    return (
      <BusShell onBack={() => goBackOr(BUS_ROUTES.details)}>
        <ScrollView>
          <BusBanner title="Passenger details" text="One passenger per seat." />
          <EmptyState icon="people-outline" title="No seats selected" text="Pick a bus and choose your seats before adding passengers." action={<PrimaryButton label="Search buses" onPress={() => replaceTo(BUS_ROUTES.results)} />} />
        </ScrollView>
      </BusShell>
    );
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
    <BusShell onBack={() => goBackOr(BUS_ROUTES.details)} footer={<BusFooter caption={`Total · ${passengers.length} passenger${passengers.length > 1 ? 's' : ''}`} amount={inr(fare.total)} label="Review booking" icon="arrow-forward" onPress={proceed} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <BusBanner title="Passenger details" text="One passenger per seat. Names must match a valid government ID." />
            <BusSteps current={1} />
            <JourneySummary bus={bus} date={selection.date} seats={selection.seats} />

            {passengers.map((p, i) => {
              const e = errors.passengers[i] ?? {};
              return (
                <BusCardBox key={selection.seats[i]}>
                  <BusHeading
                    eyebrow={`PASSENGER ${i + 1}`}
                    title={p.name.trim() || 'Add traveller'}
                    right={saved.items.length ? (
                      <TouchableOpacity accessibilityRole="button" onPress={() => setPickerFor(pickerFor === i ? null : i)} style={s.saved} activeOpacity={0.85}>
                        <Ionicons name="person-outline" size={15} color={BRAND} />
                        <Text style={s.savedText}>Use saved</Text>
                      </TouchableOpacity>
                    ) : <BusTag icon="bed-outline" label={`Seat ${selection.seats[i]}`} />}
                  />
                  {pickerFor === i ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.savedRow} style={{ marginBottom: 14 }}>
                      {saved.items.map((t) => (
                        <TouchableOpacity key={t.id} accessibilityRole="button" onPress={() => { fillSaved(i, t.firstName, t.lastName); setPickerFor(null); }} style={s.savedChip} activeOpacity={0.85}>
                          <Text style={s.savedText}>{`${t.firstName} ${t.lastName}`.trim()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : null}
                  <BusInput label="FULL NAME" icon="person-outline" value={p.name} onChangeText={(v) => updatePassenger(i, { name: v })} placeholder="As on ID proof" autoCapitalize="words" error={e.name} />
                  <View style={s.pair}>
                    <View style={{ flex: 1 }}><BusInput label="AGE" icon="calendar-outline" keyboardType="number-pad" maxLength={3} value={p.age} onChangeText={(v) => updatePassenger(i, { age: v.replace(/\D/g, '') })} placeholder="Years" error={e.age} /></View>
                    <View style={{ flex: 1.4 }}>
                      <Text style={s.label}>GENDER</Text>
                      <View style={s.chips}>{GENDERS.map((g) => (
                        <TouchableOpacity key={g.id} accessibilityRole="button" accessibilityState={{ selected: p.gender === g.id }} onPress={() => updatePassenger(i, { gender: g.id })} style={[s.chip, p.gender === g.id && s.chipOn]} activeOpacity={0.85}>
                          <Text style={[s.chipText, p.gender === g.id && s.chipTextOn]}>{g.label}</Text>
                        </TouchableOpacity>
                      ))}</View>
                      {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                    </View>
                  </View>
                </BusCardBox>
              );
            })}

            <BusCardBox>
              <BusHeading eyebrow="CONTACT" title="Where should we send your ticket?" />
              <BusInput label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} />
              <BusInput label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={10} value={contact.phone} onChangeText={(v) => setContact({ phone: v.replace(/\D/g, '') })} placeholder="10-digit number" error={errors.phone} />
              <Text style={s.hint}>E-ticket and journey alerts are sent here. Country code +91 is assumed.</Text>
            </BusCardBox>

            <BusCardBox>
              <BusHeading eyebrow="PREFERENCES" title="Booking options" />
              <ToggleRow title="Travel insurance" text={`Cover for trip delays and baggage loss. ${inr(INSURANCE_PER_SEAT)} per seat.`} value={options.insurance} onChange={(v) => setOptions({ insurance: v })} />
              <View style={s.sep} />
              <ToggleRow title="Journey alerts" text="Get boarding reminders and live-tracking updates by SMS." value={options.delayAlerts} onChange={(v) => setOptions({ delayAlerts: v })} />
            </BusCardBox>

            <BusCardBox>
              <BusHeading eyebrow="FARE" title="Price summary" />
              <FareSummary fare={fare} />
            </BusCardBox>
            <BusNotice>Children above 5 years need their own seat. Carry a valid photo ID while boarding.</BusNotice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BusShell>
  );
}

function ToggleRow({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggle}>
      <View style={{ flex: 1 }}><Text style={s.toggleTitle}>{title}</Text><Text style={s.toggleText}>{text}</Text></View>
      <Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ true: Colors.secondary, false: Colors.borderStrong }} thumbColor={value ? '#103D30' : Colors.white} />
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, borderRadius: 22, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  chipTextOn: { color: Colors.white },
  pair: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  label: { fontFamily: INTER.semibold, fontSize: TextSize.caption, letterSpacing: 0.6, color: Colors.secondary, marginBottom: 8 },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, lineHeight: 18 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  savedText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND },
  savedRow: { flexDirection: 'row', gap: 8 },
  savedChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { fontFamily: INTER.bold, fontSize: TextSize.body, color: BRAND },
  toggleText: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
});