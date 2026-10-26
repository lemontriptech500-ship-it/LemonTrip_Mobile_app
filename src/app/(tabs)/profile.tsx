import { useAppLanguage } from '@/utils/intl';
import { Alert } from '@/components/ui/Alert';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { logout, useAuth } from '@/utils/authStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

// Inter (static weights, loaded in app/_layout.tsx).
const INTER = { regular: 'Inter-Regular', medium: 'Inter-Medium', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const BRAND = '#103D30';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Item = { title: string; detail?: string; icon: IconName; route: string };

const travelLinks: Item[] = [
  { title: 'My trips', icon: 'briefcase-outline', route: '/(tabs)/bookings' },
  { title: 'Saved places', icon: 'heart-outline', route: '/(tabs)/wishlist' },
  { title: 'Visa updates', icon: 'document-text-outline', route: '/(tabs)/explore/visa/applications' },
  { title: 'Offers', icon: 'pricetag-outline', route: '/offers' },
];

const accountLinks: Item[] = [
  { title: 'Personal information', detail: 'Manage your contact details', icon: 'person-outline', route: '/manage/personal-information' },
  { title: 'Wallet', detail: 'Balance and transactions on LemonTrip', icon: 'wallet-outline', route: '/wallet' },
  { title: 'Help & Support', detail: 'FAQs, contact support, and request updates', icon: 'help-circle-outline', route: '/help' },
  { title: 'Travel services', detail: 'Flights, hotels, trains, buses, holidays and visas', icon: 'airplane-outline', route: '/services' },
  { title: 'Payment methods', detail: 'Choose how to pay', icon: 'card-outline', route: '/wallet/payment-methods' },
  { title: 'Saved travellers', detail: 'Names for your next journey', icon: 'people-outline', route: '/manage/travellers' },
  { title: 'Saved searches', detail: 'Pick up where you left off', icon: 'bookmark-outline', route: '/manage/saved-searches' },
  { title: 'Notifications', detail: 'Updates about your journeys', icon: 'notifications-outline', route: '/notifications' },
  { title: 'Travel assistant', detail: 'One assistant for every service', icon: 'chatbubble-ellipses-outline', route: '/assistant' },
  { title: 'About LemonTrip', detail: 'Travel smarter. Travel better.', icon: 'information-circle-outline', route: '/manage/about' },
  { title: 'Settings', detail: 'Preferences, privacy and notifications', icon: 'options-outline', route: '/settings' },
  { title: 'Visa services', detail: 'Get help planning your next trip', icon: 'earth-outline', route: '/(tabs)/explore/visa' },
];

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            accessibilityRole="button"
            onPress={() => router.push(item.route as never)}
            style={[styles.row, index < items.length - 1 && styles.rowDivider]}
            activeOpacity={0.75}>
            <View style={styles.rowIcon}><Ionicons name={item.icon} size={19} color={BRAND} /></View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              {item.detail ? <Text style={styles.rowDetail}>{item.detail}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={17} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  useAppLanguage();
  const user = useAuth();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'G';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will be signed out on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={BRAND} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {user ? (
            <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/manage/personal-information' as never)} style={styles.userCard} activeOpacity={0.85}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
                <View style={styles.cameraBadge}><Ionicons name="camera" size={12} color={Colors.white} /></View>
              </View>
              <View style={styles.userCopy}>
                <Text style={styles.userName} numberOfLines={1}>{(user.name ?? 'Traveller').toUpperCase()}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
                <View style={styles.memberPill}><Text style={styles.memberPillText}>LemonTrip member</Text></View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ) : (
            <View style={styles.userCard}>
              <View style={styles.userCopy}>
                <Text style={styles.userName}>WELCOME</Text>
                <Text style={styles.userEmail}>Sign in to keep your trips together</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/login')} style={styles.signInButton} activeOpacity={0.85}>
                <Text style={styles.exploreButtonText}>Sign in</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/explore')} style={styles.banner} activeOpacity={0.9}>
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerTitle}>Where will you go next?</Text>
              <Text style={styles.bannerText}>Find a new favourite with handpicked destinations and stays.</Text>
              <View style={styles.exploreButton}>
                <Text style={styles.exploreButtonText}>Explore destinations</Text>
                <View style={styles.exploreArrow}><Ionicons name="arrow-forward" size={15} color={BRAND} /></View>
              </View>
            </View>
            <Image source={require('../../../assets/images/profile-banner.png')} style={styles.bannerArt} resizeMode="contain" />
          </TouchableOpacity>

          <Section title="Your travel" items={travelLinks} />
          <Section title="Account" items={accountLinks} />

          {user ? (
            <TouchableOpacity accessibilityRole="button" onPress={confirmLogout} style={styles.logoutButton} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color={BRAND} />
              <Text style={styles.logoutText}>Log out</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.footer}>LemonTrip. Made for the way you travel.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 10 },

  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: Colors.surface },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  headerTitle: { flex: 1, color: BRAND, fontFamily: INTER.bold, fontSize: TextSize.title },

  userCard: { ...Ui.card, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 22 },
  avatarWrap: { width: 60, height: 60 },
  avatar: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 30, backgroundColor: BRAND },
  avatarText: { color: Colors.white, fontFamily: INTER.extrabold, fontSize: TextSize.displaySmall },
  cameraBadge: { position: 'absolute', right: -3, bottom: -3, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: BRAND, borderWidth: 2, borderColor: Colors.surface },
  userCopy: { flex: 1, minWidth: 0 },
  userName: { color: BRAND, fontFamily: INTER.extrabold, fontSize: 15 },
  userEmail: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, marginTop: 2 },
  memberPill: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.accent },
  memberPillText: { color: BRAND, fontFamily: INTER.bold, fontSize: TextSize.micro },

  banner: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderRadius: 24, backgroundColor: '#DCEBE5', overflow: 'hidden', shadowColor: BRAND, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  bannerCopy: { flex: 1, minWidth: 0 },
  bannerTitle: { color: BRAND, fontFamily: INTER.extrabold, fontSize: TextSize.title },
  bannerText: { color: '#3C4A45', fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 17, marginTop: 4 },
  bannerArt: { width: 110, height: 80 },
  exploreButton: { alignSelf: 'flex-start', minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingLeft: 16, paddingRight: 4, paddingVertical: 3, borderRadius: 999, backgroundColor: BRAND },
  signInButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 999, backgroundColor: BRAND },
  exploreButtonText: { color: Colors.white, fontFamily: INTER.extrabold, fontSize: 13 },
  exploreArrow: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.white },

  section: { marginTop: 20 },
  sectionTitle: { color: BRAND, fontFamily: INTER.extrabold, fontSize: TextSize.title, marginBottom: 10, marginHorizontal: 4 },
  card: { ...Ui.card, overflow: 'hidden', paddingHorizontal: 12, borderRadius: 22 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#EDF1EF' },
  rowIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#E3F0EA' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: Colors.textDark, fontFamily: INTER.semibold, fontSize: 15 },
  rowDetail: { color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, lineHeight: 16, marginTop: 2 },

  logoutButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 20, borderRadius: 16, borderWidth: 1.5, borderColor: BRAND, backgroundColor: Colors.surface },
  logoutText: { color: BRAND, fontFamily: INTER.extrabold, fontSize: 14 },
  footer: { marginTop: 20, color: Colors.textLight, fontFamily: INTER.regular, fontSize: TextSize.caption, textAlign: 'center' },
});