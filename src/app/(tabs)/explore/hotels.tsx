import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
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
      <ScreenHeader title="Stays worth the journey" subtitle="Handpicked places to feel at home." eyebrow="LEMON TRIP / STAYS" onBack={handleBack} />

      <ScrollView contentContainerStyle={styles.list}>
        {hotels.map((hotel) => {
          const isBooked = bookedIds.includes(hotel.id);
          return (
            <View key={hotel.id} style={styles.card}>
              <Image source={{ uri: hotel.image }} style={styles.image} />
              <View style={styles.cardBody}>
                <View style={styles.topRow}>
                  <Text style={styles.name}>{hotel.name}</Text>
                  <View style={styles.rating}><Ionicons name="star" size={12} color={Colors.primary} /><Text style={styles.ratingText}>{hotel.rating}</Text></View>
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
                      {isBooked ? 'Booked' : 'Book now'}
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
  list: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 20,
  },
  card: {
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  image: {
    width: '100%',
    height: 190,
  },
  cardBody: {
    paddingTop: 13,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    flex: 1,
  },
  rating: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  location: {
    fontFamily: 'Manrope',
    fontSize: 10,
    color: Colors.textLight,
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Manrope',
    fontSize: 11,
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
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  amenityText: {
    fontFamily: 'Manrope',
    fontSize: 9,
    color: Colors.textDark,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    borderRadius: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bookedButton: {
    backgroundColor: Colors.success,
  },
  bookButtonText: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontWeight: '800',
    fontSize: 11,
  },
  bookedButtonText: {
    color: Colors.white,
  },
  ratingText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
});