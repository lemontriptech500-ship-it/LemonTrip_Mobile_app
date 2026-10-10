import { TextSize, FontWeight } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';

import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#075638";
const DARK = "#153C2D";
const BG = "#F4F8F4";
const BORDER = "#DCE8DF";
const YELLOW = "#FFD83D";

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [payment, setPayment] = useState("UPI");
  const [agree, setAgree] = useState(false);

  const from = String(params.from || "Delhi");
  const to = String(params.to || "Jaipur");
  const operator = String(params.operator || "GreenLine Travels");
  const date = String(params.date || "09 Oct 2026");
  const seats = String(params.seats || "L1");
  const price = Number(params.price || 899);
  const passengerCount = Number(params.passengers || 1);

  const handleContinue = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the passenger's full name.");
      return;
    }

    if (!age.trim() || Number(age) < 1 || Number(age) > 120) {
      Alert.alert("Invalid age", "Please enter a valid passenger age.");
      return;
    }

    if (!phone.trim() || !/^[0-9]{10}$/.test(phone)) {
      Alert.alert("Invalid mobile number", "Enter a 10-digit mobile number.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid email", "Please check your email address.");
      return;
    }

    if (!agree) {
      Alert.alert("Confirmation required", "Please accept the booking terms.");
      return;
    }

    router.push({
      pathname: "/(tabs)/explore/payment" as any,
      params: {
        name,
        age,
        gender,
        phone,
        email,
        payment,
        from,
        to,
        operator,
        date,
        seats,
        price: String(price),
        passengers: String(passengerCount),
      },
    });
  };

  const Field = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric" | "phone-pad" | "email-address";
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA69D"
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.brand}>
            <Text style={styles.logo}>🍋</Text>
            <View>
              <Text style={styles.brandName}>LemonTrip</Text>
              <Text style={styles.brandSub}>YOUR JOURNEY, SIMPLIFIED</Text>
            </View>
          </View>
          <View style={{ width: 30 }} />
        </View>

        <Text style={styles.eyebrow}>BUS BOOKING · STEP 3</Text>
        <Text style={styles.title}>Passenger details</Text>
        <Text style={styles.subtitle}>
          Enter the passenger information for your trip.
        </Text>

        <View style={styles.steps}>
          <View style={styles.stepDone}>
            <Text style={styles.stepDoneText}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepDone}>
            <Text style={styles.stepDoneText}>✓</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepCurrent}>
            <Text style={styles.stepCurrentText}>3</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepPending}>
            <Text style={styles.stepPendingText}>4</Text>
          </View>
        </View>

        <View style={styles.tripCard}>
          <View style={styles.tripTop}>
            <Text style={styles.tripLabel}>YOUR TRIP</Text>
            <Text style={styles.confirmBadge}>Bus selected</Text>
          </View>
          <Text style={styles.operator}>{operator}</Text>
          <View style={styles.route}>
            <View>
              <Text style={styles.city}>{from}</Text>
              <Text style={styles.routeCaption}>Departure</Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.city}>{to}</Text>
              <Text style={styles.routeCaption}>Destination</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.tripBottom}>
            <View>
              <Text style={styles.smallLabel}>TRAVEL DATE</Text>
              <Text style={styles.smallValue}>{date}</Text>
            </View>
            <View>
              <Text style={styles.smallLabel}>SEATS</Text>
              <Text style={styles.smallValue}>{seats}</Text>
            </View>
            <View>
              <Text style={styles.smallLabel}>TOTAL</Text>
              <Text style={styles.price}>₹{price.toLocaleString("en-IN")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>♙</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>Lead passenger</Text>
              <Text style={styles.cardSub}>Passenger 1 of {passengerCount}</Text>
            </View>
          </View>

          <Field
            label="FULL NAME *"
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
          />

          <View style={styles.twoColumns}>
            <View style={{ flex: 1 }}>
              <Field
                label="AGE *"
                value={age}
                onChangeText={setAge}
                placeholder="Enter age"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>GENDER *</Text>
              <View style={styles.genderRow}>
                {["Male", "Female", "Other"].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setGender(item)}
                    style={[
                      styles.genderButton,
                      gender === item && styles.optionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === item && styles.optionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Field
            label="MOBILE NUMBER *"
            value={phone}
            onChangeText={setPhone}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
          />

          <Field
            label="EMAIL ADDRESS"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />

          <Text style={styles.helper}>
            Your contact details may be used for booking updates.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment preference</Text>
          <Text style={styles.cardSub}>
            Choose how you would like to pay.
          </Text>

          {[
            { id: "UPI", title: "UPI", description: "Pay using a UPI app", icon: "◈" },
            { id: "Card", title: "Credit / Debit Card", description: "Visa, Mastercard and more", icon: "▤" },
            { id: "Net Banking", title: "Net Banking", description: "Pay through your bank", icon: "⌂" },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setPayment(item.id)}
              style={[
                styles.paymentOption,
                payment === item.id && styles.paymentActive,
              ]}
            >
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>{item.title}</Text>
                <Text style={styles.paymentSub}>{item.description}</Text>
              </View>
              <View style={styles.radioOuter}>
                {payment === item.id && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.termsRow}
          onPress={() => setAgree(!agree)}
        >
          <View style={[styles.checkbox, agree && styles.checkboxActive]}>
            {agree && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I confirm that the passenger details are correct and agree to the
            booking terms and cancellation policy.
          </Text>
        </Pressable>

        <View style={styles.bottomCard}>
          <View>
            <Text style={styles.bottomLabel}>TOTAL PAYABLE</Text>
            <Text style={styles.bottomPrice}>
              ₹{price.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.bottomSub}>For {passengerCount} passenger(s)</Text>
          </View>

          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          🔒 Your details should be handled securely.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 35,
  },
  header: {
    backgroundColor: GREEN,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  back: { width: 30, justifyContent: "center" },
  backText: { color: "#FFFFFF", fontSize: TextSize.hero },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { fontSize: TextSize.displaySmall },
  brandName: { color: "#FFFFFF", fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  brandSub: { color: "#D6E8DC", fontSize: TextSize.micro, marginTop: 3 },
  eyebrow: { color: GREEN, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  title: { color: DARK, fontSize: TextSize.display, fontWeight: FontWeight.extraBold, marginTop: 5 },
  subtitle: { color: "#758178", fontSize: TextSize.micro, marginTop: 6, lineHeight: 17 },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 21,
  },
  stepDone: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDoneText: { color: "#FFFFFF", fontWeight: FontWeight.extraBold },
  stepCurrent: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCurrentText: { color: DARK, fontWeight: FontWeight.extraBold },
  stepPending: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E9E3",
    alignItems: "center",
    justifyContent: "center",
  },
  stepPendingText: { color: "#758178", fontWeight: FontWeight.extraBold },
  stepLine: { height: 2, width: 35, backgroundColor: "#B8D1BF" },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 17,
  },
  tripTop: { flexDirection: "row", justifyContent: "space-between" },
  tripLabel: { color: GREEN, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 1 },
  confirmBadge: {
    color: GREEN,
    fontSize: TextSize.micro,
    backgroundColor: "#EAF4EC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  operator: { color: DARK, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, marginTop: 12 },
  route: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 17,
  },
  city: { color: DARK, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  routeCaption: { color: "#89948C", fontSize: TextSize.micro, marginTop: 4 },
  routeArrow: { color: GREEN, fontSize: TextSize.displaySmall },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 14 },
  tripBottom: { flexDirection: "row", justifyContent: "space-between" },
  smallLabel: { color: "#87938A", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  smallValue: { color: DARK, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, marginTop: 5 },
  price: { color: GREEN, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, marginTop: 3 },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
  },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 19 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: GREEN, fontSize: TextSize.displaySmall },
  cardTitle: { color: DARK, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  cardSub: { color: "#89948C", fontSize: TextSize.micro, marginTop: 4 },
  field: { marginBottom: 16 },
  label: { color: "#66746A", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, marginBottom: 7 },
  input: {
    height: 45,
    backgroundColor: "#F7F9F7",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: DARK,
    fontSize: TextSize.caption,
  },
  twoColumns: { flexDirection: "row", gap: 12 },
  genderRow: { flexDirection: "row", gap: 4 },
  genderButton: {
    flex: 1,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F9F7",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 7,
    paddingHorizontal: 2,
  },
  genderText: { color: "#69766D", fontSize: TextSize.micro, fontWeight: FontWeight.bold },
  optionActive: { backgroundColor: GREEN, borderColor: GREEN },
  optionTextActive: { color: "#FFFFFF" },
  helper: { color: "#849087", fontSize: TextSize.micro, lineHeight: 15, marginTop: -3 },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    padding: 12,
    marginTop: 12,
    gap: 10,
  },
  paymentActive: { borderColor: GREEN, backgroundColor: "#F0F7F1" },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconText: { color: GREEN, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold },
  paymentTitle: { color: DARK, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  paymentSub: { color: "#89948C", fontSize: TextSize.micro, marginTop: 4 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: GREEN },
  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 18 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#A8B8AB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: GREEN, borderColor: GREEN },
  checkmark: { color: "#FFFFFF", fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  termsText: { flex: 1, color: "#657268", fontSize: TextSize.micro, lineHeight: 16 },
  bottomCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
  },
  bottomLabel: { color: "#87938A", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  bottomPrice: { color: GREEN, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold, marginTop: 3 },
  bottomSub: { color: "#87938A", fontSize: TextSize.micro, marginTop: 3 },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 13,
  },
  continueText: { color: "#FFFFFF", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  arrow: { color: YELLOW, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  footer: { textAlign: "center", color: "#87938A", fontSize: TextSize.micro, marginTop: 18 },
});
