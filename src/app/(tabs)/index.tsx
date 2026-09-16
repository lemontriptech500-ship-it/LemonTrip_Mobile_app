import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { travelPackages } from '@/data/packages';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const features = [
  { title: 'Best Price', subtitle: 'Guaranteed deals on every booking' },
  { title: 'Easy Bookings', subtitle: 'Book in minutes with ease' },
  { title: '24/7 Support', subtitle: 'We are here for you always' },
  { title: 'Exclusive Packages', subtitle: 'Curated experiences just for you' },
];

export default function HomeScreen() {
  useWishlist();

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

        <TouchableOpacity style={styles.offersButton} onPress={() => router.push('/offers')}>
          <Text style={styles.offersButtonText}>🎁 View Exclusive Offers</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationsRow}>
          {destinations.map((dest) => {
            const saved = isInWishlist(dest.id);
            return (
              <View key={dest.id} style={styles.destinationCard}>
                <Image source={{ uri: dest.image }} style={styles.destinationImage} />
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() =>
                    toggleWishlist({
                      id: dest.id,
                      name: dest.name,
                      image: dest.image,
                      price: dest.priceFrom,
                    })
                  }>
                  <Text style={styles.heartIcon}>{saved ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                <View style={styles.destinationInfo}>
                  <Text style={styles.destinationName}>{dest.name}</Text>
                  <Text style={styles.destinationPrice}>From {dest.priceFrom}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Holiday Packages</Text>
        </View>

        <View style={styles.packagesSection}>
          {travelPackages.map((pkg) => (
            <View key={pkg.id} style={styles.packageCard}>
              <Image source={{ uri: pkg.image }} style={styles.packageImage} />
              <View style={styles.packageInfo}>
                <Text style={styles.packageDuration}>{pkg.duration}</Text>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <Text style={styles.packagePrice}>From {pkg.price}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Travel Inspiration</Text>
        </View>

        <TouchableOpacity style={styles.blogButton} onPress={() => router.push('/blog')}>
          <Text style={styles.blogButtonText}>📖 Read Travel Tips & Guides</Text>
        </TouchableOpacity>

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
  offersButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  offersButtonText: {
    color: Colors.primaryDark,
    fontSize: 15,
    fontWeight: 'bold',
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
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 15,
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
  packagesSection: {
    paddingHorizontal: 16,
    gap: 14,
  },
  packageCard: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packageImage: {
    width: '100%',
    height: 160,
  },
  packageInfo: {
    padding: 14,
  },
  packageDuration: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  blogButton: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  blogButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});