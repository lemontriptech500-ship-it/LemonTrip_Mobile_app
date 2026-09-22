import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { travelPackages } from '@/data/packages';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const features = [
  { title: 'Handpicked Hotels', subtitle: 'Quality stays across the globe' },
  { title: 'Best Price Guarantee', subtitle: 'Great deals on every booking' },
  { title: 'Exclusive Packages', subtitle: 'Curated experiences for you' },
  { title: 'Easy Bookings', subtitle: 'Book in minutes with ease' },
  { title: '24/7 Support', subtitle: 'We are here for you always' },
];

export default function HomeScreen() {
  useWishlist();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>LEMON TRIP</Text>
          <Text style={styles.logoTag}>Travel • Tourism • Technology</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Travel Beyond{'\n'}Expectations.</Text>
          <Text style={styles.heroSubtitle}>
            Discover the world with reliable travel solutions, curated experiences and technology-driven service.
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

        <View style={styles.whySection}>
          <Text style={styles.whyEyebrow}>WHY LEMON TRIP</Text>
          <Text style={styles.whyTitle}>Your Journey.{'\n'}Our Responsibility.</Text>
          <View style={styles.whyList}>
            <View style={styles.whyItem}>
              <Text style={styles.whyIcon}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyItemTitle}>Professional Travel Assistance</Text>
                <Text style={styles.whyItemSubtitle}>Support from planning to the completion of your journey.</Text>
              </View>
            </View>
            <View style={styles.whyItem}>
              <Text style={styles.whyIcon}>⚡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyItemTitle}>Technology-Driven Experience</Text>
                <Text style={styles.whyItemSubtitle}>A modern platform built for speed, clarity and convenience.</Text>
              </View>
            </View>
            <View style={styles.whyItem}>
              <Text style={styles.whyIcon}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.whyItemTitle}>Customer-First Service</Text>
                <Text style={styles.whyItemSubtitle}>Transparent communication and long-term relationships.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Experiences</Text>
        </View>

        <View style={styles.packagesSection}>
          {travelPackages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={styles.packageCard}
              onPress={() => router.push(`/packages/${pkg.id}`)}>
              <View>
                <Image source={{ uri: pkg.image }} style={styles.packageImage} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pkg.badge}</Text>
                </View>
              </View>
              <View style={styles.packageInfo}>
                <Text style={styles.packageTitle}>{pkg.title}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.packageDuration}>{pkg.duration}</Text>
                  <Text style={styles.packageRating}>{pkg.rating}</Text>
                </View>
                <Text style={styles.packagePrice}>From {pkg.price}</Text>
              </View>
            </TouchableOpacity>
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
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1 },
  header: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 20 },
  logoText: { color: Colors.accent, fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  logoTag: { color: Colors.white, fontSize: 11, marginTop: 2 },
  hero: { backgroundColor: Colors.primaryDark, padding: 24 },
  heroTitle: { color: Colors.accent, fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  heroSubtitle: { color: Colors.white, fontSize: 15, lineHeight: 22 },
  featuresSection: { padding: 16, gap: 12 },
  featureCard: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16 },
  featureTitle: { color: Colors.textDark, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  featureSubtitle: { color: Colors.textLight, fontSize: 13 },
  offersButton: { marginHorizontal: 16, marginBottom: 20, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  offersButtonText: { color: Colors.primaryDark, fontSize: 15, fontWeight: 'bold' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: 'bold', color: Colors.textDark },
  destinationsRow: { paddingHorizontal: 16, gap: 12 },
  destinationCard: { width: 160, borderRadius: 12, overflow: 'hidden', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  destinationImage: { width: '100%', height: 110 },
  heartButton: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.white, borderRadius: 16, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  heartIcon: { fontSize: 15 },
  destinationInfo: { padding: 10 },
  destinationName: { fontSize: 15, fontWeight: 'bold', color: Colors.textDark, marginBottom: 2 },
  destinationPrice: { fontSize: 12, color: Colors.textLight },
  whySection: { padding: 16, backgroundColor: Colors.accentSoft, marginHorizontal: 16, borderRadius: 16, marginTop: 20, marginBottom: 8 },
  whyEyebrow: { fontSize: 11, fontWeight: 'bold', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  whyTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textDark, marginBottom: 16 },
  whyList: { gap: 14 },
  whyItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  whyIcon: { fontSize: 20, width: 28 },
  whyItemTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textDark, marginBottom: 2 },
  whyItemSubtitle: { fontSize: 12, color: Colors.textLight, lineHeight: 16 },
  packagesSection: { paddingHorizontal: 16, gap: 14 },
  packageCard: { borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  packageImage: { width: '100%', height: 160 },
  badge: { position: 'absolute', top: 14, left: 14, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: Colors.primaryDark },
  packageInfo: { padding: 14 },
  packageTitle: { fontSize: 17, fontWeight: 'bold', color: Colors.textDark, marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  packageDuration: { fontSize: 12, color: Colors.textLight },
  packageRating: { fontSize: 12, color: Colors.textLight },
  packagePrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  blogButton: { marginHorizontal: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  blogButtonText: { color: Colors.primary, fontSize: 15, fontWeight: 'bold' },
});