import { TextSize, FontWeight } from '@/constants/typography';
import { Text } from '@/components/ui/Text';

import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";

const GREEN = "#075638";
const DARK = "#153C2D";
const BG = "#F4F8F4";
const BORDER = "#DCE8DF";
const YELLOW = "#FFD83D";

export default function BusDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [deck, setDeck] = useState<"Lower" | "Upper">("Lower");

  const operator = String(params.operator || "GreenLine Travels");
  const from = String(params.from || "Delhi");
  const to = String(params.to || "Jaipur");
  const departure = String(params.departure || "21:30");
  const arrival = String(params.arrival || "06:00");
  const duration = String(params.duration || "8h 30m");
  const price = Number(params.price || 899);
  const date = String(params.date || "09 Oct 2026");
  const busType = String(params.type || "AC Sleeper (2+1)");

  const unavailableSeats = ["L2", "L5", "L9", "L12", "U3", "U8"];

  const toggleSeat = (seat: string) => {
    if (unavailableSeats.includes(seat)) return;

    setSelectedSeats((current) =>
      current.includes(seat)
        ? current.filter((item) => item !== seat)
        : current.length >= 6
        ? current
        : [...current, seat]
    );
  };

  const seatPrice = selectedSeats.length * price;

  const continueBooking = () => {
    if (selectedSeats.length === 0) {
      Alert.alert("Select a seat", "Please select at least one available seat.");
      return;
    }

    router.push({
      pathname: "/(tabs)/explore/bus-passengers" as any,
      params: {
        operator,
        from,
        to,
        departure,
        arrival,
        date,
        seats: selectedSeats.join(","),
        passengers: String(selectedSeats.length),
        price: String(seatPrice),
        busPrice: String(price),
      },
    });
  };

  const renderSeat = (seat: string) => {
    const unavailable = unavailableSeats.includes(seat);
    const selected = selectedSeats.includes(seat);

    return (
      <Pressable
        key={seat}
        onPress={() => toggleSeat(seat)}
        style={[
          styles.seat,
          unavailable && styles.seatUnavailable,
          selected && styles.seatSelected,
        ]}
      >
        <Text
          style={[
            styles.seatText,
            unavailable && styles.unavailableText,
            selected && styles.selectedText,
          ]}
        >
          {seat}
        </Text>
      </Pressable>
    );
  };

  const lowerSeats = [
    ["L1", "L2", "L3"],
    ["L4", "L5", "L6"],
    ["L7", "L8", "L9"],
    ["L10", "L11", "L12"],
  ];

  const upperSeats = [
    ["U1", "U2", "U3"],
    ["U4", "U5", "U6"],
    ["U7", "U8", "U9"],
    ["U10", "U11", "U12"],
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.brand}>
            <Text style={styles.logo}>🍋</Text>
            <View>
              <Text style={styles.brandName}>LemonTrip</Text>
              <Text style={styles.brandSubtitle}>BUS BOOKING</Text>
            </View>
          </View>
          <View style={{ width: 35 }} />
        </View>

        <Text style={styles.eyebrow}>YOUR JOURNEY</Text>
        <Text style={styles.title}>Bus details</Text>
        <Text style={styles.subtitle}>
          Choose your preferred seats for a comfortable journey.
        </Text>

        <View style={styles.tripCard}>
          <View style={styles.operatorRow}>
            <View style={styles.busIcon}>
              <Text style={{ fontSize: TextSize.display }}>🚌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.operator}>{operator}</Text>
              <Text style={styles.busType}>{busType}</Text>
              <Text style={styles.rating}>★ 4.7 · Guest rated</Text>
            </View>
            <View style={styles.acBadge}>
              <Text style={styles.acText}>AC</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View>
              <Text style={styles.time}>{departure}</Text>
              <Text style={styles.city}>{from}</Text>
            </View>
            <View style={styles.routeMiddle}>
              <Text style={styles.duration}>{duration}</Text>
              <View style={styles.routeLine}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <Text>🚌</Text>
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.direct}>Direct journey</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.time}>{arrival}</Text>
              <Text style={styles.city}>{to}</Text>
            </View>
          </View>

          <View style={styles.separator} />
          <Text style={styles.dateText}>▣  {date}</Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Select your seats</Text>
          <Text style={styles.selectedCount}>
            {selectedSeats.length} selected
          </Text>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#FFFFFF" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: GREEN }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#D7DEDA" }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
        </View>

        <View style={styles.busLayout}>
          <View style={styles.driverRow}>
            <Text style={styles.driverLabel}>FRONT OF BUS</Text>
            <Text style={styles.steering}>◉</Text>
          </View>

          <View style={styles.deckSelector}>
            {(["Lower", "Upper"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setDeck(item)}
                style={[
                  styles.deckButton,
                  deck === item && styles.deckActive,
                ]}
              >
                <Text
                  style={[
                    styles.deckText,
                    deck === item && styles.deckTextActive,
                  ]}
                >
                  {item} deck
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.deckHint}>
            {deck === "Lower" ? "Lower deck · Sleeper berths" : "Upper deck · Sleeper berths"}
          </Text>

          {(deck === "Lower" ? lowerSeats : upperSeats).map(
            (row, index) => (
              <View key={index} style={styles.seatRow}>
                {row.map((seat, seatIndex) => (
                  <React.Fragment key={seat}>
                    {renderSeat(seat)}
                    {seatIndex === 0 && <View style={styles.aisle} />}
                  </React.Fragment>
                ))}
              </View>
            )
          )}

          <Text style={styles.layoutNote}>
            Seat layout is illustrative. Confirm availability before payment.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Selected seats</Text>
            <Text style={styles.summaryValue}>
              {selectedSeats.length ? selectedSeats.join(", ") : "None"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Price per seat</Text>
            <Text style={styles.summaryValue}>₹{price}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Passengers</Text>
            <Text style={styles.summaryValue}>{selectedSeats.length}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total amount</Text>
            <Text style={styles.totalPrice}>₹{seatPrice.toLocaleString("en-IN")}</Text>
          </View>

          <Pressable style={styles.continueButton} onPress={continueBooking}>
            <Text style={styles.continueText}>Continue to passenger details</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          🍋 LemonTrip · Travel smarter, travel better.
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 23,
  },
  backButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
  },
  backText: { color: "#FFFFFF", fontSize: TextSize.hero },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { fontSize: TextSize.displaySmall },
  brandName: { color: "#FFFFFF", fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  brandSubtitle: { color: "#D6E8DC", fontSize: TextSize.micro, marginTop: 2 },
  eyebrow: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  title: {
    color: DARK,
    fontSize: TextSize.display,
    fontWeight: FontWeight.extraBold,
    marginTop: 5,
  },
  subtitle: {
    color: "#758178",
    fontSize: TextSize.micro,
    lineHeight: 17,
    marginTop: 5,
    marginBottom: 17,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 23,
  },
  operatorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  busIcon: {
    width: 43,
    height: 43,
    backgroundColor: "#EAF4EC",
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  operator: { color: DARK, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  busType: { color: "#78867D", fontSize: TextSize.micro, marginTop: 4 },
  rating: { color: GREEN, fontSize: TextSize.micro, marginTop: 4 },
  acBadge: {
    backgroundColor: "#EAF4EC",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 5,
  },
  acText: { color: GREEN, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  routeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
  },
  time: { color: DARK, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  city: { color: "#7B887E", fontSize: TextSize.micro, marginTop: 4 },
  routeMiddle: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  duration: { color: "#758178", fontSize: TextSize.micro },
  routeLine: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: GREEN },
  line: { flex: 1, height: 1, backgroundColor: "#A6CBB1" },
  direct: { color: "#849087", fontSize: TextSize.micro },
  separator: { height: 1, backgroundColor: "#E6EDE7", marginVertical: 13 },
  dateText: { color: DARK, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { color: DARK, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  selectedCount: { color: GREEN, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: {
    width: 15,
    height: 15,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
  },
  legendText: { color: "#66746A", fontSize: TextSize.micro },
  busLayout: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  driverRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  driverLabel: {
    color: "#849087",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1,
  },
  steering: { color: GREEN, fontSize: TextSize.displaySmall },
  deckSelector: {
    flexDirection: "row",
    backgroundColor: "#F0F5F0",
    padding: 4,
    borderRadius: 8,
    marginTop: 15,
  },
  deckButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  deckActive: { backgroundColor: GREEN },
  deckText: { color: "#617067", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  deckTextActive: { color: "#FFFFFF" },
  deckHint: {
    textAlign: "center",
    color: "#839087",
    fontSize: TextSize.micro,
    marginVertical: 15,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  seat: {
    width: 65,
    height: 42,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B8D2BF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  seatUnavailable: { backgroundColor: "#D7DEDA", borderColor: "#D7DEDA" },
  seatSelected: { backgroundColor: GREEN, borderColor: GREEN },
  seatText: { color: GREEN, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  unavailableText: { color: "#7F8B83" },
  selectedText: { color: "#FFFFFF" },
  aisle: { width: 24 },
  layoutNote: {
    color: "#89948C",
    fontSize: TextSize.micro,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 14,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
    gap: 8,
  },
  summaryLabel: { color: "#758178", fontSize: TextSize.micro },
  summaryValue: {
    color: DARK,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    flexShrink: 1,
    textAlign: "right",
  },
  totalLabel: { color: DARK, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  totalPrice: { color: GREEN, fontSize: TextSize.displaySmall, fontWeight: FontWeight.extraBold },
  continueButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GREEN,
    borderRadius: 8,
    padding: 14,
    marginTop: 18,
  },
  continueText: { color: "#FFFFFF", fontSize: TextSize.micro, fontWeight: FontWeight.extraBold },
  arrow: { color: YELLOW, fontSize: TextSize.heading, fontWeight: FontWeight.extraBold },
  footer: {
    textAlign: "center",
    color: "#849087",
    fontSize: TextSize.micro,
    marginTop: 22,
  },
});
