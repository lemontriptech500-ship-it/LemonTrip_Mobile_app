import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { BRAND, FLIGHT_ROUTES, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightSummaryCard, INTER, formatPrice, goBackOr, goTo, replaceTo } from '@/components/flights/FlightFlowUi';
import { getFlightBookingDraft, updateFlightBookingDraft, type Gender, type TravellerInfo } from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { EmptyState, PrimaryButton } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { formatShortDate } from '@/data/trains';
import { useAuth } from '@/utils/authStore';
import { normalizePhoneInput } from '@/utils/authApi';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { Ionicons } from '@expo/vector-icons';
import { createElement, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';

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
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ travellers: Record<number, TravellerErrors>; email?: string; phone?: string }>({ travellers: {} });

  // Prefill contact once from the signed-in account.
  useEffect(() => {
    if (user?.email) setEmail((v) => v || user.email || '');
    if (user?.phone) setPhone((v) => v || String(user.phone));
  }, [user?.email, user?.phone]);

  if (!selection) {
    return (
      <FlightShell onBack={() => goBackOr(FLIGHT_ROUTES.details)}>
        <ScrollView>
          <FlightBanner title="Traveller details" text="Names must match a valid government ID." />
          <EmptyState icon="airplane-outline" title="No flight selected" text="Pick a flight and fare before adding travellers." action={<PrimaryButton label="Search flights" onPress={() => replaceTo(FLIGHT_ROUTES.results)} />} />
        </ScrollView>
      </FlightShell>
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

  const footer = (
    <View style={s.footer}>
      <View style={s.footerPrice}>
        <Text style={s.footerCaption} numberOfLines={1}>{`Fare · ${count} traveller${count > 1 ? 's' : ''}`}</Text>
        <Text style={s.footerAmount} numberOfLines={1}>{formatPrice(fareTotal, currency)}</Text>
      </View>
      <TouchableOpacity accessibilityRole="button" onPress={proceed} activeOpacity={0.85} style={s.continue}>
        <Text style={s.continueText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color={BRAND} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlightShell onBack={() => goBackOr(FLIGHT_ROUTES.details)} footer={footer}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <FlightBanner title="Traveller details" text="Names must match a valid government ID." />
            <FlightSteps current={1} />
            <FlightSummaryCard offer={offer} fare={fare} date={formatShortDate(selection.request.departureDate)} />

            {travellers.map((t, i) => {
              const e = errors.travellers[i] ?? {};
              const saved1 = savedTravellers.items[0];
              return (
                <View key={i} style={s.card}>
                  <FlightHeading
                    eyebrow={`TRAVELLER ${i + 1}`}
                    title={`${t.firstName} ${t.lastName}`.trim() || 'Add traveller'}
                    right={saved1 ? (
                      <TouchableOpacity accessibilityRole="button" onPress={() => setPickerFor(pickerFor === i ? null : i)} style={s.saved} activeOpacity={0.85}>
                        <Ionicons name="person-outline" size={15} color={BRAND} />
                        <Text style={s.savedText}>Use saved traveller</Text>
                      </TouchableOpacity>
                    ) : null}
                  />
                  {pickerFor === i ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.savedRow} style={{ marginBottom: 14 }}>
                      {savedTravellers.items.map((p) => (
                        <TouchableOpacity key={p.id} accessibilityRole="button" onPress={() => { fillSaved(i, p.firstName, p.lastName); setPickerFor(null); }} style={s.savedChip} activeOpacity={0.85}>
                          <Text style={s.savedText}>{`${p.firstName} ${p.lastName}`.trim()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : null}
                  <View style={s.pair}>
                    <View style={s.half}><Input label="FIRST NAME" icon="person-outline" value={t.firstName} onChangeText={(v) => update(i, { firstName: v })} placeholder="As on ID" autoCapitalize="words" error={e.firstName} /></View>
                    <View style={s.half}><Input label="LAST NAME" icon="person-outline" value={t.lastName} onChangeText={(v) => update(i, { lastName: v })} placeholder="As on ID" autoCapitalize="words" error={e.lastName} /></View>
                  </View>
                  <View style={[s.pair, { marginTop: 14 }]}>
                    <View style={s.half}>
                      <Text style={s.label}>GENDER</Text>
                      <View style={s.chips}>{GENDERS.map((g) => (
                        <TouchableOpacity key={g} accessibilityRole="button" accessibilityState={{ selected: t.gender === g }} onPress={() => update(i, { gender: g })} style={[s.chip, t.gender === g && s.chipOn]} activeOpacity={0.85}>
                          <Text style={[s.chipText, t.gender === g && s.chipTextOn]}>{g}</Text>
                        </TouchableOpacity>
                      ))}</View>
                      {e.gender ? <Text style={s.error}>{e.gender}</Text> : null}
                    </View>
                    <View style={s.half}><DobField label="DATE OF BIRTH (OPTIONAL)" value={t.dob} onChange={(v) => update(i, { dob: v })} error={e.dob} /></View>
                  </View>
                </View>
              );
            })}

            <View style={s.card}>
              <FlightHeading eyebrow="CONTACT" title="Where should we send your ticket?" />
              <Input label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} placeholder="name@example.com" error={errors.email} />
              <View style={{ height: 14 }} />
              <Input label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={20} value={phone} onChangeText={setPhone} placeholder="Include country code, e.g. +91" error={errors.phone} />
              <Text style={s.hint}>Your e-ticket and flight updates are sent here.</Text>
            </View>

            <View style={s.notice}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.textLight} />
              <Text style={s.noticeText}>Enter names exactly as on the government ID you will carry while travelling. Name changes after booking may not be allowed.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlightShell>
  );
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Input({ label, icon, error, ...input }: TextInputProps & { label: string; icon: IconName; error?: string }) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, !!error && s.inputError]}>
        <Ionicons name={icon} size={20} color={Colors.textLight} />
        <TextInput {...input} placeholderTextColor={Colors.textLight} style={s.inputText} />
      </View>
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromDateString = (v: string) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null; };

function DobField({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [open, setOpen] = useState(false);
  const shown = fromDateString(value) ?? new Date(1995, 0, 1);
  const errorText = error ? <Text style={s.error}>{error}</Text> : null;

  if (Platform.OS === 'web') {
    return (
      <View>
        <Text style={s.label}>{label}</Text>
        {createElement('input', { type: 'date', value, max: toDateString(new Date()), 'aria-label': label, onChange: (e: { target: { value: string } }) => onChange(e.target.value), style: webInput })}
        {errorText}
      </View>
    );
  }

  const Picker = require('@react-native-community/datetimepicker').default;
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={() => setOpen(true)} style={[s.input, !!error && s.inputError]} activeOpacity={0.85}>
        <Ionicons name="calendar-outline" size={20} color={Colors.textLight} />
        <Text style={[s.inputText, s.dobText, !value && { color: Colors.textLight }]} numberOfLines={1}>{value || 'Select date'}</Text>
      </TouchableOpacity>
      {open ? <Picker value={shown} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} maximumDate={new Date()} onChange={(event: { type: string }, date?: Date) => { if (Platform.OS === 'android') setOpen(false); if (event.type === 'set' && date) onChange(toDateString(date)); }} /> : null}
      {open && Platform.OS === 'ios' ? (
        <TouchableOpacity accessibilityRole="button" style={s.done} onPress={() => { if (!value) onChange(toDateString(shown)); setOpen(false); }}><Text style={s.doneText}>Done</Text></TouchableOpacity>
      ) : null}
      {errorText}
    </View>
  );
}

const webInput = { minHeight: 54, width: '100%', boxSizing: 'border-box', border: 'none', borderRadius: 18, padding: '0 14px', fontSize: 14, fontFamily: 'Inter-Regular, inherit', backgroundColor: Colors.surfaceMuted, color: Colors.textDark } as const;

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  card: { ...Ui.card, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  pair: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  half: { flex: 1, minWidth: 0 },
  label: { fontFamily: INTER.semibold, fontSize: TextSize.caption, letterSpacing: 0.6, color: Colors.secondary, marginBottom: 8 },
  input: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorSoft },
  inputText: { flex: 1, minWidth: 0, minHeight: 52, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  dobText: { textAlignVertical: 'center', lineHeight: 52 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 11, borderRadius: 22, borderWidth: 1, borderColor: Colors.borderStrong, backgroundColor: Colors.surface },
  chipOn: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontFamily: INTER.bold, fontSize: TextSize.caption, color: BRAND },
  chipTextOn: { color: Colors.white },
  error: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight, lineHeight: 18, marginTop: 10 },
  saved: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  savedText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: BRAND },
  savedRow: { flexDirection: 'row', gap: 8 },
  savedChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  done: { minHeight: 44, alignSelf: 'flex-end', justifyContent: 'center', paddingHorizontal: 8 },
  doneText: { fontFamily: INTER.extrabold, fontSize: TextSize.body, color: Colors.secondary },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  noticeText: { flex: 1, fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footerPrice: { flex: 1, minWidth: 0 },
  footerCaption: { fontFamily: INTER.medium, color: BRAND, fontSize: TextSize.caption },
  footerAmount: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.heading, marginTop: 1 },
  continue: { minWidth: 168, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 22, borderRadius: 27, backgroundColor: Colors.accent },
  continueText: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.bodyLarge },
});