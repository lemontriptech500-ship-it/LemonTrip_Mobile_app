import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Colors } from '@/constants/colors';
import { travelServices } from '@/constants/navigation';
import { Ui } from '@/constants/theme';
import { InfoBanner } from '@/components/account/InfoBanner';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

const INTER = { regular: 'Inter-Regular', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const GREEN = '#103D30';

export default function ServicesScreen() {
  useAppLanguage();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  return (
    <AppScreen headerTone="light">
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={22} color={GREEN} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={styles.topTitle}>Travel services</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[styles.topBtn, styles.topBtnTint]}>
          <Ionicons name="settings-outline" size={20} color={GREEN} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <InfoBanner title="Travel planning, made simple." text="Everything in one place, from the first search to the final itinerary." />

          <View style={styles.catalog}>
            {travelServices.map((service) => (
              <TouchableOpacity key={service.title} accessibilityRole="button" accessibilityLabel={`Explore ${service.title}`} onPress={() => router.push(service.route)} activeOpacity={0.9} style={styles.card}>
                <ImageBackground source={{ uri: service.image }} style={styles.photo} resizeMode="cover" />
                <View style={styles.iconCircle}><Ionicons name={service.icon} size={22} color={GREEN} /></View>
                <View style={styles.body}>
                  <View>
                    <Text style={styles.title}>{service.title}</Text>
                    <Text style={styles.description} numberOfLines={4}>{service.description}</Text>
                  </View>
                  <View style={styles.cta}>
                    <Text style={styles.ctaText} numberOfLines={1}>Explore {service.shortTitle}</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/contact')} style={styles.support}>
            <Ionicons name="headset-outline" size={25} color={GREEN} />
            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>A smoother way to plan</Text>
              <Text style={styles.supportText}>Clear information and support when you need it.</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={GREEN} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  page: { paddingBottom: 24 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  bannerWrap: { paddingHorizontal: Ui.space.page, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2170 / 725, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: GREEN },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '62%', paddingLeft: 18 },
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.2, color: Colors.accent, marginBottom: 4 },
  bannerTitle: { fontFamily: INTER.extrabold, fontSize: 20, lineHeight: 24, color: Colors.white },
  bannerSub: { fontFamily: INTER.regular, fontSize: 12, lineHeight: 16, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  promo: { marginHorizontal: Ui.space.page, marginTop: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 18, borderRadius: 22, backgroundColor: Colors.successSoft, overflow: 'hidden' },
  promoTitle: { fontFamily: INTER.extrabold, color: GREEN, fontSize: TextSize.bodyLarge, lineHeight: 22 },
  promoText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 4 },
  promoArtBox: { width: 110, height: 92, borderRadius: 18, overflow: 'hidden' },
  promoArt: { position: 'absolute', right: 0, top: 0, width: 276, height: 92 },
  catalog: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: Ui.space.page, rowGap: 14 },
  card: { width: '48.5%', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  photo: { height: 92, width: '100%' },
  iconCircle: { position: 'absolute', left: 12, top: 70, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft, borderWidth: 2, borderColor: Colors.surface },
  body: { flex: 1, justifyContent: 'space-between', gap: 10, paddingHorizontal: 12, paddingTop: 30, paddingBottom: 12 },
  title: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: GREEN },
  description: { fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 16, color: Colors.textLight, marginTop: 3 },
  cta: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, paddingHorizontal: 12, borderRadius: 19, backgroundColor: GREEN },
  ctaText: { flex: 1, fontFamily: INTER.semibold, fontSize: TextSize.caption, color: Colors.white },
  support: { marginHorizontal: Ui.space.page, marginTop: 18, padding: 16, borderRadius: 22, backgroundColor: Colors.successSoft, flexDirection: 'row', alignItems: 'center', gap: 12 },
  supportTitle: { fontFamily: INTER.bold, fontSize: TextSize.bodyLarge, color: GREEN, marginBottom: 3 },
  supportText: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 20, color: Colors.textLight },
});