import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Inter (static weights, loaded in app/_layout.tsx).
export const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
export const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../assets/images/Tropical Travel Essentials in Green.png');

type Props = { banner?: ImageSourcePropType; title: string; subtitle: string; eyebrow: string; onBack?: () => void; footer?: ReactNode; children: ReactNode };

/** Light header (back, title, settings) + green banner + scrolling body + optional sticky footer. */
export function BrandedPage({ banner, title, subtitle, eyebrow, onBack, footer, children }: Props) {
  const insets = useSafeAreaInsets();
  const goBack = onBack ?? (() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile' as Href); });
  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>{title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as Href)} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
          <View style={s.content}>
            <View style={s.bannerWrap}>
              <ImageBackground source={banner ?? BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
                <View style={s.bannerCopy}>
                  <Text style={s.eyebrow}>{eyebrow}</Text>
                  <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
                  <Text style={s.bannerText}>{subtitle}</Text>
                </View>
              </ImageBackground>
            </View>
            {children}
          </View>
        </ScrollView>
        {footer ? <View style={s.footer}><View style={[s.footerInner, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>{footer}</View></View> : null}
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: INTER.bold, flex: 1, color: BRAND, fontSize: TextSize.title },
  gearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  bannerWrap: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2.3, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: BRAND },
  bannerImage: { borderRadius: 22 },
  bannerCopy: { width: '66%', paddingLeft: 18, paddingRight: 0 },
  eyebrow: { fontFamily: INTER.extrabold, color: Colors.accent, fontSize: TextSize.micro, letterSpacing: 1.2, marginBottom: 4 },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.displaySmall },
  bannerText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.body, lineHeight: 18, marginTop: 4 },
  footer: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  footerInner: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 12 },
});