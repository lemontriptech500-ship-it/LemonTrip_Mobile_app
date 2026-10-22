import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

const GREEN = '#103D30';

/** White top bar: back, title, mint settings gear. */
export function ServiceTopBar({ title, fallback = '/(tabs)/explore' }: { title: string; fallback?: string }) {
  return (
    <View style={s.topBar}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback as never))} style={s.topBtn}>
        <Ionicons name="arrow-back" size={22} color={GREEN} />
      </TouchableOpacity>
      <Text accessibilityRole="header" style={s.topTitle}>{title}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[s.topBtn, s.topBtnTint]}>
        <Ionicons name="settings-outline" size={20} color={GREEN} />
      </TouchableOpacity>
    </View>
  );
}

type ServiceBannerProps = { eyebrow: string; title: string; subtitle: string };

/** Banner image with text on the left. Image is the shared travel banner for now. */
export function ServiceBanner({ eyebrow, title, subtitle }: ServiceBannerProps) {
  return (
    <View style={s.bannerWrap}>
      <View style={s.banner}>
        <Image source={require('../../../assets/images/Emerald Skies Travel Banner.png')} resizeMode="cover" style={s.bannerImg} />
        <View style={s.bannerCopy}>
          <Text style={s.bannerEyebrow} numberOfLines={1}>{eyebrow}</Text>
          <Text style={s.bannerTitle} numberOfLines={2}>{title}</Text>
          <Text style={s.bannerSub} numberOfLines={2}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topBar: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  topBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBtnTint: { backgroundColor: Colors.successSoft },
  topTitle: { flex: 1, fontFamily: 'Inter-Bold', fontSize: TextSize.title, color: GREEN },
  bannerWrap: { paddingHorizontal: Ui.space.page, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2172 / 724, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: GREEN },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '58%', paddingLeft: 16 },
  bannerEyebrow: { fontFamily: 'Inter-ExtraBold', fontSize: TextSize.micro, letterSpacing: 0.8, color: Colors.accent },
  bannerTitle: { fontFamily: 'Inter-Bold', fontSize: 18, lineHeight: 22, color: Colors.white, marginTop: 4 },
  bannerSub: { fontFamily: 'Inter-Regular', fontSize: 11, lineHeight: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
});
