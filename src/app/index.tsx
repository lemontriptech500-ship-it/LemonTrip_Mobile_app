import { LemonTripBrand } from '@/components/BrandGradientBar';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { eyebrow: 'INDIA’S CURATED TRAVEL COMPANY', title: 'Unforgettable Journeys,', accent: 'Handpicked for You.', description: 'Thoughtful escapes, transparent prices and a travel expert beside you—every step of the way.', image: require('../../assets/images/onboarding-alps.jpg'), caption: 'THE SWISS ALPS · YOUR NEXT ESCAPE', icon: 'airplane-outline' as const },
    { eyebrow: 'ONE APP. ENDLESS POSSIBILITIES.', title: 'Your whole journey,', accent: 'Beautifully together.', description: 'Find flights, stays, road journeys, rail adventures, holidays and visa assistance—all in one place.', image: require('../../assets/images/onboarding-islands.jpg'), caption: 'ISLAND ESCAPES · MADE FOR YOU', icon: 'compass-outline' as const },
    { eyebrow: 'TRAVEL WITH CONFIDENCE', title: 'Less to worry about,', accent: 'More to look forward to.', description: 'Keep your trips close, save your favourites, and reach our travel team whenever you need a little help.', image: require('../../assets/images/onboarding-bali.jpg'), caption: 'SOMEWHERE NEW · SOMETHING WONDERFUL', icon: 'heart-outline' as const },
  ];
  const current = slides[slide];
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('lemontrip-onboarded').then(value => {
      if (!active) return;
      if (value) router.replace('/(tabs)');
      else setReady(true);
    }).catch(() => { if (active) setReady(true); }).finally(() => { void SplashScreen.hideAsync(); });
    return () => { active = false; };
  }, []);
  const enter = async () => {
    try { await AsyncStorage.setItem('lemontrip-onboarded', 'true'); } catch { /* Navigation remains available if storage is unavailable. */ }
    router.replace('/(tabs)');
  };
  if (!ready) return <View style={{ flex: 1, backgroundColor: Colors.primaryDark, alignItems: 'center', justifyContent: 'center' }}><LemonTripBrand size={72} /></View>;
  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <View style={styles.brand}><LemonTripBrand size={70} /><Text style={styles.language}>EN</Text></View>
    <ImageBackground source={current.image} style={styles.hero} imageStyle={styles.heroImage}><View style={styles.shade} /><Ionicons name={current.icon} size={65} color={Colors.white} /><Text style={styles.caption}>{current.caption}</Text></ImageBackground>
    <Text style={styles.eyebrow}>{current.eyebrow}</Text>
    <Text style={styles.title}>{current.title}{'\n'}<Text style={{ color: Colors.accent }}>{current.accent}</Text></Text>
    <Text style={styles.description}>{current.description}</Text>
    <View style={styles.promises}>{['Clear prices', 'Travel support', 'Custom trips'].map(label => <View key={label} style={styles.pill}><Ionicons name="checkmark" color={Colors.white} size={12} /><Text style={styles.pillText}>{label}</Text></View>)}</View>
    <View style={{ flex: 1, minHeight: 30 }} />
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 18 }}>{slides.map((_, index) => <TouchableOpacity key={index} accessibilityRole="button" accessibilityLabel={`Onboarding ${index + 1}`} accessibilityState={{ selected: slide === index }} onPress={() => setSlide(index)} style={{ width: slide === index ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: slide === index ? Colors.accent : Colors.borderOnDark, paddingVertical: 8 }} />)}</View><TouchableOpacity accessibilityRole="button" style={styles.cta} onPress={() => slide < 2 ? setSlide(slide + 1) : void enter()}><Text style={styles.ctaText}>{slide < 2 ? "Next: your journey" : "Explore Handpicked Packages"}</Text><Ionicons name="arrow-forward" size={20} color={Colors.primaryDark} /></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" style={styles.signin} onPress={() => router.push('/login')}><Text style={styles.signinText}>Already a LemonTrip traveler? <Text style={{ color: Colors.white, fontWeight: '800' }}>Sign in</Text></Text></TouchableOpacity>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primaryDark }, page: { flexGrow: 1, padding: 24, width: '100%', maxWidth: 520, alignSelf: 'center' }, brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 }, language: { color: Colors.white, fontFamily: 'Manrope', fontSize: 10, borderWidth: 1, borderColor: Colors.borderOnDark, borderRadius: 20, padding: 10 }, hero: { height: 300, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 150, borderTopRightRadius: 150, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', backgroundColor: Colors.primary }, heroImage: { borderTopLeftRadius: 150, borderTopRightRadius: 150 }, shade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.imageOverlay }, caption: { position: 'absolute', bottom: 20, left: 20, fontFamily: 'Manrope', color: Colors.white, fontSize: 9, letterSpacing: 1 }, eyebrow: { fontFamily: 'Manrope', color: Colors.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 24 }, title: { fontFamily: 'Manrope', color: Colors.white, fontSize: 29, lineHeight: 36, fontWeight: '800', marginTop: 12 }, description: { fontFamily: 'Manrope', color: Colors.onDarkMuted, fontSize: 13, lineHeight: 21, marginTop: 12 }, promises: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 }, pill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.borderOnDark, borderRadius: 20, padding: 8 }, pillText: { fontFamily: 'Manrope', fontSize: 9, color: Colors.white }, cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Colors.accent, borderRadius: 18, minHeight: 58, padding: 12 }, ctaText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primaryDark }, signin: { alignItems: 'center', paddingTop: 18 }, signinText: { fontFamily: 'Manrope', fontSize: 11, color: Colors.onDarkMuted },
});
