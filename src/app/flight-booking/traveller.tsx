import { Brand, Colors, Radius } from '@/constants/colors';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import {
  getFlightBookingDraft,
  updateFlightBookingDraft,
  type Gender,
  type TravellerInfo,
} from '@/components/flights/flightBookingStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FONT = {
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extra: 'PlusJakartaSans_800ExtraBold',
} as const;

const SHADOW = {
  shadowColor: '#0F3D2E',
  shadowOpacity: 0.1,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
} as const;

const GENDERS: Exclude<Gender, ''>[] = ['Male', 'Female', 'Other'];

function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Brand.lemon} />
          <Text style={styles.centerText}>No flight selected</Text>
          <TouchableOpacity
            style={styles.lemonButton}
            onPress={() => router.replace('/(tabs)/explore/flights' as never)}
          >
            <Text style={styles.lemonButtonText}>Search flights</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { offer, fareOption } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const priceText = fare
    ? formatPrice(fare.price.total, fare.price.currency)
    : formatPrice(offer.price.amount, offer.price.currency);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.iconButton} onPress={goBack}>
              <Ionicons name="arrow-back" size={22} color={Brand.forest} />
            </TouchableOpacity>
            <Text style={styles.stepText}>STEP 1 OF 4</Text>
          </View>
          <Text style={styles.eyebrowLemon}>FLIGHT BOOKING</Text>
          <Text style={styles.pageTitle}>Traveller details</Text>
        </View>

        {/* Flight summary */}
        <View style={[styles.card, styles.summaryCard]}>
          <View style={styles.summaryIcon}>
            <Ionicons name="airplane-outline" size={22} color={Brand.forest} />
          </View>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle} numberOfLines={1}>
              {offer.airline.name} {offer.flightNumber}
            </Text>
            <Text style={styles.summarySub}>
              {offer.departure.airportCode} {offer.departure.time} → {offer.arrival.airportCode} {offer.arrival.time}
            </Text>
          </View>
          <Text style={styles.summaryPrice}>{priceText}</Text>
        </View>

        {/* Travellers */}
        {travellers.map((t, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.sectionTitle}>Traveller {index + 1}</Text>

            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              value={t.firstName}
              onChangeText={(v) => updateTraveller(index, { firstName: v })}
              placeholder="As on government ID"
              placeholderTextColor={Colors.textLight}
              style={[styles.input, submitted && !t.firstName.trim() && styles.inputError]}
            />

            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              value={t.lastName}
              onChangeText={(v) => updateTraveller(index, { lastName: v })}
              placeholder="As on government ID"
              placeholderTextColor={Colors.textLight}
              style={[styles.input, submitted && !t.lastName.trim() && styles.inputError]}
            />

            <Text style={styles.label}>GENDER</Text>
            <View style={styles.chips}>
              {GENDERS.map((g) => {
                const active = t.gender === g;
                return (
                  <TouchableOpacity
                    key={g}
                    accessibilityRole="button"
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => updateTraveller(index, { gender: g })}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {submitted && !t.gender ? <Text style={styles.errorText}>Please select a gender</Text> : null}

            <Text style={styles.label}>DATE OF BIRTH (OPTIONAL)</Text>
            <TextInput
              value={t.dob}
              onChangeText={(v) => updateTraveller(index, { dob: v })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textLight}
              style={styles.input}
            />
          </View>
        ))}

        {/* Contact */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contact details</Text>
          <Text style={styles.hint}>Your ticket and updates will be sent here.</Text>

          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, submitted && !emailOk && styles.inputError]}
          />
          {submitted && !emailOk ? <Text style={styles.errorText}>Enter a valid email</Text> : null}

          <Text style={styles.label}>MOBILE NUMBER</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            placeholderTextColor={Colors.textLight}
            keyboardType="phone-pad"
            style={[styles.input, submitted && !phoneOk && styles.inputError]}
          />
          {submitted && !phoneOk ? <Text style={styles.errorText}>Enter a valid mobile number</Text> : null}
        </View>

        <TouchableOpacity accessibilityRole="button" style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue to seats</Text>
          <Ionicons name="arrow-forward" size={18} color={Brand.forest} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.forest },
  container: { flex: 1, backgroundColor: Brand.cream },
  content: { paddingBottom: 32, width: '100%', maxWidth: 900, alignSelf: 'center' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 28 },
  centerText: { color: Colors.white, fontFamily: FONT.extra, fontSize: 20, textAlign: 'center' },
  lemonButton: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.pill, backgroundColor: Brand.lemon },
  lemonButtonText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 14 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 56,
    backgroundColor: Brand.forest,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: Brand.lemon,
  },
  stepText: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.4 },
  eyebrowLemon: { color: Brand.lemon, fontFamily: FONT.extra, fontSize: 10, letterSpacing: 1.6 },
  pageTitle: { color: Colors.white, fontFamily: FONT.extra, fontSize: 28, marginTop: 4 },

  card: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 18,
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    ...SHADOW,
  },
  summaryCard: { marginTop: -36, flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    backgroundColor: Brand.cream,
  },
  summaryInfo: { flex: 1, minWidth: 0 },
  summaryTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15 },
  summarySub: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, marginTop: 3 },
  summaryPrice: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 16 },

  sectionTitle: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 16, marginBottom: 4 },
  hint: { color: Colors.textLight, fontFamily: FONT.medium, fontSize: 12, marginBottom: 4 },
  label: { color: Colors.textLight, fontFamily: FONT.extra, fontSize: 9, letterSpacing: 1.2, marginTop: 14, marginBottom: 6 },
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#D5D4CB',
    backgroundColor: Brand.cream,
    color: Colors.textDark,
    fontFamily: FONT.medium,
    fontSize: 14,
  },
  inputError: { borderColor: '#C0392B' },
  errorText: { color: '#C0392B', fontFamily: FONT.medium, fontSize: 12, marginTop: 6 },

  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: '#D5D4CB',
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Brand.forest, borderColor: Brand.forest },
  chipText: { color: Colors.textDark, fontFamily: FONT.bold, fontSize: 13 },
  chipTextActive: { color: Brand.lemon },

  continueButton: {
    minHeight: 52,
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: Radius.pill,
    backgroundColor: Brand.lemon,
  },
  continueText: { color: Brand.forest, fontFamily: FONT.extra, fontSize: 15 },
});