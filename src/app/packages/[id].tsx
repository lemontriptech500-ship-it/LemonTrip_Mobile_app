import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
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
            <Text style={styles.rating}>{pkg.rating}</Text>
          </View>
          <Text style={styles.title}>{pkg.title}</Text>
          <Text style={styles.price}>From {pkg.price}</Text>

          <Text style={styles.description}>{pkg.description}</Text>

          <Text style={styles.highlightsTitle}>Package Highlights</Text>
          <View style={styles.highlightsList}>
            {pkg.highlights.map((h, index) => (
              <View key={index} style={styles.highlightRow}>
                <Text style={styles.checkmark}>✓</Text>
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
          <Text style={styles.bookButtonText}>{booked ? 'Booked ✓' : 'Book This Package'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  notFound: { textAlign: 'center', marginTop: 40, color: Colors.textLight },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 260 },
  backButton: { position: 'absolute', top: 16, left: 16, backgroundColor: Colors.white, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  backButtonText: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 },
  badge: { position: 'absolute', top: 16, right: 16, backgroundColor: Colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: Colors.primaryDark },
  content: { padding: 20 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  duration: { fontSize: 13, color: Colors.textLight },
  rating: { fontSize: 13, color: Colors.textLight, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textDark, marginBottom: 6 },
  price: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 16 },
  description: { fontSize: 14, color: Colors.textLight, lineHeight: 20, marginBottom: 20 },
  highlightsTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textDark, marginBottom: 10 },
  highlightsList: { gap: 8 },
  highlightRow: { flexDirection: 'row', alignItems: 'center' },
  checkmark: { color: Colors.success, fontWeight: 'bold', marginRight: 8 },
  highlightText: { fontSize: 14, color: Colors.textDark },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  bookButton: { backgroundColor: Colors.accent, borderRadius: 10, paddingVertical: 15, alignItems: 'center' },
  bookedButton: { backgroundColor: Colors.success },
  bookButtonText: { color: Colors.primaryDark, fontSize: 16, fontWeight: 'bold' },
});