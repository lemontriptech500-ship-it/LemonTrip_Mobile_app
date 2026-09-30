import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { travelPackages } from '@/data/packages';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const features = [
  { title: 'Handpicked Hotels', subtitle: 'Quality stays across the globe' },
  { title: 'Best Price Guarantee', subtitle: 'Great deals on every booking' },
  { title: 'Exclusive Packages', subtitle: 'Curated experiences for you' },
  { title: 'Easy Bookings', subtitle: 'Book in minutes with ease' },
  { title: '24/7 Support', subtitle: 'We are here for you always' },
];

const quickServices = [
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'buses', label: 'Buses', icon: '🚌' },
  { id: 'trains', label: 'Trains', icon: '🚆' },
  { id: 'packages', label: 'Packages', icon: '🧳' },
  { id: 'visa', label: 'Visa', icon: '🛂' },
];

export default function HomeScreen() {
  useWishlist();
  const [activeService, setActiveService] = useState('flights');

  const handleServicePress = (id: string) => {
    setActiveService(id);
    if (id === 'visa') {
      router.push('/(tabs)/explore/visa');
    } else if (id === 'hotels') {
      router.push('/(tabs)/explore/hotels');
    } else if (id === 'packages') {
      router.push('/packages');
    } else {
      router.push(`/(tabs)/explore/${id}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Text style={styles.logoEmoji}>🍋</Text>
            <View>
              <Text style={styles.logoText}>LemonTrip</Text>
              <Text style={styles.logoTag}>Travel Smarter. Travel Better.</Text>
            </View>
          </View>
        </View>

        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80' }}
          style={styles.hero}
          imageStyle={{ opacity: 0.85 }}>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Book your{'\n'}journey.</Text>
            <Text style={styles.heroSubtitle}>
              Flights, hotels, buses, trains, holiday packages and visas — all in one place.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.searchCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {quickServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.tabItem, activeService === service.id && styles.tabItemActive]}
                onPress={() => handleServicePress(service.id)}>
                <Text style={styles.tabIcon}>{service.icon}</Text>
                <Text style={[styles.tabLabel, activeService === service.id && styles.tabLabelActive]}>
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.searchHint}>Tap a service above to search & book</Text>
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
  header: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoEmoji: { fontSize: 28 },
  logoText: { color: Colors.accent, fontSize: 20, fontWeight: 'bold', letterSpacing: 0.5 },
  logoTag: { color: Colors.white, fontSize: 10, marginTop: 1 },
  hero: { minHeight: 240, justifyContent: 'flex-end' },
  heroOverlay: { backgroundColor: 'rgba(6, 59, 36, 0.75)', padding: 24, paddingBottom: 36 },
  heroTitle: { color: Colors.white, fontSize: 34, fontWeight: '300', fontStyle: 'italic', marginBottom: 12, lineHeight: 40 },
  heroSubtitle: { color: Colors.white, fontSize: 14, lineHeight: 20 },
  searchCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  tabsRow: { gap: 10, paddingBottom: 4 },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    minWidth: 72,
  },
  tabItemActive: { backgroundColor: Colors.primary },
  tabIcon: { fontSize: 20, marginBottom: 4 },
  tabLabel: { fontSize: 11, color: Colors.textDark, fontWeight: '600' },
  tabLabelActive: { color: Colors.accent },
  searchHint: { fontSize: 12, color: Colors.textLight, marginTop: 10, textAlign: 'center' },
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
