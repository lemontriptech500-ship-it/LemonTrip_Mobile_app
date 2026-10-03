import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { Ionicons } from '@expo/vector-icons';
import { logout, useAuth } from '@/utils/authStore';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickLinks = [
  { label: 'My trips', artwork: 'flight' as const, route: '/(tabs)/bookings' },
  { label: 'Saved places', artwork: 'saved' as const, route: '/(tabs)/wishlist' },
  { label: 'Visa updates', artwork: 'visa' as const, route: '/(tabs)/explore/visa/applications' },
];

const accountLinks = [
  { label: 'Personal information', detail: 'Manage your contact details', icon: 'person-outline' as const, route: '/settings' },
  { label: 'Payment methods', detail: 'Your saved payment options', icon: 'card-outline' as const, unavailable: true },
  { label: 'Settings', detail: 'Preferences, privacy and notifications', icon: 'settings-outline' as const, route: '/settings' },
];

export default function ProfileScreen() {
  const user = useAuth();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'traveller';

  const handleAuthAction = () => {
    if (user) {
      Alert.alert('Log out?', 'You will be signed out on this device.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: logout },
      ]);
    } else {
      router.push('/login');
    }
  };

  const openUnavailable = (label: string) => Alert.alert(label, 'This feature is not available yet.');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, desktop && styles.contentDesktop]}>
          <View style={styles.headingRow}>
            <View>
              <Text style={styles.eyebrow}>YOUR LEMONTRIP</Text>
              <Text style={styles.pageTitle}>Your profile</Text>
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open settings" onPress={() => router.push('/settings')} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={19} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopline}>
              <View style={styles.memberPill}>
                {user ? <Ionicons name="sparkles" size={12} color={Colors.primaryDark} /> : <TravelArtworkIcon name="explore" size={21} />}
                <Text style={styles.memberPillText}>{user ? 'LEMONTRIP MEMBER' : 'YOUR NEXT JOURNEY STARTS HERE'}</Text>
              </View>
              <View style={styles.heroRing} />
            </View>
            <View style={styles.identityRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G'}</Text>
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.greeting}>{user ? `Welcome back, ${firstName}` : 'Welcome, traveller'}</Text>
                <Text style={styles.name}>{user?.name ?? 'Guest User'}</Text>
                <Text style={styles.emailText} numberOfLines={1}>{user?.email ?? 'Sign in to keep your trips together'}</Text>
              </View>
            </View>
            <View style={styles.heroBottom}>
              <Text style={styles.heroNote}>{user ? 'Your travel plans, all in one place.' : 'Sign in to save places and manage your bookings.'}</Text>
              <TouchableOpacity accessibilityRole="button" onPress={handleAuthAction} style={styles.authButton}>
                <Text style={styles.authButtonText}>{user ? 'Log out' : 'Sign in'}</Text>
                <Ionicons name={user ? 'log-out-outline' : 'arrow-forward'} size={15} color={Colors.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.quickSection}>
            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Your travel, at a glance</Text>
              <Text style={styles.sectionSubtitle}>Pick up where you left off</Text>
            </View>
            <View style={styles.quickLinks}>
              {quickLinks.map((item) => (
                <TouchableOpacity key={item.label} accessibilityRole="button" onPress={() => router.push(item.route as never)} style={styles.quickCard} activeOpacity={0.75}>
                  <View style={styles.quickIcon}><TravelArtworkIcon name={item.artwork} size={29} /></View>
                  <Text style={styles.quickLabel}>{item.label}</Text>
                  <Ionicons name="arrow-up-right" size={14} color={Colors.textLight} style={styles.quickArrow} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.lowerLayout, desktop && styles.lowerLayoutDesktop]}>
            <View style={styles.menuSection}>
              <View style={styles.sectionIntro}>
                <Text style={styles.sectionTitle}>Account details</Text>
                <Text style={styles.sectionSubtitle}>Your details and preferences</Text>
              </View>
              <View style={styles.menuCard}>
                {accountLinks.map((item, index) => (
                  <TouchableOpacity
                    key={item.label}
                    accessibilityRole="button"
                    onPress={() => item.unavailable ? openUnavailable(item.label) : router.push(item.route as never)}
                    style={[styles.menuRow, index < accountLinks.length - 1 && styles.menuDivider]}
                    activeOpacity={0.72}>
                    <View style={styles.menuIcon}><Ionicons name={item.icon} size={17} color={Colors.primary} /></View>
                    <View style={styles.menuCopy}>
                      <Text style={styles.menuTitle}>{item.label}</Text>
                      <Text style={styles.menuDetail}>{item.detail}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore/visa')} style={styles.menuRow} activeOpacity={0.72}>
                  <View style={styles.menuIcon}><TravelArtworkIcon name="visa" size={29} /></View>
                  <View style={styles.menuCopy}>
                    <Text style={styles.menuTitle}>Visa services</Text>
                    <Text style={styles.menuDetail}>Get help planning your next trip</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.discoverCard} activeOpacity={0.8}>
              <View style={styles.discoverIcon}><TravelArtworkIcon name="explore" size={32} /></View>
              <Text style={styles.discoverEyebrow}>A WORLD TO DISCOVER</Text>
              <Text style={styles.discoverTitle}>Where will you go next?</Text>
              <Text style={styles.discoverText}>Find a new favourite with handpicked destinations and stays.</Text>
              <View style={styles.discoverLink}><Text style={styles.discoverLinkText}>Explore destinations</Text><Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} /></View>
              <View pointerEvents="none" style={styles.discoverRing} />
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>LEMONTRIP · MADE FOR THE WAY YOU TRAVEL</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 34 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center' },
  contentDesktop: { maxWidth: 1040 },
  headingRow: { minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 7, paddingBottom: 14 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 },
  pageTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 30, lineHeight: 38, fontWeight: '900', marginTop: 3 },
  settingsButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  heroCard: { marginHorizontal: 16, padding: 20, borderRadius: 23, backgroundColor: Colors.primaryDark, overflow: 'hidden' },
  heroTopline: { minHeight: 28, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  memberPill: { minHeight: 27, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, borderRadius: 14, backgroundColor: Colors.accent },
  memberPillText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  heroRing: { position: 'absolute', width: 150, height: 150, right: -72, top: -87, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 14 },
  avatar: { width: 66, height: 66, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: Colors.accent },
  avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 28, fontWeight: '900' },
  identityCopy: { flex: 1, minWidth: 0 },
  greeting: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', marginBottom: 3 },
  name: { color: '#FFFFFF', fontFamily: 'Manrope', fontSize: 21, fontWeight: '900' },
  emailText: { color: 'rgba(255,255,255,0.76)', fontFamily: 'Manrope', fontSize: 12, marginTop: 4 },
  heroBottom: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 18, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  heroNote: { flex: 1, color: 'rgba(255,255,255,0.82)', fontFamily: 'Manrope', fontSize: 11, lineHeight: 17 },
  authButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, borderRadius: 13, backgroundColor: Colors.accent },
  authButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  quickSection: { marginTop: 28, paddingHorizontal: 16 },
  sectionIntro: { marginHorizontal: 2, marginBottom: 13 },
  sectionTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  sectionSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 4 },
  quickLinks: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, minWidth: 0, minHeight: 104, justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, backgroundColor: Colors.surface },
  quickIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  quickLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '800', marginTop: 9 },
  quickArrow: { position: 'absolute', right: 9, top: 10 },
  lowerLayout: { gap: 19, marginTop: 27, paddingHorizontal: 16 },
  lowerLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  menuSection: { flex: 1, minWidth: 0 },
  menuCard: { overflow: 'hidden', paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, backgroundColor: Colors.surface },
  menuRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  menuCopy: { flex: 1, minWidth: 0 },
  menuTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' },
  menuDetail: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, marginTop: 4 },
  discoverCard: { minHeight: 220, flex: 0.76, overflow: 'hidden', padding: 19, borderRadius: 20, backgroundColor: Colors.accentSoft },
  discoverIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: Colors.surface, borderWidth: 1, borderColor: '#e6f4e8' },
  discoverEyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 16 },
  discoverTitle: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 20, lineHeight: 26, fontWeight: '900', marginTop: 5 },
  discoverText: { maxWidth: 280, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, marginTop: 7 },
  discoverLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15 },
  discoverLinkText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900' },
  discoverRing: { position: 'absolute', width: 110, height: 110, right: -56, bottom: -72, borderRadius: 55, borderWidth: 1, borderColor: 'rgba(6,59,36,0.15)' },
  footer: { marginTop: 26, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' },
});
