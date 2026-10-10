import { TextSize, FontWeight } from '@/constants/typography';
import { Text } from '@/components/ui/Text';

import React from "react";
import { SafeAreaView, ScrollView, View, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#075638";
const DARK = "#153C2D";
const BG = "#F3F7F3";
const BORDER = "#DCE8DF";
const MUTED = "#879289";
const YELLOW = "#FFD83D";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const name = String(params.name || "Passenger");
  const phone = String(params.phone || "");
  const from = String(params.from || "Delhi");
  const to = String(params.to || "Jaipur");
  const operator = String(params.operator || "GreenLine Travels");
  const date = String(params.date || "09 Oct 2026");
  const seats = String(params.seats || "L1");
  const payment = String(params.payment || "UPI");
  const price = Number(params.price || 899);
  const passengers = Number(params.passengers || 1);

  // Demo confirmation reference; replace with a real booking ID from your backend.
  const bookingId = `LT${Date.now().toString().slice(-8)}`;

  const Detail = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={GREEN} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🍋 LemonTrip</Text>
          <Text style={styles.tagline}>YOUR JOURNEY, SIMPLIFIED</Text>
        </View>

        <View style={styles.successCard}>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>

          <Text style={styles.eyebrow}>BOOKING CONFIRMATION</Text>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successMessage}>
            Thank you, {name}. Your booking confirmation screen is ready.
          </Text>

          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>DEMO CONFIRMATION</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your bus journey</Text>
          <Text style={styles.operator}>{operator}</Text>

          <View style={styles.routeRow}>
            <View style={styles.city}>
              <Text style={styles.cityName}>{from}</Text>
              <Text style={styles.smallText}>Departure</Text>
            </View>

            <View style={styles.routeMiddle}>
              <View style={styles.routeLine} />
              <Text style={styles.busIcon}>🚌</Text>
              <Text style={styles.smallText}>Direct journey</Text>
            </View>

            <View style={[styles.city, styles.cityRight]}>
              <Text style={styles.cityName}>{to}</Text>
              <Text style={styles.smallText}>Destination</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Detail label="TRAVEL DATE" value={date} />
          <Detail label="PASSENGER" value={name} />
          <Detail label="SEAT NUMBER(S)" value={seats} />
          <Detail label="PASSENGERS" value={String(passengers)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment summary</Text>
          <Detail label="PAYMENT METHOD" value={payment} />
          <Detail label="PAYMENT STATUS" value="Demo only" />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.smallText}>
                For {passengers} passenger(s)
              </Text>
            </View>
            <Text style={styles.totalAmount}>
              ₹{Math.max(0, price).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>BOOKING REFERENCE</Text>
          <Text style={styles.referenceId}>{bookingId}</Text>
          <Text style={styles.referenceNote}>
            This is a demo reference, not a real ticket or PNR.
          </Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>What happens next?</Text>
          <Text style={styles.noticeText}>
            Once a real payment gateway and booking API are connected, this
            screen can display the verified payment status and confirmed ticket.
          </Text>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/(tabs)/explore/buses" as any)}
        >
          <Text style={styles.primaryButtonText}>Back to bus search</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/(tabs)" as any)}
        >
          <Text style={styles.secondaryButtonText}>Go to Home</Text>
        </Pressable>

        <Text style={styles.footer}>
          🍋 LemonTrip · Travel smarter, travel better.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  header: {
    backgroundColor: GREEN,
    borderRadius: 12,
    padding: 16,
    marginBottom: 22,
  },
  logo: {
    color: "#FFFFFF",
    fontSize: TextSize.heading,
    fontWeight: FontWeight.extraBold,
  },
  tagline: {
    color: "#D7EADF",
    fontSize: TextSize.micro,
    marginTop: 3,
    letterSpacing: 1,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  checkCircle: {
    height: 72,
    width: 72,
    borderRadius: 36,
    backgroundColor: "#E5F5EB",
    borderWidth: 2,
    borderColor: "#9CD6B0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  check: {
    color: GREEN,
    fontSize: TextSize.heroLarge,
    fontWeight: FontWeight.extraBold,
  },
  eyebrow: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1.3,
  },
  successTitle: {
    color: DARK,
    fontSize: TextSize.display,
    fontWeight: FontWeight.extraBold,
    marginTop: 8,
    textAlign: "center",
  },
  successMessage: {
    color: MUTED,
    fontSize: TextSize.body,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5CC",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
    gap: 7,
  },
  statusDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: "#A87900",
  },
  statusText: {
    color: "#765800",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    color: DARK,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
    marginBottom: 12,
  },
  operator: {
    color: GREEN,
    fontSize: TextSize.body,
    fontWeight: FontWeight.bold,
    marginBottom: 18,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  city: {
    flex: 1,
  },
  cityRight: {
    alignItems: "flex-end",
  },
  cityName: {
    color: DARK,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  smallText: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 4,
  },
  routeMiddle: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  routeLine: {
    height: 1,
    width: "100%",
    backgroundColor: "#9CC8AE",
    position: "absolute",
    top: 8,
  },
  busIcon: {
    fontSize: TextSize.title,
    backgroundColor: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 8,
  },
  detailLabel: {
    color: MUTED,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  detailValue: {
    color: DARK,
    fontSize: TextSize.caption,
    fontWeight: FontWeight.extraBold,
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: MUTED,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  totalAmount: {
    color: GREEN,
    fontSize: TextSize.displaySmall,
    fontWeight: FontWeight.extraBold,
  },
  referenceCard: {
    backgroundColor: "#E8F4EC",
    borderColor: "#C8E2D0",
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  referenceLabel: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  referenceId: {
    color: DARK,
    fontSize: TextSize.displaySmall,
    fontWeight: FontWeight.extraBold,
    marginTop: 8,
    letterSpacing: 1,
  },
  referenceNote: {
    color: MUTED,
    fontSize: TextSize.micro,
    textAlign: "center",
    marginTop: 8,
  },
  notice: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: YELLOW,
  },
  noticeTitle: {
    color: DARK,
    fontWeight: FontWeight.extraBold,
    fontSize: TextSize.body,
    marginBottom: 6,
  },
  noticeText: {
    color: MUTED,
    fontSize: TextSize.micro,
    lineHeight: 17,
  },
  primaryButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },
  arrow: {
    color: YELLOW,
    fontSize: TextSize.displaySmall,
    fontWeight: FontWeight.extraBold,
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },
  footer: {
    textAlign: "center",
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 24,
  },
});
