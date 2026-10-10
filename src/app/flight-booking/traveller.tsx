import { ScreenHeader } from '@/components/ScreenHeader';
import { FlightJourney, FlightProgress, formatPrice } from '@/components/flights/FlightFlowUi';
import {
  getFlightBookingDraft,
  updateFlightBookingDraft,
  type Gender,
  type TravellerInfo,
} from '@/components/flights/flightBookingStore';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, PrimaryButton, SectionTitle } from '@/components/trains/TrainUi';
import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

const GENDERS: Exclude<Gender, ''>[] = ['Male', 'Female', 'Other'];
const emptyTraveller = (): TravellerInfo => ({ firstName: '', lastName: '', gender: '', dob: '' });

export default function TravellerDetailsScreen() {
  const selection = getFlightSelection();
  const saved = getFlightBookingDraft();
  const count = Math.max(1, selection?.request.travellers ?? 1);

  const [travellers, setTravellers] = useState<TravellerInfo[]>(() =>
    Array.from({ length: count }, (_, i) => saved.travellers[i] ?? emptyTraveller()),
  );
  const [email, setEmail] = useState(saved.contactEmail);
  const [phone, setPhone] = useState(saved.contactPhone);
  const [submitted, setSubmitted] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore/flights' as never);
  };

  if (!selection) {
    return (
      <FlowScreen>
        <ScrollView>
          <ScreenHeader title="Traveller details" eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
          <EmptyState
            icon="airplane-outline"
            title="No flight selected"
            text="Pick a flight and fare before adding travellers."
            action={<PrimaryButton label="Search flights" onPress={() => router.replace('/(tabs)/explore/flights' as never)} />}
          />
        </ScrollView>
      </FlowScreen>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;

  const updateTraveller = (index: number, patch: Partial<TravellerInfo>) => {
    setTravellers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneOk = phone.replace(/\D/g, '').length >= 10;
  const travellersOk = travellers.every((t) => t.firstName.trim() && t.lastName.trim() && t.gender);
  const valid = emailOk && phoneOk && travellersOk;

  const handleContinue = () => {
    setSubmitted(true);
    if (!valid) return;
    updateFlightBookingDraft({
      travellers,
      contactEmail: email.trim(),
      contactPhone: phone.trim(),
    });
    router.push('/flight-booking/seats' as never);
  };

  return (
    <FlowScreen
      footer={
        <FooterBar
          caption={`Fare · ${count} traveller${count > 1 ? 's' : ''}`}
          amount={formatPrice(fareTotal, currency)}
          action={<PrimaryButton label="Continue" icon="arrow-forward" onPress={handleContinue} />}
        />
      }
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
          <View style={s.content}>
            <ScreenHeader title="Traveller details" subtitle="Names must match a valid government ID." eyebrow="LEMONTRIP / FLIGHTS" onBack={goBack} />
            <FlightProgress current={1} />
            <FlightJourney offer={offer} fare={fare} />

            {travellers.map((t, i) => (
              <Card key={i}>
                <SectionTitle eyebrow={`TRAVELLER ${i + 1}`} title={`${t.firstName} ${t.lastName}`.trim() || 'Add traveller'} />
                <Field
                  label="FIRST NAME"
                  icon="person-outline"
                  value={t.firstName}
                  onChangeText={(v) => updateTraveller(i, { firstName: v })}
                  placeholder="As on ID proof"
                  autoCapitalize="words"
                  error={submitted && !t.firstName.trim() ? 'Enter the first name.' : undefined}
                />
                <Field
                  label="LAST NAME"
                  icon="person-outline"
                  value={t.lastName}
                  onChangeText={(v) => updateTraveller(i, { lastName: v })}
                  placeholder="As on ID proof"
                  autoCapitalize="words"
                  error={submitted && !t.lastName.trim() ? 'Enter the last name.' : undefined}
                />
                <Text style={s.label}>GENDER</Text>
                <View style={s.chips}>
                  {GENDERS.map((g) => (
                    <Chip key={g} label={g} selected={t.gender === g} onPress={() => updateTraveller(i, { gender: g })} />
                  ))}
                </View>
                {submitted && !t.gender ? <Text style={s.error}>Select gender.</Text> : null}
                <View style={{ height: 12 }} />
                <Field
                  label="DATE OF BIRTH (OPTIONAL)"
                  icon="calendar-outline"
                  value={t.dob}
                  onChangeText={(v) => updateTraveller(i, { dob: v })}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numbers-and-punctuation"
                />
              </Card>
            ))}

            <Card>
              <SectionTitle eyebrow="CONTACT" title="Where should we send your ticket?" />
              <Field
                label="EMAIL"
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                error={submitted && !emailOk ? 'Enter a valid email address.' : undefined}
              />
              <Field
                label="MOBILE NUMBER"
                icon="call-outline"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit number"
                error={submitted && !phoneOk ? 'Enter a valid mobile number.' : undefined}
              />
              <Text style={s.hint}>Your e-ticket and flight updates are sent here.</Text>
            </Card>

            <Notice icon="information-circle-outline">Enter names exactly as on the government ID you will carry while travelling.</Notice>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </FlowScreen>
  );
}

const s = StyleSheet.create({
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  label: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.9, color: Colors.textLight, marginBottom: 6 },
  error: { fontFamily: 'Manrope', fontSize: 12, color: Colors.error, marginTop: 4 },
  hint: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight, lineHeight: 18 },
});
