import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
// Same slightly smaller type scale as Explore.
const TextSize = { micro: 10, caption: 11, body: 13, bodyLarge: 14, title: 16, heading: 18, displaySmall: 20, display: 24 } as const;
import { Text, TextInput } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { InfoBanner } from '@/components/account/InfoBanner';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

// Inter (static weights, loaded in app/_layout.tsx).
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';
// Banner artwork lives in assets/images (file name as saved in the project).
const BANNER = require('../../../assets/images/Tropical Travel Essentials in Green.png');

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Props = {
  title?: string;
  first: string;
  last: string;
  onChangeFirst: (value: string) => void;
  onChangeLast: (value: string) => void;
  onSave: () => Promise<void> | void;
  note?: { text: string; tone: 'good' | 'error' } | null;
};

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label.toUpperCase()}</Text>
      <TextInput value={value} onChangeText={onChangeText} accessibilityLabel={label} autoCapitalize="words" autoCorrect={false} placeholderTextColor={Colors.textLight} style={s.input} />
    </View>
  );
}

function InfoRow({ icon, label, value, trailing, onPress, last = false }: { icon: IconName; label: string; value: string; trailing?: ReactNode; onPress?: () => void; last?: boolean }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap {...(onPress ? { accessibilityRole: 'button' as const, onPress, activeOpacity: 0.75 } : {})} style={[s.info, !last && s.divider]}>
      <View style={s.iconCircle}><Ionicons name={icon} size={20} color={BRAND} /></View>
      <View style={s.flex}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text selectable style={s.infoValue} numberOfLines={1}>{value}</Text>
      </View>
      {trailing}
    </Wrap>
  );
}

function LinkRow({ icon, title, detail, onPress, last = false }: { icon: IconName; title: string; detail: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} onPress={onPress} activeOpacity={0.75} style={[s.link, !last && s.divider]}>
      <View style={s.linkIcon}><Ionicons name={icon} size={20} color={BRAND} /></View>
      <View style={s.flex}>
        <Text style={s.linkTitle}>{title}</Text>
        <Text style={s.linkDetail} numberOfLines={2}>{detail}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

export function EditProfileScreen({ title = 'Edit profile', first, last, onChangeFirst, onChangeLast, onSave, note }: Props) {
  useAppLanguage();
  const user = useAuth();
  const [saving, setSaving] = useState(false);
  const go = (path: string) => router.push(path as Href);
  const goBack = () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile' as Href); };
  const save = async () => { setSaving(true); try { await onSave(); } finally { setSaving(false); } };
  const off = !user || saving;

  return (
    <AppScreen edges={['top']} headerTone="light">
      <View style={s.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={s.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={s.headerTitle}>{title}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => go('/settings')} style={s.gearButton} activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={20} color={BRAND} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 28 }}>
          <View style={s.content}>
            <InfoBanner title="Edit your profile" text="Keep your name and contact details up to date." />
            {/* Banner hidden (commented, not deleted)
            <View style={s.bannerWrap}>
              <ImageBackground source={BANNER} style={s.banner} imageStyle={s.bannerImage} resizeMode="cover">
                <View style={s.bannerCopy}>
                  <Text style={s.eyebrow}>LEMONTRIP / ACCOUNT</Text>
                  <Text style={s.bannerTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
                  <Text style={s.bannerText}>Made for the way you travel.</Text>
                </View>
              </ImageBackground>
            </View>
            */}

            <View style={s.card}>
              <Text style={s.cardEyebrow}>YOUR DETAILS</Text>
              <Text style={s.cardTitle}>Update your profile</Text>
              <Field label="First name" value={first} onChangeText={onChangeFirst} />
              <Field label="Last name" value={last} onChangeText={onChangeLast} />
              {note ? (
                <View accessibilityRole={note.tone === 'error' ? 'alert' : undefined} style={[s.note, note.tone === 'error' ? s.noteError : s.noteGood]}>
                  <Ionicons name={note.tone === 'error' ? 'alert-circle' : 'checkmark-circle'} size={18} color={note.tone === 'error' ? Colors.error : Colors.success} />
                  <Text style={[s.noteText, note.tone === 'error' && { color: Colors.error }]}>{note.text}</Text>
                </View>
              ) : null}
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: off, busy: saving }} disabled={off} onPress={() => void save()} activeOpacity={0.85} style={[s.saveButton, off && { opacity: 0.55 }]}>
                {saving ? <ActivityIndicator color={BRAND} /> : <><Text style={s.saveText}>Save profile</Text><Ionicons name="arrow-forward" size={18} color={BRAND} /></>}
              </TouchableOpacity>
            </View>

            <View style={s.card}>
              <Text style={s.cardEyebrow}>CONTACT DETAILS</Text>
              <Text style={s.cardTitle}>Email and phone</Text>
              <InfoRow icon="mail-outline" label="EMAIL" value={user?.email ?? 'Not added'} />
              <InfoRow
                icon="call-outline"
                label="PHONE"
                value={user?.phone ?? 'Not added'}
                onPress={user && !user.phone ? () => go('/contact') : undefined}
                trailing={user && !user.phone ? <View style={s.chip}><Text style={s.chipText}>Add</Text><Ionicons name="chevron-forward" size={14} color={BRAND} /></View> : undefined}
                last
              />
              <View style={s.notice}>
                <View style={s.noticeIcon}><Ionicons name="shield-checkmark-outline" size={22} color={BRAND} /></View>
                <View style={s.flex}>
                  <Text style={s.noticeTitle}>{!user ? 'Sign in to manage your account.' : 'Email and phone are used for booking updates.'}</Text>
                  {user ? <Text style={s.noticeBody}>To change them, contact support so we can verify the change.</Text> : null}
                </View>
              </View>
            </View>

            <View style={s.card}>
              <Text style={s.cardEyebrow}>ACCOUNT SETTINGS</Text>
              <Text style={s.cardTitle}>Manage your account</Text>
              <LinkRow icon="lock-closed-outline" title="Change password" detail="Update your sign-in password" onPress={() => go('/change-password')} />
              <LinkRow icon="headset-outline" title="Account support" detail="Need help changing your details?" onPress={() => go('/contact')} last />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  bannerTitle: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.displaySmall },
  bannerText: { fontFamily: INTER.regular, color: Colors.onDarkMuted, fontSize: TextSize.body, lineHeight: 18, marginTop: 4 },

  card: { marginHorizontal: 16, marginBottom: 14, padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cardEyebrow: { fontFamily: INTER.extrabold, color: Colors.secondary, fontSize: TextSize.micro, letterSpacing: 1.2 },
  cardTitle: { fontFamily: INTER.extrabold, color: BRAND, fontSize: TextSize.title, marginTop: 4, marginBottom: 10 },

  field: { marginBottom: 12 },
  fieldLabel: { fontFamily: INTER.semibold, color: Colors.textLight, fontSize: TextSize.micro, letterSpacing: 1, marginBottom: 6 },
  input: { minHeight: 52, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, fontFamily: INTER.regular, fontSize: TextSize.bodyLarge, color: Colors.textDark },
  saveButton: { minHeight: 52, marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, backgroundColor: BRAND },
  saveText: { fontFamily: INTER.extrabold, color: Colors.white, fontSize: TextSize.body },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, marginBottom: 6 },
  noteGood: { backgroundColor: Colors.successSoft },
  noteError: { backgroundColor: Colors.errorSoft },
  noteText: { flex: 1, fontFamily: INTER.medium, color: Colors.textDark, fontSize: TextSize.caption, lineHeight: 17 },

  info: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  iconCircle: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  infoLabel: { fontFamily: INTER.semibold, color: Colors.textLight, fontSize: TextSize.micro, letterSpacing: 1 },
  infoValue: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.bodyLarge, marginTop: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: Colors.surfaceMuted },
  chipText: { fontFamily: INTER.semibold, color: BRAND, fontSize: TextSize.caption },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: Colors.surfaceMuted },
  noticeIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.white },
  noticeTitle: { fontFamily: INTER.bold, color: BRAND, fontSize: TextSize.caption, lineHeight: 17 },
  noticeBody: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },

  link: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  linkIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.surfaceMuted },
  linkTitle: { fontFamily: INTER.bold, color: Colors.textDark, fontSize: TextSize.body },
  linkDetail: { fontFamily: INTER.regular, color: Colors.textLight, fontSize: TextSize.caption, lineHeight: 17, marginTop: 2 },
});
