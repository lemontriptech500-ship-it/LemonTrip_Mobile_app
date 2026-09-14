import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const features = [
  { title: 'Best Price', subtitle: 'Guaranteed deals on every booking' },
  { title: 'Easy Bookings', subtitle: 'Book in minutes with ease' },
  { title: '24/7 Support', subtitle: 'We are here for you always' },
  { title: 'Exclusive Packages', subtitle: 'Curated experiences just for you' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>LemonTrip</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Travel Smarter.{'\n'}Travel Better.</Text>
          <Text style={styles.heroSubtitle}>
            Book flights, hotels, buses, trains and packages — all in one place.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          {features.map((item, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  logoText: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
  },
  hero: {
    backgroundColor: Colors.primaryDark,
    padding: 24,
  },
  heroTitle: {
    color: Colors.accent,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  heroSubtitle: {
    color: Colors.white,
    fontSize: 15,
    lineHeight: 22,
  },
  featuresSection: {
    padding: 16,
    gap: 12,
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  featureTitle: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureSubtitle: {
    color: Colors.textLight,
    fontSize: 13,
  },
});