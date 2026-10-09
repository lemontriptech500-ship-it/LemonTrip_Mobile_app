import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { travelServices } from '@/constants/navigation';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ServicesScreen() {
  return <AppScreen><ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <ScreenHeader title="Travel planning, made simple." subtitle="Everything in one place, from the first search to the final itinerary." eyebrow="TRAVEL SMARTER. TRAVEL BETTER." onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
    <View style={styles.catalog}>{travelServices.map(service => <TouchableOpacity key={service.title} accessibilityRole="button" accessibilityLabel={`Explore ${service.title}`} onPress={() => router.push(service.route)} style={styles.card}><ImageBackground source={{ uri: service.image }} style={styles.image}><View style={styles.shade} /><View style={styles.imageCopy}><Ionicons name={service.icon} size={24} color={Colors.accent} /><Text style={styles.title}>{service.title}</Text></View></ImageBackground><View style={styles.body}><Text style={styles.description}>{service.description}</Text><View style={styles.cta}><Text style={styles.ctaText}>Explore {service.shortTitle}</Text><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></View></View></TouchableOpacity>)}</View>
    <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/contact')} style={styles.support}><Ionicons name="headset-outline" size={25} color={Colors.primary} /><View style={{ flex: 1 }}><Text style={styles.supportTitle}>A smoother way to plan</Text><Text style={styles.description}>Clear information and support when you need it.</Text></View><Ionicons name="arrow-forward" size={18} color={Colors.primary} /></TouchableOpacity>
  </ScrollView></AppScreen>;
}
const styles = StyleSheet.create({
  page: { paddingBottom: 24, width: '100%', maxWidth: 760, alignSelf: 'center' }, catalog: { paddingHorizontal: Ui.space.page, gap: 18 }, card: { ...Ui.card, overflow: 'hidden' }, image: { height: 160, justifyContent: 'flex-end' }, shade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.imageOverlay }, imageCopy: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18 }, title: { fontFamily: 'Manrope', color: Colors.white, fontSize: 22, fontWeight: '800' }, body: { padding: 18, gap: 14 }, description: { fontFamily: 'Manrope', color: Colors.textLight, fontSize: 14, lineHeight: 22 }, cta: { ...Ui.button, backgroundColor: Colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }, ctaText: { fontFamily: 'Manrope', color: Colors.primary, fontSize: 14, fontWeight: '800' }, support: { margin: 18, padding: 18, borderRadius: 24, backgroundColor: Colors.accentSoft, flexDirection: 'row', alignItems: 'center', gap: 12 }, supportTitle: { fontFamily: 'Manrope', color: Colors.primary, fontSize: 16, fontWeight: '800', marginBottom: 4 },
});
