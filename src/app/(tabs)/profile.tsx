import { Colors } from '@/constants/colors';
import { logout, useAuth } from '@/utils/authStore';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { label: 'My Bookings', route: '/(tabs)/bookings' },
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
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user ? user.name.charAt(0).toUpperCase() : 'T'}</Text>
        </View>
        <Text style={styles.name}>{user ? user.name : 'Guest User'}</Text>
        {user && <Text style={styles.emailText}>{user.email}</Text>}
        <TouchableOpacity onPress={handleAuthAction}>
          <Text style={styles.loginLink}>{user ? 'Log Out' : 'Login / Sign Up'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}>
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingVertical: 32, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: Colors.primaryDark },
  name: { color: Colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  emailText: { color: Colors.accentSoft, fontSize: 13, marginBottom: 6 },
  loginLink: { color: Colors.accent, fontSize: 14, fontWeight: '600' },
  menu: { padding: 16, gap: 8 },
  menuItem: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16 },
  menuText: { fontSize: 15, color: Colors.textDark },
});