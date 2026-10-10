import { TextSize, FontWeight } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';

import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Pressable, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useRouter } from "expo-router";

const GREEN = "#075638";
const DARK = "#123D2C";
const YELLOW = "#FFD83D";
const MUTED = "#718078";
const BORDER = "#DCE8DF";
const BG = "#F4F8F4";

type Bus = {
  id: string;
  operator: string;
  type: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  seats: number;
  rating: number;
  ac: boolean;
  sleeper: boolean;
};

const BUSES: Bus[] = [
  {
    id: "bus-1",
    operator: "GreenLine Travels",
    type: "AC Sleeper (2+1)",
    departure: "21:30",
    arrival: "06:00",
    duration: "8h 30m",
    price: 899,
    seats: 18,
    rating: 4.7,
    ac: true,
    sleeper: true,
  },
  {
    id: "bus-2",
    operator: "Royal Express",
    type: "AC Seater/Sleeper",
    departure: "22:15",
    arrival: "06:45",
    duration: "8h 30m",
    price: 1099,
    seats: 12,
    rating: 4.5,
    ac: true,
    sleeper: true,
  },
  {
    id: "bus-3",
    operator: "Sharma Travels",
    type: "Non-AC Sleeper",
    departure: "20:00",
    arrival: "05:30",
    duration: "9h 30m",
    price: 649,
    seats: 21,
    rating: 4.2,
    ac: false,
    sleeper: true,
  },
  {
    id: "bus-4",
    operator: "City Connect",
    type: "AC Seater",
    departure: "07:00",
    arrival: "15:00",
    duration: "8h 00m",
    price: 549,
    seats: 26,
    rating: 4.1,
    ac: true,
    sleeper: false,
  },
  {
    id: "bus-5",
    operator: "Lemon Travels",
    type: "AC Sleeper (2+1)",
    departure: "23:00",
    arrival: "07:30",
    duration: "8h 30m",
    price: 999,
    seats: 9,
    rating: 4.8,
    ac: true,
    sleeper: true,
  },
];

type Filter = "All" | "AC" | "Non-AC" | "Sleeper" | "Seater";
type Sort = "Recommended" | "Lowest Price" | "Highest Rated" | "Earliest";

export default function BusesScreen() {
  const router = useRouter();

  const [from, setFrom] = useState("Delhi");
  const [to, setTo] = useState("Jaipur");
  const [journeyDate, setJourneyDate] = useState("09 Oct 2026");
  const [passengers, setPassengers] = useState(1);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<Sort>("Recommended");
  const [maxPrice, setMaxPrice] = useState("2000");

  const buses = useMemo(() => {
    const list = BUSES.filter((bus) => {
      const matchesFilter =
        filter === "All" ||
        (filter === "AC" && bus.ac) ||
        (filter === "Non-AC" && !bus.ac) ||
        (filter === "Sleeper" && bus.sleeper) ||
        (filter === "Seater" && !bus.sleeper);

      return matchesFilter && bus.price <= Number(maxPrice || 0);
    });

    if (sort === "Lowest Price") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "Highest Rated") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === "Earliest") {
      list.sort((a, b) => a.departure.localeCompare(b.departure));
    }

    return list;
  }, [filter, sort, maxPrice]);

  const changeDate = (amount: number) => {
    const date = new Date(2026, 9, 9);
    const parts = journeyDate.match(/^(\d{2}) (\w{3}) (\d{4})$/);

    if (parts) {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const month = months.indexOf(parts[2]);
      if (month >= 0) {
        date.setFullYear(Number(parts[3]), month, Number(parts[1]));
      }
    }

    date.setDate(date.getDate() + amount);
    setJourneyDate(
      `${String(date.getDate()).padStart(2, "0")} ${
        date.toLocaleString("en-GB", { month: "short" })
      } ${date.getFullYear()}`
    );
  };

  const searchBuses = () => {
    if (!from.trim() || !to.trim()) {
      Alert.alert("Missing details", "Enter your departure and destination.");
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      Alert.alert("Invalid route", "From and To cities must be different.");
      return;
    }

    setSearched(true);
  };

  const openBus = (bus: Bus) => {
    router.push({
      pathname: "/(tabs)/explore/bus-details" as any,
      params: {
        id: bus.id,
        operator: bus.operator,
        type: bus.type,
        departure: bus.departure,
        arrival: bus.arrival,
        duration: bus.duration,
        price: String(bus.price),
        seats: String(bus.seats),
        rating: String(bus.rating),
        from: from.trim(),
        to: to.trim(),
        date: journeyDate,
        passengers: String(passengers),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Text style={styles.logo}>🍋</Text>
            <View>
              <Text style={styles.brandName}>LemonTrip</Text>
              <Text style={styles.tagline}>TRAVEL SMARTER, TRAVEL BETTER</Text>
            </View>
          </View>
          <Pressable
            style={styles.menuButton}
            onPress={() => router.push("/(tabs)/explore" as any)}
          >
            <Text style={styles.menuText}>☰</Text>
          </Pressable>
        </View>

        {/* HERO BANNER */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1000",
          }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroShade}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>LEMONTRIP BUS TRAVEL</Text>
            </View>
            <Text style={styles.heroTitle}>Your journey,</Text>
            <Text style={styles.heroTitle}>your way.</Text>
            <Text style={styles.heroSubtitle}>
              Find your seat. Enjoy the ride.
            </Text>
            <View style={styles.heroDecoration}>
              <Text style={styles.heroBus}>🚌</Text>
            </View>
          </View>
        </ImageBackground>

        {/* PAGE TITLE */}
        <View style={styles.heading}>
          <View style={styles.headingMark} />
          <View style={styles.headingContent}>
            <Text style={styles.eyebrow}>TRAVEL COMFORTABLY</Text>
            <Text style={styles.pageTitle}>Book your bus</Text>
            <Text style={styles.subtitle}>
              Compare buses, choose your seat and book your trip.
            </Text>
          </View>
        </View>

        {/* SEARCH FORM */}
        <View style={styles.searchCard}>
          <View style={styles.cardHeading}>
            <View>
              <Text style={styles.cardTitle}>Plan your journey</Text>
              <Text style={styles.cardSubtitle}>
                Where would you like to go?
              </Text>
            </View>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>↗</Text>
            </View>
          </View>

          <View style={styles.cityRow}>
            <View style={styles.cityField}>
              <Text style={styles.fieldLabel}>FROM</Text>
              <TextInput
                value={from}
                onChangeText={setFrom}
                placeholder="Departure city"
                placeholderTextColor="#8A9690"
                style={styles.cityInput}
                accessibilityLabel="Departure city"
              />
              <Text style={styles.fieldHint}>Boarding city</Text>
            </View>

            <Pressable
              style={styles.swapButton}
              onPress={() => {
                setFrom(to);
                setTo(from);
              }}
              accessibilityLabel="Swap cities"
            >
              <Text style={styles.swapText}>⇅</Text>
            </Pressable>

            <View style={styles.cityField}>
              <Text style={styles.fieldLabel}>TO</Text>
              <TextInput
                value={to}
                onChangeText={setTo}
                placeholder="Destination city"
                placeholderTextColor="#8A9690"
                style={styles.cityInput}
                accessibilityLabel="Destination city"
              />
              <Text style={styles.fieldHint}>Arrival city</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.tripRow}>
            <View style={styles.dateField}>
              <Text style={styles.fieldLabel}>JOURNEY DATE</Text>
              <Text style={styles.dateValue}>▣  {journeyDate}</Text>
              <View style={styles.dateActions}>
                <Pressable onPress={() => changeDate(-1)}>
                  <Text style={styles.dateAction}>‹ Previous</Text>
                </Pressable>
                <Pressable onPress={() => changeDate(1)}>
                  <Text style={styles.dateAction}>Next ›</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.passengerField}>
              <Text style={styles.fieldLabel}>PASSENGERS</Text>
              <View style={styles.counter}>
                <Pressable
                  style={styles.counterButton}
                  onPress={() => setPassengers((n) => Math.max(1, n - 1))}
                >
                  <Text style={styles.counterText}>−</Text>
                </Pressable>
                <Text style={styles.passengerCount}>{passengers}</Text>
                <Pressable
                  style={styles.counterButton}
                  onPress={() => setPassengers((n) => Math.min(6, n + 1))}
                >
                  <Text style={styles.counterText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.fieldHint}>Travellers</Text>
            </View>
          </View>

          <Pressable style={styles.searchButton} onPress={searchBuses}>
            <Text style={styles.searchButtonText}>⌕  Search buses</Text>
            <View style={styles.searchArrowCircle}>
              <Text style={styles.searchArrow}>→</Text>
            </View>
          </Pressable>

          <View style={styles.secureRow}>
            <Text style={styles.secureText}>✓ Secure booking</Text>
            <Text style={styles.secureText}>✓ Easy seat selection</Text>
          </View>
        </View>

        {/* POPULAR ROUTES */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Popular buses</Text>
            <Text style={styles.sectionSubtitle}>
              Explore rides for your next trip
            </Text>
          </View>
          <View style={styles.yellowBadge}>
            <Text style={styles.yellowBadgeText}>TOP PICKS</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.popularRow}
        >
          {[
            { city: "Delhi", destination: "Jaipur", price: "₹549", icon: "🏰" },
            { city: "Delhi", destination: "Agra", price: "₹399", icon: "🕌" },
            { city: "Delhi", destination: "Manali", price: "₹799", icon: "🏔️" },
          ].map((route) => (
            <Pressable
              key={route.destination}
              style={styles.popularCard}
              onPress={() => {
                setFrom(route.city);
                setTo(route.destination);
              }}
            >
              <Text style={styles.popularIcon}>{route.icon}</Text>
              <Text style={styles.popularRoute}>
                {route.city} → {route.destination}
              </Text>
              <Text style={styles.popularPrice}>From {route.price}</Text>
              <Text style={styles.popularAction}>Choose route →</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* RESULTS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              {searched ? "Available buses" : "Recommended rides"}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {buses.length} buses · {from} to {to}
            </Text>
          </View>
          <View style={styles.resultCount}>
            <Text style={styles.resultCountText}>{buses.length} rides</Text>
          </View>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(["All", "AC", "Non-AC", "Sleeper", "Seater"] as Filter[]).map(
            (item) => (
              <Pressable
                key={item}
                onPress={() => setFilter(item)}
                style={[
                  styles.filterChip,
                  filter === item && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            )
          )}
        </ScrollView>

        {/* SORT AND PRICE */}
        <View style={styles.controlsCard}>
          <Text style={styles.fieldLabel}>SORT BY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sortRow}>
              {(
                [
                  "Recommended",
                  "Lowest Price",
                  "Highest Rated",
                  "Earliest",
                ] as Sort[]
              ).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setSort(item)}
                  style={[
                    styles.sortChip,
                    sort === item && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortText,
                      sort === item && styles.sortTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.priceRow}>
            <Text style={styles.fieldLabel}>MAXIMUM PRICE (₹)</Text>
            <TextInput
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              style={styles.priceInput}
              accessibilityLabel="Maximum ticket price"
            />
          </View>
        </View>

        {/* BUS CARDS */}
        {buses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🚌</Text>
            <Text style={styles.emptyTitle}>No buses found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different filter or increase your maximum price.
            </Text>
            <Pressable
              style={styles.resetButton}
              onPress={() => {
                setFilter("All");
                setSort("Recommended");
                setMaxPrice("2000");
              }}
            >
              <Text style={styles.resetText}>Reset filters</Text>
            </Pressable>
          </View>
        ) : (
          buses.map((bus, index) => (
            <View key={bus.id} style={styles.busCard}>
              <View style={styles.busTop}>
                <View style={styles.busIconBox}>
                  <Text style={styles.busIcon}>🚌</Text>
                </View>

                <View style={styles.operatorBlock}>
                  <Text style={styles.operatorName}>{bus.operator}</Text>
                  <Text style={styles.busType}>{bus.type}</Text>
                  <Text style={styles.rating}>
                    ★ {bus.rating} <Text style={styles.ratingMuted}>· Guest rating</Text>
                  </Text>
                </View>

                {index === 0 && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>Popular</Text>
                  </View>
                )}
              </View>

              <View style={styles.routeLine}>
                <View>
                  <Text style={styles.timeText}>{bus.departure}</Text>
                  <Text style={styles.cityLabel}>{from}</Text>
                </View>

                <View style={styles.durationBlock}>
                  <Text style={styles.durationText}>{bus.duration}</Text>
                  <View style={styles.routeTrack}>
                    <View style={styles.routeDot} />
                    <View style={styles.routeLineInner} />
                    <Text style={styles.routeBus}>🚌</Text>
                    <View style={styles.routeLineInner} />
                    <View style={styles.routeDot} />
                  </View>
                  <Text style={styles.durationCaption}>Direct journey</Text>
                </View>

                <View style={styles.arrivalBlock}>
                  <Text style={styles.timeText}>{bus.arrival}</Text>
                  <Text style={styles.cityLabel}>{to}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.busBottom}>
                <View>
                  <Text style={styles.seatsAvailable}>
                    ✓  {bus.seats} seats available
                  </Text>
                  <Text style={styles.amenities}>
                    {bus.ac ? "❄ AC" : "Non-AC"} ·{" "}
                    {bus.sleeper ? "Sleeper" : "Seater"}
                  </Text>
                </View>
                <View style={styles.priceBlock}>
                  <Text style={styles.price}>
                    ₹{bus.price.toLocaleString("en-IN")}
                  </Text>
                  <Text style={styles.perPerson}>per person</Text>
                </View>
              </View>

              <Pressable
                style={styles.viewButton}
                onPress={() => openBus(bus)}
              >
                <Text style={styles.viewButtonText}>View seats & details</Text>
                <Text style={styles.viewButtonArrow}>→</Text>
              </Pressable>
            </View>
          ))
        )}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>🍋 LemonTrip</Text>
          <Text style={styles.footerTitle}>Travel with confidence</Text>
          <Text style={styles.footerText}>
            Compare your options and choose a journey that suits you.
          </Text>
          <Text style={styles.footerNote}>
            Sample bus schedules, fares and availability.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  screen: {
    flex: 1,
  },
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  logo: {
    fontSize: TextSize.displaySmall,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: TextSize.bodyLarge,
    fontWeight: FontWeight.extraBold,
  },
  tagline: {
    color: "#D4E9DC",
    fontSize: TextSize.micro,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 33,
    height: 33,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: TextSize.displaySmall,
  },
  hero: {
    height: 174,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: GREEN,
  },
  heroImage: {
    borderRadius: 12,
  },
  heroShade: {
    flex: 1,
    backgroundColor: "rgba(3, 48, 30, 0.58)",
    padding: 16,
    justifyContent: "center",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: YELLOW,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 9,
  },
  heroBadgeText: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 0.7,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: TextSize.display,
    fontWeight: FontWeight.extraBold,
    lineHeight: 29,
  },
  heroSubtitle: {
    color: "#F2F7F3",
    fontSize: TextSize.caption,
    marginTop: 6,
  },
  heroDecoration: {
    position: "absolute",
    right: 15,
    bottom: 14,
  },
  heroBus: {
    fontSize: TextSize.hero,
  },
  heading: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 17,
    gap: 10,
  },
  headingMark: {
    width: 4,
    borderRadius: 4,
    backgroundColor: YELLOW,
  },
  headingContent: {
    flex: 1,
  },
  eyebrow: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 1.1,
  },
  pageTitle: {
    color: DARK,
    fontSize: TextSize.display,
    fontWeight: FontWeight.extraBold,
    marginTop: 3,
  },
  subtitle: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 4,
    lineHeight: 16,
  },
  searchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 24,
  },
  cardHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: {
    color: DARK,
    fontSize: TextSize.bodyLarge,
    fontWeight: FontWeight.extraBold,
  },
  cardSubtitle: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 3,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: {
    color: GREEN,
    fontSize: TextSize.displaySmall,
    fontWeight: FontWeight.extraBold,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cityField: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#F8FAF8",
    borderWidth: 1,
    borderColor: "#E1EAE3",
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 10,
  },
  fieldLabel: {
    color: "#7C8980",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  cityInput: {
    color: DARK,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
    padding: 0,
    minWidth: 0,
  },
  fieldHint: {
    color: "#96A198",
    fontSize: TextSize.micro,
    marginTop: 5,
  },
  swapButton: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: "#EAF5EC",
    alignItems: "center",
    justifyContent: "center",
  },
  swapText: {
    color: GREEN,
    fontSize: TextSize.heading,
    fontWeight: FontWeight.extraBold,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8EEE9",
    marginVertical: 13,
  },
  tripRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  dateField: {
    flex: 1,
  },
  dateValue: {
    color: DARK,
    fontSize: TextSize.caption,
    fontWeight: FontWeight.extraBold,
  },
  dateActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 9,
  },
  dateAction: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  passengerField: {
    alignItems: "flex-start",
    minWidth: 105,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  counterButton: {
    width: 25,
    height: 25,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  counterText: {
    color: GREEN,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  passengerCount: {
    color: DARK,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },
  searchButton: {
    backgroundColor: GREEN,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 13,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },
  searchArrowCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: YELLOW,
    alignItems: "center",
    justifyContent: "center",
  },
  searchArrow: {
    color: GREEN,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  secureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 5,
  },
  secureText: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: DARK,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 3,
  },
  yellowBadge: {
    backgroundColor: "#FFF3B8",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 5,
  },
  yellowBadgeText: {
    color: "#745900",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  popularRow: {
    gap: 10,
    paddingBottom: 23,
  },
  popularCard: {
    width: 145,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
  },
  popularIcon: {
    fontSize: TextSize.displaySmall,
    marginBottom: 9,
  },
  popularRoute: {
    color: DARK,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  popularPrice: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginTop: 6,
  },
  popularAction: {
    color: "#8A968E",
    fontSize: TextSize.micro,
    marginTop: 8,
  },
  resultCount: {
    backgroundColor: "#E6F1E8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resultCountText: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  filterRow: {
    gap: 7,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER,
  },
  filterChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterText: {
    color: "#506256",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  controlsCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 12,
    gap: 9,
  },
  sortRow: {
    flexDirection: "row",
    gap: 6,
  },
  sortChip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  sortChipActive: {
    borderColor: GREEN,
    backgroundColor: "#EAF5EC",
  },
  sortText: {
    color: "#526257",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
  },
  sortTextActive: {
    color: GREEN,
    fontWeight: FontWeight.extraBold,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceInput: {
    width: 78,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: DARK,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    textAlign: "right",
  },
  busCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    marginBottom: 12,
  },
  busTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  busIconBox: {
    width: 39,
    height: 39,
    borderRadius: 8,
    backgroundColor: "#EAF4EC",
    alignItems: "center",
    justifyContent: "center",
  },
  busIcon: {
    fontSize: TextSize.displaySmall,
  },
  operatorBlock: {
    flex: 1,
    minWidth: 0,
  },
  operatorName: {
    color: DARK,
    fontSize: TextSize.caption,
    fontWeight: FontWeight.extraBold,
  },
  busType: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 3,
  },
  rating: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginTop: 4,
  },
  ratingMuted: {
    color: MUTED,
    fontWeight: FontWeight.regular,
  },
  popularBadge: {
    backgroundColor: "#FFF3BC",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
  },
  popularBadgeText: {
    color: "#745900",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  routeLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 19,
  },
  timeText: {
    color: DARK,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  cityLabel: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 3,
    maxWidth: 80,
  },
  durationBlock: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  durationText: {
    color: MUTED,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  routeTrack: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  routeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  routeLineInner: {
    height: 1,
    flex: 1,
    backgroundColor: "#9BC5A6",
  },
  routeBus: {
    fontSize: TextSize.caption,
    marginHorizontal: 3,
  },
  durationCaption: {
    color: "#89948C",
    fontSize: TextSize.micro,
  },
  arrivalBlock: {
    alignItems: "flex-end",
  },
  busBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  seatsAvailable: {
    color: GREEN,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  amenities: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 5,
  },
  priceBlock: {
    alignItems: "flex-end",
  },
  price: {
    color: DARK,
    fontSize: TextSize.heading,
    fontWeight: FontWeight.extraBold,
  },
  perPerson: {
    color: MUTED,
    fontSize: TextSize.micro,
    marginTop: 2,
  },
  viewButton: {
    backgroundColor: GREEN,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  viewButtonArrow: {
    color: YELLOW,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyIcon: {
    fontSize: TextSize.hero,
    marginBottom: 8,
  },
  emptyTitle: {
    color: DARK,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  emptySubtitle: {
    color: MUTED,
    fontSize: TextSize.micro,
    textAlign: "center",
    marginTop: 7,
  },
  resetButton: {
    backgroundColor: GREEN,
    borderRadius: 7,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 14,
  },
  resetText: {
    color: "#FFFFFF",
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 23,
    paddingHorizontal: 12,
  },
  footerLogo: {
    color: GREEN,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
  },
  footerTitle: {
    color: DARK,
    fontSize: TextSize.caption,
    fontWeight: FontWeight.extraBold,
    marginTop: 10,
  },
  footerText: {
    color: MUTED,
    fontSize: TextSize.micro,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 16,
  },
  footerNote: {
    color: "#9AA49C",
    fontSize: TextSize.micro,
    marginTop: 9,
  },
});
