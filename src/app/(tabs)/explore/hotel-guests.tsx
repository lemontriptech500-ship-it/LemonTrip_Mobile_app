import { useAppLanguage } from '@/utils/intl';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { HotelFareSummary, StaySummary } from '@/components/hotels/HotelBookingCards';
import { HotelHeader, Card, Chip, EmptyState, Field, FlowScreen, FooterBar, HOTEL_ROUTES, HotelProgress, Notice, PrimaryButton, SectionTitle, goBackOr, goTo, replaceTo } from '@/components/hotels/HotelUi';
import { Colors } from '@/constants/colors';
import { ARRIVAL_SLOTS, BED_PREFERENCES, TITLES, inr } from '@/data/hotelBooking';
import { useAuth } from '@/utils/authStore';
import { normalizePhoneInput } from '@/utils/authApi';
import { isTraveller, usePersonalItems } from '@/utils/personalStore';
import { currentFare, setContact, setGuestName, setLeadTitle, setRequests, useHotelBooking } from '@/utils/hotelBookingStore';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, View } from 'react-native';

type Errors = { lead?: string; others: Record<number, string>; email?: string; phone?: string };
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,}$/;

export default function HotelGuestsScreen() {
  useAppLanguage();
  const { selection, guestNames, leadTitle, contact, requests, coupon } = useHotelBooking();
  const user = useAuth();
  const saved = usePersonalItems('travellers', isTraveller);
  const [errors, setErrors] = useState<Errors>({ others: {} });

  // Prefill from the signed-in account once.
  useEffect(() => {
    if (!contact.email && user?.email) setContact({ email: user.email });
    if (!contact.phone && user?.phone) setContact({ phone: String(user.phone) });
    if (!guestNames[0] && user?.name) setGuestName(0, user.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.phone, user?.name]);

  const derived = currentFare();
  if (!selection || !derived) {
    return <FlowScreen><ScrollView><HotelHeader title="Guest details" eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.details)} /><EmptyState icon="people-outline" title="No room selected" text="Pick a hotel and room before adding guest details." action={<PrimaryButton label="Search hotels" onPress={() => replaceTo(HOTEL_ROUTES.results)} />} /></ScrollView></FlowScreen>;
  }
  const { fare, room, nights } = derived;
  const { hotel } = selection;

  const validate = () => {
    const next: Errors = { others: {} };
    if (!NAME_RE.test(guestNames[0].trim())) next.lead = 'Enter the full name as on your ID.';
    guestNames.forEach((n, i) => { if (i > 0 && n.trim() && !NAME_RE.test(n.trim())) next.others[i] = 'Enter a valid name.'; });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) next.email = 'Enter a valid email address.';
    if (!normalizePhoneInput(contact.phone)) next.phone = 'Enter a valid phone number with country code.';
    setErrors(next);
    return !next.lead && !Object.keys(next.others).length && !next.email && !next.phone;
  };
  const proceed = () => { if (validate()) { setContact({ phone: normalizePhoneInput(contact.phone) ?? contact.phone }); goTo(HOTEL_ROUTES.review); } };

  return (
    <FlowScreen footer={<FooterBar caption={`Total · ${nights} night${nights > 1 ? 's' : ''}`} amount={inr(fare.total)} estimateAmount={fare.total} action={<PrimaryButton label="Review booking" icon="arrow-forward" onPress={proceed} />} />}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <HotelHeader title="Guest details" subtitle="The lead guest must show a valid photo ID at check-in." eyebrow="LEMONTRIP / HOTELS" onBack={() => goBackOr(HOTEL_ROUTES.details)} />
            <HotelProgress current={1} />
            <StaySummary hotel={hotel} roomName={room.name} checkIn={selection.checkIn} checkOut={selection.checkOut} nights={nights} guests={selection.guests} rooms={selection.rooms} />

            <Card>
              <SectionTitle eyebrow="LEAD GUEST" title={guestNames[0].trim() || 'Add lead guest'} />
              <Text style={s.label}>TITLE</Text>
              <View style={s.chips}>{TITLES.map((t) => <Chip key={t} label={t} selected={leadTitle === t} onPress={() => setLeadTitle(leadTitle === t ? '' : t)} />)}</View>
              {saved.items.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips} style={{ marginTop: 14 }}>
                  {saved.items.map((t) => <Chip key={t.id} icon="person-outline" label={`${t.firstName} ${t.lastName}`.trim()} onPress={() => setGuestName(0, `${t.firstName} ${t.lastName}`.trim())} />)}
                </ScrollView>
              ) : null}
              <View style={{ marginTop: 14 }}>
                <Field label="FULL NAME" icon="person-outline" value={guestNames[0]} onChangeText={(v) => setGuestName(0, v)} placeholder="As on ID proof" autoCapitalize="words" error={errors.lead} />
              </View>
            </Card>

            {selection.guests > 1 ? (
              <Card>
                <SectionTitle eyebrow="OTHER GUESTS" title={`${selection.guests - 1} more guest${selection.guests > 2 ? 's' : ''}`} />
                {guestNames.slice(1).map((n, k) => (
                  <Field key={k} label={`GUEST ${k + 2} · OPTIONAL`} icon="person-outline" value={n} onChangeText={(v) => setGuestName(k + 1, v)} placeholder="Full name" autoCapitalize="words" error={errors.others[k + 1]} />
                ))}
                <Text style={s.hint}>Names can be added now or shared at the front desk. Every adult needs a photo ID at check-in.</Text>
              </Card>
            ) : null}

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your voucher?" />
              <Field label="EMAIL" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={contact.email} onChangeText={(v) => setContact({ email: v })} placeholder="name@example.com" error={errors.email} />
              <Field label="MOBILE NUMBER" icon="call-outline" keyboardType="phone-pad" maxLength={20} value={contact.phone} onChangeText={(v) => setContact({ phone: v })} placeholder="Include country code, e.g. +91" error={errors.phone} />
              <Text style={s.hint}>The hotel may call this number about your arrival.</Text>
            </Card>

            <Card>
              <SectionTitle eyebrow="PREFERENCES" title="Arrival & requests" />
              <Text style={s.label}>EXPECTED ARRIVAL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips}>
                {ARRIVAL_SLOTS.map((a) => <Chip key={a} label={a} selected={requests.arrival === a} onPress={() => setRequests({ arrival: requests.arrival === a ? '' : a })} />)}
              </ScrollView>
              <Text style={[s.label, { marginTop: 14 }]}>ROOM PREFERENCE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scrollChips}>
                {BED_PREFERENCES.map((b) => <Chip key={b} label={b} selected={requests.bed === b} onPress={() => setRequests({ bed: b })} />)}
              </ScrollView>
              <View style={{ marginTop: 14 }}>
                <Field label="SPECIAL REQUESTS · OPTIONAL" icon="chatbubble-ellipses-outline" multiline maxLength={200} value={requests.note} onChangeText={(v) => setRequests({ note: v })} placeholder="e.g. celebrating an anniversary" />
              </View>
              <ToggleRow title="Early check-in" text="Ask the hotel for a check-in before the standard time." value={requests.earlyCheckIn} onChange={(v) => setRequests({ earlyCheckIn: v })} />
              <View style={s.sep} />
              <ToggleRow title="Late check-out" text="Ask the hotel to extend your check-out time." value={requests.lateCheckOut} onChange={(v) => setRequests({ lateCheckOut: v })} />
            </Card>

            <Card>
              <SectionTitle eyebrow="FARE" title="Price summary" />
              <HotelFareSummary fare={fare} couponCode={coupon?.code} />
            </Card>
            <Notice icon="information-circle-outline">Special requests, early check-in and late check-out are subject to availability and are not guaranteed by the hotel.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlowScreen>
  );
}

function ToggleRow({ title, text, value, onChange }: { title: string; text: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={[s.toggle, { marginTop: 14 }]}>
      <View style={{ flex: 1 }}><Text style={s.toggleTitle}>{title}</Text><Text style={s.toggleText}>{text}</Text></View>
      <Switch accessibilityLabel={title} value={value} onValueChange={onChange} trackColor={{ true: Colors.secondary, false: Colors.borderStrong }} thumbColor={value ? '#103D30' : Colors.white} />
    </View>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scrollChips: { flexDirection: 'row', gap: 8 },
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  hint: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight, lineHeight: 18 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  toggleText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, color: Colors.textLight, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.border, marginTop: 12 },
});