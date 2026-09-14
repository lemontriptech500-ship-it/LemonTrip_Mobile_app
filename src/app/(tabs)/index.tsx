import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationsRow}>
          {destinations.map((dest) => (
            <View key={dest.id} style={styles.destinationCard}>
              <Image source={{ uri: dest.image }} style={styles.destinationImage} />
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{dest.name}</Text>
                <Text style={styles.destinationPrice}>From {dest.priceFrom}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 24 }} />
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  destinationsRow: {
    paddingHorizontal: 16,
    gap: 12,
  },
  destinationCard: {
    width: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  destinationImage: {
    width: '100%',
    height: 110,
  },
  destinationInfo: {
    padding: 10,
  },
  destinationName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 2,
  },
  destinationPrice: {
    fontSize: 12,
    color: Colors.textLight,
  },
});