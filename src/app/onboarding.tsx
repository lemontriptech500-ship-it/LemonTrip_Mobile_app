import { Brand, Radius } from '@/constants/colors';
import {
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AppRoute = Parameters<typeof router.replace>[0];

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1596229898948-1fd2d1bd0273?w=1000';

const perks = [
  { icon: 'checkmark', label: 'Best Price' },
  { icon: 'call-outline', label: '24/7 Assist' },
  { icon: 'sparkles-outline', label: 'Custom Trips' },
] as const;

async function leave(path: AppRoute) {
  await AsyncStorage.setItem('onboardingSeen', '1');
  router.replace(path);
}

export default function OnboardingScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.brandText}>LemonTrip</Text>
        </View>
        <View style={styles.langPill}>
          <Text style={styles.langText}>EN</Text>
        </View>
      </View>

      {/* Hero image (arch shape) */}
      <View style={styles.hero}>
        <Image source={HERO_IMAGE} contentFit="cover" style={StyleSheet.absoluteFill} />
        <View style={styles.heroShade} />
        <View style={styles.planeWrap}>
          <Ionicons name="airplane" size={64} color="#FFFFFF" />
        </View>
        <View style={styles.captionRow}>
          <Text style={styles.captionTitle}>THE SWISS ALPS</Text>
          <Text style={styles.captionCoord}>46.8182° N</Text>
        </View>
      </View>

      {/* Text block */}
      <Text style={styles.eyebrow}>INDIA'S CURATED TRAVEL COMPANY</Text>
      <Text style={styles.heading}>
        Unforgettable Journeys,{'\n'}
        <Text style={styles.headingAccent}>Handpicked for You.</Text>
      </Text>
      <Text style={styles.subtext}>
        Thoughtful escapes, transparent prices and a travel expert beside you—every step of the way.
      </Text>

      {/* Perk chips */}
      <View style={styles.chipRow}>
        {perks.map((p) => (
          <View key={p.label} style={styles.chip}>
            <Ionicons name={p.icon} size={12} color="#FFFFFF" />
            <Text style={styles.chipText}>{p.label}</Text>
          </View>
        ))}
      </View>

      {/* Dots */}
      <View style={styles.dots}>
        <View style={styles.dotActive} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      {/* CTA */}
      <Pressable
        accessibilityRole="button"
        onPress={() => leave('/(tabs)')}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.ctaText}>Explore Handpicked Packages</Text>
        <Ionicons name="arrow-forward" size={20} color={Brand.forest} />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => leave('/login')} hitSlop={8}>
        <Text style={styles.signInText}>
          Already a LemonTrip traveler? <Text style={styles.signInBold}>Sign In</Text>
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Brand.forest, paddingHorizontal: 24, paddingBottom: 12 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Brand.lemon,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: Brand.forest },
  brandText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: '#FFFFFF' },
  langPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
  },
  langText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12, color: '#FFFFFF' },

  hero: {
    flex: 1, minHeight: 180, marginTop: 20, overflow: 'hidden',
    borderTopLeftRadius: 140, borderTopRightRadius: 140,
    borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg,
  },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  planeWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  captionRow: { position: 'absolute', left: 24, bottom: 18, flexDirection: 'row', gap: 12 },
  captionTitle: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11, letterSpacing: 1.5, color: '#FFFFFF' },
  captionCoord: { fontFamily: 'PlusJakartaSans_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  eyebrow: {
    marginTop: 22, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 11,
    letterSpacing: 2, color: Brand.lemon,
  },
  heading: { marginTop: 8, fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, lineHeight: 38, color: '#FFFFFF' },
  headingAccent: { color: Brand.lemon },
  subtext: {
    marginTop: 10, fontFamily: 'PlusJakartaSans_500Medium', fontSize: 14, lineHeight: 21,
    color: 'rgba(255,255,255,0.78)',
  },

  chipRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  chipText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 10, color: '#FFFFFF' },

  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  dotActive: { width: 36, height: 5, borderRadius: 3, backgroundColor: Brand.lemon },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },

  cta: {
    marginTop: 16, height: 58, borderRadius: Radius.lg, backgroundColor: Brand.lemon,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  ctaText: { fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 16, color: Brand.forest },
  signInText: {
    marginTop: 14, textAlign: 'center', fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13, color: 'rgba(255,255,255,0.8)',
  },
  signInBold: { fontFamily: 'PlusJakartaSans_800ExtraBold', color: '#FFFFFF' },
});