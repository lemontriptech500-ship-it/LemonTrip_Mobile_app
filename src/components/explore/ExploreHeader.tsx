import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/utils/authStore';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const sections: { title: string; path: string; route: Href }[] = [
  { title: 'Explore', path: '/explore', route: '/(tabs)/explore' },
  { title: 'Packages', path: '/explore/packages', route: '/(tabs)/explore/packages' },
  { title: 'Offers', path: '/explore/offers', route: '/(tabs)/explore/offers' },
  { title: 'Visa Services', path: '/explore/visa', route: '/(tabs)/explore/visa' },
];
export function ExploreHeader({ pathname }: { pathname: string }) {
  const user = useAuth(); const wide = useWindowDimensions().width >= 900;
  const navigate = (route: Href) => { blurWebNavigationFocus(); router.navigate(route); };
  const links = sections.map(section => <TouchableOpacity key={section.title} accessibilityRole="button" accessibilityLabel={section.title} accessibilityState={{ selected: pathname === section.path }} onPress={() => { if (pathname !== section.path) navigate(section.route); }} style={[styles.navLink, pathname === section.path && styles.activeLink]}><Text style={[styles.navText, pathname === section.path && styles.activeText]}>{section.title}</Text></TouchableOpacity>);
  return <SafeAreaView edges={['top']} style={styles.safe}><StatusBar style="light" /><BrandGradientBar>
    <View testID="explore-shared-header" style={[styles.content, wide && styles.wide]}>
      <View style={styles.mainRow}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="LemonTrip home" onPress={() => navigate('/(tabs)')} style={styles.brand}><LemonTripBrand size={50} /></TouchableOpacity>
        {wide ? <View style={styles.nav}>{links}</View> : <View style={styles.spacer} />}
        <View style={styles.actions}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Saved places" onPress={() => navigate('/(tabs)/wishlist')} style={styles.action}><Ionicons name="heart-outline" size={21} color={Colors.white} /></TouchableOpacity>{user ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open profile" onPress={() => navigate('/(tabs)/profile')} style={styles.avatar}><Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text></TouchableOpacity> : <TouchableOpacity accessibilityRole="button" accessibilityLabel="Log in" onPress={() => navigate('/login')} style={styles.login}><Ionicons name="person-outline" size={16} color={Colors.primaryDark} /><Text style={styles.loginText}>Login</Text></TouchableOpacity>}</View>
      </View>
      {!wide ? <><TouchableOpacity accessibilityRole="button" accessibilityLabel="Change your departure city" onPress={() => navigate('/(tabs)/explore/flights')} style={styles.location}><Ionicons name="location-outline" size={14} color={Colors.onDarkMuted} /><Text style={styles.locationText}>New Delhi, IN · Change</Text></TouchableOpacity><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNav}>{links}</ScrollView></> : null}
    </View>
  </BrandGradientBar></SafeAreaView>;
}
export const exploreDirectoryPaths = sections.map(section => section.path);
const styles = StyleSheet.create({
  safe: { backgroundColor: Colors.primaryDark }, content: { width: '100%', maxWidth: 1380, alignSelf: 'center', paddingHorizontal: 18, paddingTop: 9, paddingBottom: 11 }, wide: { minHeight: 72, paddingVertical: 8 }, mainRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }, brand: { minWidth: 126, height: 50, alignItems: 'flex-start', justifyContent: 'center' }, spacer: { flex: 1 },
  nav: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26 }, mobileNav: { gap: 18, alignItems: 'center', paddingTop: 7 }, navLink: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 5, borderBottomWidth: 2, borderBottomColor: 'transparent' }, activeLink: { borderBottomColor: Colors.accent }, navText: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 14, fontWeight: '700' }, activeText: { color: Colors.accent, fontWeight: '800' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 7 }, action: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }, location: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }, locationText: { color: Colors.onDarkMuted, fontFamily: 'Manrope', fontSize: 11 }, avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: Colors.accent }, avatarText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' }, login: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, borderRadius: 21, backgroundColor: Colors.white }, loginText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 15, fontWeight: '800' },
});
