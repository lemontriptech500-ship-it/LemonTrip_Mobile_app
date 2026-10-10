
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#075638";
const DARK = "#153C2D";
const BG = "#F3F7F3";
const BORDER = "#DCE8DF";
const YELLOW = "#FFD83D";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [payment, setPayment] = useState(
    String(params.payment || "UPI")
  );
  const [confirmed, setConfirmed] = useState(false);

  const name = String(params.name || "Passenger");
  const phone = String(params.phone || "");
  const from = String(params.from || "Delhi");
  const to = String(params.to || "Jaipur");
  const operator = String(params.operator || "GreenLine Travels");
  const date = String(params.date || "09 Oct 2026");
  const seats = String(params.seats || "L1");
  const passengers = Math.max(1, Number(params.passengers || 1));
  const baseFare = Math.max(0, Number(params.price || 899));
  const total = baseFare * passengers;
  const taxes = Math.round(total * 0.05);
  const grandTotal = total + taxes;

const handleConfirm = () => {
  router.push({
    pathname: "/(tabs)/booking-confirmation" as any,
    params: {
      name,
      phone,
      from,
      to,
      operator,
      date,
      seats,
      passengers: String(passengers),
      price: String(grandTotal),
      payment,
    },
  });
};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.brand}>
            <Text style={styles.logo}>🍋</Text>
            <View>
              <Text style={styles.brandName}>LemonTrip</Text>
              <Text style={styles.brandSub}>
                YOUR JOURNEY, SIMPLIFIED
              </Text>
            </View>
          </View>

          <Text style={styles.secure}>🔒</Text>
        </View>

        <Text style={styles.eyebrow}>BUS BOOKING · STEP 4</Text>
        <Text style={styles.title}>Review & payment</Text>
        <Text style={styles.subtitle}>
          Check your trip details before proceeding.
        </Text>

        <View style={styles.steps}>
          {["✓", "✓", "✓", "4"].map((item, index) => (
            <React.Fragment key={index}>
              <View
                style={[
                  styles.stepCircle,
                  index < 3 && styles.stepDone,
                  index === 3 && styles.stepCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.stepText,
                    index === 3 && styles.currentStepText,
                  ]}
                >
                  {item}
                </Text>
              </View>
              {index < 3 && <View style={styles.stepLine} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Your bus journey</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>REVIEW</Text>
            </View>
          </View>

          <View style={styles.operatorRow}>
            <View style={styles.busIcon}>
              <Text style={styles.busEmoji}>🚌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.operatorName}>{operator}</Text>
              <Text style={styles.muted}>Bus service · Selected journey</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View>
              <Text style={styles.city}>{from}</Text>
              <Text style={styles.muted}>From</Text>
            </View>

            <View style={styles.routeMiddle}>
              <View style={styles.routeLine} />
              <Text style={styles.routeArrow}>➜</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.city}>{to}</Text>
              <Text style={styles.muted}>To</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>TRAVEL DATE</Text>
              <Text style={styles.value}>{date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>SEAT NUMBER</Text>
              <Text style={styles.value}>{seats}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>PASSENGERS</Text>
              <Text style={styles.value}>{passengers}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Passenger information</Text>

          <View style={styles.passengerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>♙</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>{name}</Text>
              <Text style={styles.muted}>Lead passenger</Text>
            </View>
            <Text style={styles.verified}>✓ Details added</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.muted}>Mobile number</Text>
            <Text style={styles.value}>
              {phone || "Not provided"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Choose payment method</Text>
          <Text style={styles.muted}>
            Select your preferred payment option.
          </Text>

          {[
            {
              id: "UPI",
              icon: "◈",
              title: "UPI",
              sub: "Google Pay, PhonePe, BHIM",
            },
            {
              id: "Card",
              icon: "▤",
              title: "Credit / Debit Card",
              sub: "Visa, Mastercard and more",
            },
            {
              id: "Net Banking",
              icon: "⌂",
              title: "Net Banking",
              sub: "Pay through your bank",
            },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setPayment(item.id)}
              style={[
                styles.paymentOption,
                payment === item.id && styles.paymentSelected,
              ]}
            >
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>
                  {item.icon}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.paymentTitle}>{item.title}</Text>
                <Text style={styles.muted}>{item.sub}</Text>
              </View>

              <View style={styles.radio}>
                {payment === item.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fare summary</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>
              Bus fare × {passengers}
            </Text>
            <Text style={styles.fareValue}>
              ₹{total.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated taxes (5%)</Text>
            <Text style={styles.fareValue}>
              ₹{taxes.toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.fareRow}>
            <Text style={styles.totalLabel}>Total payable</Text>
            <Text style={styles.totalPrice}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </Text>
          </View>

          <Text style={styles.disclaimer}>
            Taxes are illustrative. Final charges depend on the actual
            booking provider.
          </Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>🔐</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Secure checkout</Text>
            <Text style={styles.noticeText}>
              This is a UI demo. A real payment gateway and booking
              provider must be integrated before accepting payments.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmText}>
            {confirmed ? "Demo checked" : "Proceed to payment"}
          </Text>
          <Text style={styles.confirmArrow}>→</Text>
        </Pressable>

        <Pressable
          style={styles.backLink}
          onPress={() => router.back()}
        >
          <Text style={styles.backLinkText}>
            ← Back to passenger details
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          LemonTrip · Travel with confidence
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
    padding: 14,
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
  backButton: {
    width: 28,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 29,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    fontSize: 22,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  brandSub: {
    color: "#D7E9DD",
    fontSize: 8,
    marginTop: 3,
  },
  secure: {
    fontSize: 15,
  },
  eyebrow: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    color: DARK,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 5,
  },
  subtitle: {
    color: "#78857B",
    fontSize: 11,
    marginTop: 6,
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 21,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E3EAE4",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDone: {
    backgroundColor: GREEN,
  },
  stepCurrent: {
    backgroundColor: YELLOW,
  },
  stepText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  currentStepText: {
    color: DARK,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: "#B8D1BF",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: DARK,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#FFF4C8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  badgeText: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "900",
  },
  operatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 3,
  },
  busIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  busEmoji: {
    fontSize: 22,
  },
  operatorName: {
    color: DARK,
    fontSize: 12,
    fontWeight: "900",
  },
  muted: {
    color: "#839087",
    fontSize: 10,
    marginTop: 4,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
  },
  city: {
    color: DARK,
    fontSize: 17,
    fontWeight: "900",
  },
  routeMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
  },
  routeLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#86B69A",
  },
  routeArrow: {
    color: GREEN,
    marginLeft: -3,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  detailItem: {
    flex: 1,
  },
  label: {
    color: "#839087",
    fontSize: 8,
    fontWeight: "900",
    marginBottom: 5,
  },
  value: {
    color: DARK,
    fontSize: 11,
    fontWeight: "800",
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 5,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: GREEN,
    fontSize: 20,
  },
  verified: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "700",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    padding: 11,
    marginTop: 11,
  },
  paymentSelected: {
    borderColor: GREEN,
    backgroundColor: "#F0F7F1",
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconText: {
    color: GREEN,
    fontSize: 21,
    fontWeight: "900",
  },
  paymentTitle: {
    color: DARK,
    fontSize: 11,
    fontWeight: "900",
  },
  radio: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: GREEN,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GREEN,
  },
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 7,
  },
  fareLabel: {
    color: "#738076",
    fontSize: 11,
  },
  fareValue: {
    color: DARK,
    fontSize: 11,
    fontWeight: "700",
  },
  totalLabel: {
    color: DARK,
    fontSize: 13,
    fontWeight: "900",
  },
  totalPrice: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
  },
  disclaimer: {
    color: "#87938A",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 8,
  },
  notice: {
    flexDirection: "row",
    gap: 10,
    padding: 13,
    borderRadius: 10,
    backgroundColor: "#EAF4EC",
    marginBottom: 17,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeTitle: {
    color: DARK,
    fontSize: 11,
    fontWeight: "900",
  },
  noticeText: {
    color: "#65766A",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: GREEN,
    borderRadius: 9,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  confirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  confirmArrow: {
    color: YELLOW,
    fontSize: 19,
    fontWeight: "900",
  },
  backLink: {
    alignItems: "center",
    padding: 15,
  },
  backLinkText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: "#89948C",
    fontSize: 10,
    marginTop: 8,
  },
});
