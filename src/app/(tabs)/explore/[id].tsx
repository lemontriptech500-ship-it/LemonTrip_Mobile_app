import { Colors } from '@/constants/colors';
import { dummyListings, services } from '@/data/services';
import { addBooking } from '@/utils/bookingStore';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = services.find((s) => s.id === id);
  const listings = dummyListings[id ?? ''] ?? [];
  const [bookedIds, setBookedIds] = useState<string[]>([]);

  const handleBook = (listingId: string, name: string, price: string) => {
    addBooking({
      id: `${id}-${listingId}-${Date.now()}`,
      serviceName: service?.title ?? '',
      itemName: name,
      price,
      bookedAt: new Date().toLocaleDateString(),
    });
    setBookedIds((prev) => [...prev, listingId]);
    Alert.alert('Booked!', `${name} has been added to your bookings.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service?.title ?? 'Listings'}</Text>
        <Text style={styles.headerSubtitle}>{service?.subtitle}</Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isBooked = bookedIds.includes(item.id);
          return (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDetail}>{item.detail}</Text>
                <Text style={styles.cardPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity
                style={[styles.bookButton, isBooked && styles.bookedButton]}
                disabled={isBooked}
                onPress={() => handleBook(item.id, item.name, item.price)}>
                <Text style={[styles.bookButtonText, isBooked && styles.bookedButtonText]}>
                  {isBooked ? 'Booked ✓' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No listings available right now.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backArrow: {
    color: Colors.accent,
    fontSize: 14,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 13,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bookedButton: {
    backgroundColor: Colors.success,
  },
  bookButtonText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookedButtonText: {
    color: Colors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: 40,
  },
});