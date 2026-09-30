import { Colors } from '@/constants/colors';
import { destinations } from '@/data/destinations';
import { travelPackages } from '@/data/packages';
import { isInWishlist, toggleWishlist, useWishlist } from '@/utils/wishlistStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const services = [
  { label: 'Flights', icon: 'airplane-outline' as const, route: '/(tabs)/explore' },
  { label: 'Stays', icon: 'bed-outline' as const, route: '/(tabs)/explore/hotels' },
  { label: 'Packages', icon: 'map-outline' as const, route: '/packages' },
  { label: 'Visa', icon: 'document-text-outline' as const, route: '/(tabs)/explore/visa' },
];

const quickServices = [
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'explore', label: 'Explore', icon: '🔎' },
  { id: 'packages', label: 'Packages', icon: '🧳' },
  { id: 'visa', label: 'Visa', icon: '🛂' },
];

const whyPoints = [
  {
    icon: '✓',
    title: 'Professional Travel Assistance',
    subtitle: 'Support from planning to the completion of your journey.',
  },
  {
    icon: '⚡',
    title: 'Technology-Driven Experience',
    subtitle: 'A modern platform built for speed, clarity and convenience.',
  },
  {
    icon: '🤝',
    title: 'Customer-First Service',
    subtitle: 'Transparent communication and long-term relationships.',
  },
];

export default function HomeScreen() {
  useWishlist();
  const [activeService, setActiveService] = useState('flights');

  const handleServicePress = (id: string) => {
    setActiveService(id);

    if (id === 'visa') {
      router.push('/(tabs)/explore/visa');
      return;
    }

    if (id === 'hotels') {
      router.push('/(tabs)/explore/hotels');
      return;
    }

    if (id === 'packages') {
      router.push('/packages');
      return;
    }

    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.brand}>LEMON TRIP</Text>
            <Text style={styles.brandLine}>Travel, thoughtfully planned</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={() => router.push('/(tabs)/profile')}
            style={styles.profileButton}>
            <Ionicons name="person-outline" size={20} color={Colors.primaryDark} />
          </TouchableOpacity>
        </View>

        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=88' }}
          style={styles.hero}
          imageStyle={styles.heroImage}>
          <View style={styles.heroShade} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>MAKE ROOM FOR SOMEWHERE NEW</Text>
            <Text style={styles.heroTitle}>The world,{"\n"}a little closer.</Text>
            <Text style={styles.heroSubtitle}>Find the place that feels like your next story.</Text>
            <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.heroButtonText}>Explore journeys</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.eyebrow}>PLAN YOUR WAY</Text>
              <Text style={styles.sectionTitle}>Where to next?</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.textLink}>All services</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickServiceRow}>
            {quickServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.quickServiceItem, activeService === service.id && styles.quickServiceItemActive]}
                onPress={() => handleServicePress(service.id)}>
                <Text style={styles.quickServiceIcon}>{service.icon}</Text>
                <Text style={[styles.quickServiceLabel, activeService === service.id && styles.quickServiceLabelActive]}>
                  {service.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.eyebrow}>A GOOD PLACE TO START</Text>
              <Text style={styles.sectionTitle}>Popular destinations</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
              <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRow}>
            {destinations.map((destination) => {
              const saved = isInWishlist(destination.id);
              return (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.destinationItem}
                  onPress={() => router.push('/(tabs)/explore')}>
                  <Image source={{ uri: destination.image }} style={styles.destinationImage} />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={saved ? `Remove ${destination.name} from saved places` : `Save ${destination.name}`}
                    style={styles.saveButton}
                    onPress={() =>
                      toggleWishlist({
                        id: destination.id,
                        name: destination.name,
                        image: destination.image,
                        price: destination.priceFrom,
                      })
                    }>
                    <Ionicons name={saved ? 'heart' : 'heart-outline'} size={18} color={saved ? Colors.error : Colors.primaryDark} />
                  </TouchableOpacity>
                  <Text style={styles.destinationName} numberOfLines={1}>{destination.name}</Text>
                  <Text style={styles.destinationPrice}>From {destination.priceFrom}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.offerStrip} onPress={() => router.push('/offers')}>
          <View style={styles.offerCopy}>
            <Text style={styles.offerEyebrow}>A LITTLE MORE JOURNEY FOR LESS</Text>
            <Text style={styles.offerTitle}>Explore this season’s offers</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={30} color={Colors.accent} />
        </TouchableOpacity>

        <View style={styles.whySection}>
          <Text style={styles.whyEyebrow}>WHY LEMON TRIP</Text>
          <Text style={styles.whyTitle}>Your Journey.{"\n"}Our Responsibility.</Text>
          <View style={styles.whyList}>
            {whyPoints.map((point) => (
              <View key={point.title} style={styles.whyItem}>
                <Text style={styles.whyIcon}>{point.icon}</Text>
                <View style={styles.whyTextWrap}>
                  <Text style={styles.whyItemTitle}>{point.title}</Text>
                  <Text style={styles.whyItemSubtitle}>{point.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.eyebrow}>MADE FOR YOUR NEXT ESCAPE</Text>
              <Text style={styles.sectionTitle}>Featured journeys</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/packages')}>
              <Text style={styles.textLink}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.packageList}>
            {travelPackages.map((travelPackage) => (
              <TouchableOpacity
                key={travelPackage.id}
                style={styles.packageItem}
                onPress={() => router.push(`/packages/${travelPackage.id}`)}>
                <Image source={{ uri: travelPackage.image }} style={styles.packageImage} />
                <View style={styles.packageInfo}>
                  <Text style={styles.packageBadge}>{travelPackage.badge}</Text>
                  <Text style={styles.packageTitle} numberOfLines={2}>{travelPackage.title}</Text>
                  <Text style={styles.packageMeta}>{travelPackage.duration} · {travelPackage.rating}</Text>
                  <Text style={styles.packagePrice}>From {travelPackage.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.journalLink} onPress={() => router.push('/blog')}>
          <View>
            <Text style={styles.eyebrow}>THE LEMON TRIP JOURNAL</Text>
            <Text style={styles.journalTitle}>Stories for the road</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 36 },
  topBar: { minHeight: 76, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900' },
  brandLine: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 1 },
  profileButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  hero: { height: 385, justifyContent: 'flex-end', marginHorizontal: 14, overflow: 'hidden', borderRadius: 18 },
  heroImage: { borderRadius: 18 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4, 31, 19, 0.42)' },
  heroCopy: { paddingHorizontal: 24, paddingBottom: 26, paddingTop: 52 },
  heroEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  heroTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 38, fontWeight: '800', lineHeight: 44, marginTop: 9 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, marginTop: 10, maxWidth: 270 },
  heroButton: { alignSelf: 'flex-start', minHeight: 46, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.accent, marginTop: 20 },
  heroButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  section: { marginTop: 31 },
  sectionHeading: { paddingHorizontal: 22, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 20, fontWeight: '800', marginTop: 4 },
  textLink: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', paddingBottom: 3 },
  quickServiceRow: { paddingHorizontal: 18, gap: 10 },
  quickServiceItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceMuted,
    minWidth: 76,
  },
  quickServiceItemActive: { backgroundColor: Colors.primary },
  quickServiceIcon: { fontSize: 20, marginBottom: 4 },
  quickServiceLabel: { fontSize: 11, color: Colors.textDark, fontWeight: '600' },
  quickServiceLabelActive: { color: Colors.white },
  destinationRow: { paddingHorizontal: 22, gap: 13 },
  destinationItem: { width: 190 },
  destinationImage: { width: 190, height: 128, backgroundColor: Colors.surfaceMuted },
  saveButton: { position: 'absolute', top: 9, right: 9, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white },
  destinationName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginTop: 9 },
  destinationPrice: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, marginTop: 2 },
  offerStrip: { minHeight: 92, marginHorizontal: 22, marginTop: 34, paddingHorizontal: 18, backgroundColor: Colors.primaryDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16 },
  offerCopy: { flex: 1, paddingRight: 12 },
  offerEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800' },
  offerTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 5 },
  whySection: { padding: 16, backgroundColor: Colors.accentSoft, marginHorizontal: 16, borderRadius: 16, marginTop: 20, marginBottom: 8 },
  whyEyebrow: { fontSize: 11, fontWeight: 'bold', color: Colors.primary, letterSpacing: 1, marginBottom: 8 },
  whyTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.textDark, marginBottom: 16 },
  whyList: { gap: 14 },
  whyItem: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  whyIcon: { fontSize: 20, width: 28 },
  whyTextWrap: { flex: 1 },
  whyItemTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textDark, marginBottom: 2 },
  whyItemSubtitle: { fontSize: 12, color: Colors.textLight, lineHeight: 16 },
  packageList: { paddingHorizontal: 22, gap: 15 },
  packageItem: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
  packageImage: { width: 96, height: 88, backgroundColor: Colors.surfaceMuted },
  packageInfo: { flex: 1 },
  packageBadge: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  packageTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', marginTop: 3 },
  packageMeta: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 10, marginTop: 4 },
  packagePrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', marginTop: 4 },
  journalLink: { minHeight: 78, marginHorizontal: 22, marginTop: 30, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  journalTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', marginTop: 4 },
});
