import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { logout, useAuth } from '@/utils/authStore';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { label: 'My Bookings', route: '/(tabs)/bookings' },
  { label: 'Visa Applications', route: '/(tabs)/explore/visa/applications' },
  { label: 'Saved / Wishlist', route: '/(tabs)/wishlist' },
  { label: 'Payment Methods', route: null },
  { label: 'Help & Support', route: null },
  { label: 'Settings', route: '/settings' },
];

export default function ProfileScreen() {
  const user = useAuth();

  const handleAuthAction = () => {
    if (user) {
      logout();
    } else {
      router.push('/login');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.profileTopline}>
          <Text style={styles.eyebrow}>LEMON TRIP / ACCOUNT</Text>
          <Ionicons name="settings-outline" size={19} color={Colors.primary} />
        </View>
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user ? user.name.charAt(0).toUpperCase() : 'G'}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{user ? user.name : 'Guest User'}</Text>
            <Text style={styles.emailText}>{user ? user.email : 'Sign in to manage your trips'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.authAction} onPress={handleAuthAction}>
          <Text style={styles.loginLink}>{user ? 'Log out' : 'Login / Sign up'}</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}>
            <Text style={styles.menuText}>{item.label}</Text>
            <Ionicons name={item.route ? 'chevron-forward' : 'lock-closed-outline'} size={17} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: Colors.border },
  profileTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: 'Manrope', fontSize: 22, fontWeight: '800', color: Colors.primaryDark },
  identityCopy: { flex: 1 },
  name: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '800', marginBottom: 3 },
  emailText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 },
  authAction: { minHeight: 43, marginLeft: 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  loginLink: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' },
  menu: { paddingHorizontal: 22, paddingTop: 15 },
  menuItem: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '700', color: Colors.textDark },
});
