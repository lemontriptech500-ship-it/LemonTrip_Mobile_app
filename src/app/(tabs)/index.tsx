import { isSearch, usePersonalItems } from '@/utils/personalStore';
import { destinationIdeas } from '@/constants/destinations';
import { LemonTripBrand } from '@/components/BrandGradientBar';
import FlightSearchForm from '@/components/flights/FlightSearchForm';
import { Ui } from '@/constants/theme';
import { travelServices } from '@/constants/navigation';
import { Colors } from '@/constants/colors';
import type { BlogPost, Destination, TravelPackage } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

const shortcuts = [
  { label: 'Offers', icon: 'pricetag-outline', route: '/offers' },
  { label: 'Stories', icon: 'book-outline', route: '/blog' },
  { label: 'Trip cart', icon: 'bag-outline', route: '/cart' },
  { label: 'Services', icon: 'grid-outline', route: '/services' },
] as const;
const categories = ['All', 'Honeymoon', 'Family', 'Adventure', 'Luxury'] as const;

export default function HomeScreen() {
  const user = useAuth();
  const recent = usePersonalItems('recent-searches', isSearch);
  const { items: packages, loading } = useContentItems<TravelPackage>('package');
  const { items: destinations } = useContentItems<Destination>('destination');
  const { items: stories } = useContentItems<BlogPost>('blog');
  const visibleDestinations = destinations.length ? destinations : destinationIdeas;
  const [category, setCategory] = useState<string>('All');
  const visible = packages.filter(pkg => category === 'All' || pkg.categories?.some(item => item === category));
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <LemonTripBrand size={64} />
            <View style={{ flex: 1 }} />
            <TouchableOpacity accessibilityLabel="Notifications" accessibilityRole="button" style={styles.circle} onPress={() => router.push('/notifications')}><Ionicons name="notifications-outline" size={22} color={Colors.white} /></TouchableOpacity>
            <TouchableOpacity accessibilityLabel={user ? 'Your profile' : 'Sign in'} accessibilityRole="button" style={styles.avatar} onPress={() => router.push(user ? '/(tabs)/profile' : '/login')}><Text style={styles.initials}>{user ? user.name.split(' ').map(word => word[0]).slice(0, 2).join('') : 'Hi'}</Text></TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Travel smarter. Travel better.</Text>
        </View>
        <View style={styles.search}>
          <View style={styles.services}>{travelServices.map((service, index) => <TouchableOpacity key={service.title} accessibilityRole="button" style={[styles.service, index === 0 && styles.selected]} onPress={() => router.push(service.route)}><Ionicons name={service.icon} size={23} color={index === 0 ? Colors.primary : Colors.textLight} /><Text style={styles.serviceText}>{service.shortTitle}</Text></TouchableOpacity>)}</View>
          <FlightSearchForm compact loading={false} onSearch={request => router.push({ pathname: '/(tabs)/explore/flights', params: { search: JSON.stringify(request) } })} />
        </View>
        <View style={styles.shortcuts}>{shortcuts.map(item => <TouchableOpacity key={item.label} accessibilityRole="button" onPress={() => router.push(item.route)} style={styles.shortcut}><Ionicons name={item.icon} size={24} color={Colors.primary} /><Text style={styles.shortcutText}>{item.label}</Text></TouchableOpacity>)}</View>
        <View style={styles.section}><View style={styles.sectionRow}><Text style={styles.heading}>Pick up where you left off</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/manage/recent-searches')}><Text style={styles.link}>View all</Text></TouchableOpacity></View>{recent.items.length ? recent.items.slice(0, 2).map(item => <TouchableOpacity key={item.id} accessibilityRole="button" onPress={() => router.push('/manage/recent-searches')} style={styles.story}><Ionicons name="time-outline" size={24} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.storyTitle}>{item.label}</Text><Text style={styles.storyCategory}>{item.service}</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity>) : <Text style={styles.empty}>Your recent searches will be saved here on this device.</Text>}</View>
        <TouchableOpacity accessibilityRole="button" style={styles.offerBanner} onPress={() => router.push('/offers')}><View><Text style={styles.offerEyebrow}>A LITTLE EXTRA FOR YOUR JOURNEY</Text><Text style={styles.offerTitle}>Discover LemonTrip offers</Text></View><Ionicons name="arrow-forward" size={22} color={Colors.primary} /></TouchableOpacity>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>SOMEWHERE NEW IS WAITING</Text>
          <View style={styles.sectionRow}><Text style={styles.heading}>Popular destinations</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/destinations')}><Text style={styles.link}>Explore all</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>{visibleDestinations.slice(0, 6).map(destination => <TouchableOpacity key={destination.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/destinations/[id]', params: { id: destination.id } })}><ImageBackground source={{ uri: destination.image }} style={styles.destination} imageStyle={{ borderRadius: 24 }}><View style={styles.shade} /><View style={styles.packageCopy}><Text style={styles.packageTitle}>{destination.name}</Text><Text style={styles.packageMeta}>{destination.priceFrom}</Text></View></ImageBackground></TouchableOpacity>)}</ScrollView>
        </View>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>HANDPICKED FOR YOU</Text>
          <View style={styles.sectionRow}><Text style={styles.heading}>Featured packages</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/packages')}><Text style={styles.link}>View all</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
            {visible.slice(0, 6).map(pkg => <TouchableOpacity key={pkg.id} accessibilityRole="button" accessibilityLabel={`Explore ${pkg.title}`} onPress={() => router.push(`/packages/${pkg.id}`)}><ImageBackground source={{ uri: pkg.image }} style={styles.package} imageStyle={{ borderRadius: 20 }}><View style={styles.shade} />{pkg.badge ? <View style={styles.badge}><Text style={styles.badgeText}>{pkg.badge}</Text></View> : null}<View style={styles.packageCopy}><Text style={styles.packageTitle} numberOfLines={2}>{pkg.title}</Text><Text style={styles.packageMeta}>{pkg.duration} · From {pkg.price}</Text></View></ImageBackground></TouchableOpacity>)}
          </ScrollView>
          {!visible.length ? <Text style={styles.empty}>{loading ? 'Finding your next escape…' : 'Explore our journeys or choose another category.'}</Text> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map(item => <TouchableOpacity key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={styles.chipText}>{item}</Text></TouchableOpacity>)}</ScrollView>
        </View>
        <View style={styles.section}>
          <Text style={styles.eyebrow}>TRAVEL WITH CONFIDENCE</Text>
          <View style={styles.sectionRow}><Text style={styles.heading}>LemonTrip promises</Text><TouchableOpacity onPress={() => router.push('/help')}><Text style={styles.link}>Learn more</Text></TouchableOpacity></View>
          <TouchableOpacity accessibilityRole="button" style={styles.promise} onPress={() => router.push('/help')}><Text style={styles.yellowLabel}>TRAVELLER ASSIST</Text><Text style={styles.promiseTitle}>A real travel expert,{'\n'}whenever you need one.</Text><Text style={styles.promiseMeta}>Personal help before and during your trip</Text><Ionicons style={styles.promiseIcon} name="headset-outline" size={76} color={Colors.borderOnDark} /></TouchableOpacity>
        </View>
        <TouchableOpacity accessibilityRole="button" style={styles.visaBanner} onPress={() => router.push('/(tabs)/explore/visa')}><Ionicons name="id-card-outline" size={30} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.plannerTitle}>Global travel, simplified.</Text><Text style={styles.plannerMeta}>Visa guidance for your next destination</Text></View><Ionicons name="arrow-forward" size={20} color={Colors.primary} /></TouchableOpacity>
        <View style={styles.section}><Text style={styles.eyebrow}>THE LEMONTRIP JOURNAL</Text><View style={styles.sectionRow}><Text style={styles.heading}>Travel stories</Text><TouchableOpacity accessibilityRole="button" onPress={() => router.push('/blog')}><Text style={styles.link}>Read all</Text></TouchableOpacity></View>{stories.length ? stories.slice(0, 2).map(story => <TouchableOpacity key={story.id} accessibilityRole="button" onPress={() => router.push(`/blog/${story.id}`)} style={styles.story}><ImageBackground source={{ uri: story.image }} style={styles.storyImage} imageStyle={{ borderRadius: 16 }} /><View style={{ flex: 1 }}><Text style={styles.storyCategory}>{story.category}</Text><Text style={styles.storyTitle} numberOfLines={2}>{story.title}</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity>) : <TouchableOpacity accessibilityRole="button" style={styles.story} onPress={() => router.push('/blog')}><Ionicons name="book-outline" size={30} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.storyTitle}>Ideas for wherever you’re going</Text><Text style={styles.plannerMeta}>Explore destination guides and inspiration</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity>}</View>
        <TouchableOpacity accessibilityRole="button" style={styles.planner} onPress={() => router.push('/assistant')}><Ionicons name="sparkles-outline" size={22} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.plannerTitle}>Dream it. Let’s plan it.</Text><Text style={styles.plannerMeta}>Create a journey around you</Text></View><Ionicons name="arrow-forward" size={20} color={Colors.primary} /></TouchableOpacity>
        <TouchableOpacity style={styles.allServices} onPress={() => router.push('/services')}><Text style={styles.link}>Explore all travel services</Text><Ionicons name="arrow-forward" size={16} color={Colors.primary} /></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  shortcuts: { flexDirection: 'row', marginHorizontal: Ui.space.page, marginTop: 18, gap: 8 }, shortcut: { flex: 1, ...Ui.card, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 8 }, shortcutText: { fontFamily: 'Manrope', fontSize: 11, fontWeight: '700', color: Colors.primary },
  offerBanner: { marginHorizontal: Ui.space.page, marginTop: 18, backgroundColor: Colors.accent, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, offerEyebrow: { fontFamily: 'Manrope', fontSize: 8, letterSpacing: 1, fontWeight: '800', color: Colors.primary }, offerTitle: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', color: Colors.primary, marginTop: 6 }, destination: { width: 190, height: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: Colors.surfaceMuted },
  visaBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, ...Ui.card, padding: 18, marginHorizontal: Ui.space.page, marginTop: 22 }, story: { flexDirection: 'row', alignItems: 'center', gap: 12, ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 10, padding: 14 }, storyImage: { width: 72, height: 80 }, storyTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', lineHeight: 21, color: Colors.primary }, storyCategory: { fontFamily: 'Manrope', fontSize: 10, color: Colors.textLight, marginBottom: 5 },
  safe: { flex: 1, backgroundColor: Colors.primary }, scroll: { backgroundColor: Colors.background }, page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 24 },
  header: { backgroundColor: Colors.primaryDark, padding: 20, paddingBottom: 48, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }, headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, circle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Colors.borderOnDark, alignItems: 'center', justifyContent: 'center' }, avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }, initials: { color: Colors.primary, fontFamily: 'Manrope', fontWeight: '800' }, greeting: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 13, marginTop: 8 },
  search: { marginHorizontal: 18, marginTop: -26, borderRadius: 24, backgroundColor: Colors.surface, paddingTop: 8, shadowColor: Colors.primaryDark, shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4 }, services: { flexWrap: 'wrap', flexDirection: 'row', marginHorizontal: Ui.space.page, borderBottomWidth: 1, borderColor: Colors.border }, service: { width: '33.333%', alignItems: 'center', gap: 6, paddingVertical: 14 }, selected: { borderBottomWidth: 2, borderColor: Colors.accent }, serviceText: { fontSize: 13, fontFamily: 'Manrope', color: Colors.textLight },
  section: { marginTop: 22 }, eyebrow: { marginHorizontal: Ui.space.page, fontFamily: 'Manrope', fontSize: 10, letterSpacing: 1.5, fontWeight: '700', color: Colors.textLight }, sectionRow: { marginHorizontal: Ui.space.page, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5, marginBottom: 10 }, heading: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', color: Colors.textDark }, link: { fontFamily: 'Manrope', fontSize: 13, color: Colors.primary, fontWeight: '800' }, cards: { paddingHorizontal: Ui.space.page, gap: 12 }, package: { width: 250, height: 160, borderRadius: 20, overflow: 'hidden', backgroundColor: Colors.surfaceMuted }, shade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.imageOverlay }, packageCopy: { position: 'absolute', bottom: 14, left: 14, right: 14 }, packageTitle: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', color: Colors.white }, packageMeta: { fontFamily: 'Manrope', fontSize: 12, color: Colors.white, marginTop: 4 }, badge: { position: 'absolute', right: 10, top: 10, backgroundColor: Colors.accent, borderRadius: 16, padding: 7 }, badgeText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', color: Colors.primary }, chips: { paddingHorizontal: Ui.space.page, gap: 7, paddingTop: 12 }, chip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20 }, chipActive: { backgroundColor: Colors.accentSoft, borderColor: Colors.accent }, chipText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.primary }, empty: { fontFamily: 'Manrope', color: Colors.textLight, paddingHorizontal: 18, fontSize: 13 },
  promise: { marginHorizontal: Ui.space.page, padding: 20, backgroundColor: Colors.primary, borderRadius: Ui.radius.card, overflow: 'hidden' }, yellowLabel: { fontFamily: 'Manrope', fontSize: 10, letterSpacing: 1.2, color: Colors.accent, fontWeight: '800' }, promiseTitle: { fontFamily: 'Manrope', fontSize: 17, lineHeight: 23, fontWeight: '800', color: Colors.white, marginTop: 7 }, promiseMeta: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 12, marginTop: 7 }, promiseIcon: { position: 'absolute', bottom: -12, right: 12 }, planner: { margin: 18, marginBottom: 0, backgroundColor: Colors.accent, borderRadius: 18, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }, plannerTitle: { fontFamily: 'Manrope', color: Colors.primary, fontSize: 16, fontWeight: '800' }, plannerMeta: { fontFamily: 'Manrope', color: Colors.primary, fontSize: 12, marginTop: 3 }, allServices: { marginTop: 20, flexDirection: 'row', justifyContent: 'center', gap: 10 },
});
