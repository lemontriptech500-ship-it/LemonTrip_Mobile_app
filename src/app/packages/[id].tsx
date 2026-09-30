import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { travelPackages } from '@/data/packages';
import { addBooking } from '@/utils/bookingStore';
import { useState } from 'react';

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pkg = travelPackages.find((p) => p.id === id);
  const [booked, setBooked] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleBook = () => {
    if (!pkg) return;
    addBooking({
      id: `package-${pkg.id}-${Date.now()}`,
      serviceName: 'Holiday Package',
      itemName: pkg.title,
      price: pkg.price,
      bookedAt: new Date().toLocaleDateString(),
    });
    setBooked(true);
    Alert.alert('Booked!', `${pkg.title} has been added to your bookings.`);
  };

  if (!pkg) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.notFound}>Package not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: pkg.image }} style={styles.image} />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pkg.badge}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.duration}>{pkg.duration}</Text>
            <Text style={styles.rating}><Ionicons name="star" size={13} color={Colors.primary} /> {pkg.rating.replace(/[^0-9.]/g, '')}</Text>
          </View>
          <Text style={styles.title}>{pkg.title}</Text>
          <Text style={styles.price}>From {pkg.price}</Text>

          <Text style={styles.description}>{pkg.description}</Text>

          <Text style={styles.highlightsTitle}>Package Highlights</Text>
          <View style={styles.highlightsList}>
            {pkg.highlights.map((h, index) => (
              <View key={index} style={styles.highlightRow}>
                <Ionicons name="checkmark-circle" size={17} color={Colors.secondary} style={styles.checkmark} />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, booked && styles.bookedButton]}
          disabled={booked}
          onPress={handleBook}>
          <Text style={styles.bookButtonText}>{booked ? 'Booked' : 'Book this package'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  notFound: { textAlign: 'center', marginTop: 40, color: Colors.textLight },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 310, backgroundColor: Colors.surfaceMuted },
  backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: Colors.white, paddingVertical: 10, paddingHorizontal: 13 },
  backButtonText: { color: Colors.primary, fontFamily: 'Manrope', fontWeight: '800', fontSize: 12 },
  badge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', color: Colors.primaryDark },
  content: { paddingHorizontal: 22, paddingTop: 21, paddingBottom: 24 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  duration: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, fontFamily: 'Manrope', fontSize: 11, color: Colors.textDark, fontWeight: '800' },
  title: { fontFamily: 'Manrope', fontSize: 27, fontWeight: '800', color: Colors.textDark, marginBottom: 7 },
  price: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 17 },
  description: { fontFamily: 'Manrope', fontSize: 13, color: Colors.textLight, lineHeight: 21, marginBottom: 23 },
  highlightsTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 12 },
  highlightsList: { gap: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'center' },
  checkmark: { color: Colors.success, fontWeight: 'bold', marginRight: 8 },
  highlightText: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textDark },
  footer: { paddingHorizontal: 22, paddingVertical: 13, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  bookButton: { backgroundColor: Colors.accent, paddingVertical: 15, alignItems: 'center' },
  bookedButton: { backgroundColor: Colors.success },
  bookButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
});