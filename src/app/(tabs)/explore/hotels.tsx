import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { hotels } from '@/data/hotels';
import { addBooking } from '@/utils/bookingStore';
import { useState } from 'react';

export default function HotelsScreen() {
  const [bookedIds, setBookedIds] = useState<string[]>([]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  const handleBook = (hotelId: string, name: string, price: string) => {
    addBooking({
      id: `hotel-${hotelId}-${Date.now()}`,
      serviceName: 'Hotels',
      itemName: name,
      price,
      bookedAt: new Date().toLocaleDateString(),
    });
    setBookedIds((prev) => [...prev, hotelId]);
    Alert.alert('Booked!', `${name} has been added to your bookings.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hotels</Text>
        <Text style={styles.headerSubtitle}>Handpicked stays across the globe</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {hotels.map((hotel) => {
          const isBooked = bookedIds.includes(hotel.id);
          return (
            <View key={hotel.id} style={styles.card}>
              <Image source={{ uri: hotel.image }} style={styles.image} />
              <View style={styles.cardBody}>
                <View style={styles.topRow}>
                  <Text style={styles.name}>{hotel.name}</Text>
                  <Text style={styles.rating}>{hotel.rating}</Text>
                </View>
                <Text style={styles.location}>{hotel.location}</Text>
                <Text style={styles.description}>{hotel.description}</Text>

                <View style={styles.amenitiesRow}>
                  {hotel.amenities.slice(0, 3).map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.price}>{hotel.price}</Text>
                  <TouchableOpacity
                    style={[styles.bookButton, isBooked && styles.bookedButton]}
                    disabled={isBooked}
                    onPress={() => handleBook(hotel.id, hotel.name, hotel.price)}>
                    <Text style={[styles.bookButtonText, isBooked && styles.bookedButtonText]}>
                      {isBooked ? 'Booked ✓' : 'Book Now'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 160,
  },
  cardBody: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    flex: 1,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  location: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 10,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  amenityText: {
    fontSize: 11,
    color: Colors.textDark,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bookedButton: {
    backgroundColor: Colors.success,
  },
  bookButtonText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 13,
  },
  bookedButtonText: {
    color: Colors.white,
  },
});