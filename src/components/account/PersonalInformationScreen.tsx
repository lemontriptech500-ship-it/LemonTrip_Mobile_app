import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

// Inter (static weights, loaded in app/_layout.tsx).
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../assets/images/Tropical Travel Essentials in Green.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function InfoRow({ icon, label, value, valueTone, trailing, onPress, last = false }: { icon: IconName; label: string; value: string; valueTone?: 'good'; trailing?: ReactNode; onPress?: () => void; last?: boolean }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap {...(onPress ? { accessibilityRole: 'button' as const, onPress, activeOpacity: 0.75 } : {})} style={[s.info, !last && s.divider]}>
      <View style={s.iconCircle}><Ionicons name={icon} size={20} color={BRAND} /></View>
      <View style={s.flex}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text selectable style={[s.infoValue, valueTone === 'good' && { color: Colors.success }]} numberOfLines={1}>{value}</Text>
      </View>
      {trailing}
    </Wrap>
  );
}

function Chip({ label, icon, trailingIcon, tone = 'soft' }: { label: string; icon?: IconName; trailingIcon?: IconName; tone?: 'soft' }) {
  return (
    <View style={s.chip}>
      {icon ? <Ionicons name={icon} size={15} color={Colors.success} /> : null}
      <Text style={s.chipText}>{label}</Text>
      {trailingIcon ? <Ionicons name={trailingIcon} size={14} color={BRAND} /> : null}
    </View>
  );
}

function LinkRow({ icon, title, detail, onPress, last = false }: { icon: IconName; title: string; detail: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} onPress={onPress} activeOpacity={0.75} style={[s.link, !last && s.divider]}>
      <View style={s.iconCircle}><Ionicons name={icon} size={20} color={BRAND} /></View>
      <View style={s.flex}>
        <Text style={s.linkTitle}>{title}</Text>
        <Text style={s.linkDetail} numberOfLines={2}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export function PersonalInformationScreen() {
  useAppLanguage();
  const user = useAuth();
  const go = (path: string) => router.push(path as Href);
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile' as Href); };

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>Personal information</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => go('/settings')} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View style={s.content}>
          <View style={s.bannerWrap}>
            <ImageBackground source={BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
              <View style={s.bannerCopy}>
                <Text style={s.eyebrow}>LEMONTRIP / ACCOUNT</Text>
                <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>Personal information</Text>
                <Text style={s.bannerText}>Made for the way you travel.</Text>
              </View>
            </ImageBackground>
          </View>

          <View style={s.card}>
            <Text style={s.cardEyebrow}>YOUR PROFILE</Text>
            <Text style={s.cardTitle}>Your account</Text>
            <InfoRow icon="person-outline" label="NAME" value={user?.name ?? 'Guest'} />
            <InfoRow icon="mail-outline" label="EMAIL" value={user?.email ?? 'Not added'} />
            <InfoRow
              icon="call-outline"
              label="PHONE"
              value={user?.phone ?? 'Not added'}
              onPress={user && !user.phone ? () => go('/manage/edit-profile') : undefined}
              trailing={user && !user.phone ? <Chip label="Add" trailingIcon="chevron-forward" /> : undefined}
            />
            <InfoRow
              icon="shield-checkmark-outline"
              label="EMAIL VERIFIED"
              value={user?.emailVerified ? 'Yes' : 'No'}
              valueTone={user?.emailVerified ? 'good' : undefined}
              trailing={user?.emailVerified ? <Chip label="Verified" icon="checkmark-circle" /> : undefined}
              last
            />
            <TouchableOpacity accessibilityRole="button" onPress={() => go(user ? '/manage/edit-profile' : '/login')} style={s.primaryButton} activeOpacity={0.85}>
              <Text style={s.primaryText}>{user ? 'Edit profile' : 'Sign in'}</Text>
              <View style={s.primaryArrow}><Ionicons name="arrow-forward" size={16} color={BRAND} /></View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity accessibilityRole="button" onPress={() => go('/manage/security')} style={s.secure} activeOpacity={0.85}>
            <View style={s.secureIcon}><Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" /></View>
            <View style={s.flex}>
              <Text style={s.secureTitle}>Keep your account secure</Text>
              <Text style={s.secureText}>Keep your information up to date for a safer and smoother travel experience.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={BRAND} />
          </TouchableOpacity>

          <Text style={s.sectionTitle}>Quick links</Text>
          <View style={s.linkCard}>
            <LinkRow icon="lock-closed-outline" title="Change password" detail="Update your sign-in password" onPress={() => go('/change-password')} />
            <LinkRow icon="headset-outline" title="Account support" detail="Need help changing your details?" onPress={() => go('/contact')} last />
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },

  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { fontFamily: INTER.bold, flex: 1, color: BRAND, fontSize: TextSize.title },
  gearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },

  bannerWrap: { paddingHorizontal: 16, marginTop: 14, marginBottom: 16 },
  banner: { width: '100%', aspectRatio: 2.3, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: BRAND },
  bannerImage: { borderRadius: 22 },
  bannerCopy: { width: '66%', paddingLeft: 18, paddingRight: 0 },
  eyebrow: { fontFamily: INTER.extrabold, color: Colors.accent, fontSize: TextSize.micro, letterSpacing: 1.2, marginBottom: 4 },
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.title },
  bannerText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.body, lineHeight: 18, marginTop: 4 },

  card: { marginHorizontal: 16, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardEyebrow: { fontFamily: INTER.extrabold, color: Colors.secondary, fontSize: TextSize.micro, letterSpacing: 1.2 },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.bodyLarge, marginTop: 4, marginBottom: 8 },
  info: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  iconCircle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  infoLabel: { fontFamily: INTER.semibold, color: Colors.textLight, fontSize: TextSize.micro, letterSpacing: 1 },
  infoValue: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body, marginTop: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  chipText: { fontFamily: INTER.semibold, color: BRAND, fontSize: TextSize.caption },
  primaryButton: { minHeight: 52, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 6, borderRadius: 999, backgroundColor: BRAND },
  primaryText: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.body },
  primaryArrow: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },

  secure: { marginHorizontal: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 22, backgroundColor: Colors.successSoft },
  secureIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#103D30' },
  secureTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.body },
  secureText: { fontFamily: INTER.regular, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },

  sectionTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.title, marginTop: 20, marginBottom: 10, marginHorizontal: 18 },
  linkCard: { marginHorizontal: 16, paddingHorizontal: 14, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  link: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  linkTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  linkDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
});
