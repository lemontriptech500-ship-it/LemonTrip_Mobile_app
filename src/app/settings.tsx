import { useTheme } from '@/utils/themeContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = getStyles(colors);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('INR (₹)');

  const handleLanguageChange = () => {
    setLanguage((prev) => (prev === 'English' ? 'Hindi' : 'English'));
  };

  const handleCurrencyChange = () => {
    setCurrency((prev) => (prev === 'INR (₹)' ? 'USD ($)' : 'INR (₹)'));
  };

  const handlePrivacyPolicy = () => {
    Alert.alert('Privacy Policy', 'LemonTrip respects your privacy. Full policy coming soon.');
  };

  const handleTerms = () => {
    Alert.alert('Terms of Service', 'By using LemonTrip, you agree to our terms. Full terms coming soon.');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          router.replace('/(tabs)/profile');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/profile'))}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Dark Mode</Text>
            <Text style={styles.rowSubtitle}>{isDark ? 'Currently dark' : 'Currently light'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Push Notifications</Text>
            <Text style={styles.rowSubtitle}>Get alerts about deals and bookings</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Email Updates</Text>
            <Text style={styles.rowSubtitle}>Receive offers and newsletters</Text>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.linkRow} onPress={handleLanguageChange}>
          <Text style={styles.rowLabel}>Language</Text>
          <Text style={styles.linkValue}>{language}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={handleCurrencyChange}>
          <Text style={styles.rowLabel}>Currency</Text>
          <Text style={styles.linkValue}>{currency}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.linkRow} onPress={handlePrivacyPolicy}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkRow} onPress={handleTerms}>
          <Text style={styles.rowLabel}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getStyles(colors: any) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingVertical: 20, paddingHorizontal: 20 },
    backArrow: { color: colors.accent, fontSize: 14, marginBottom: 10 },
    headerTitle: { color: colors.accent, fontSize: 22, fontWeight: 'bold' },
    section: { marginTop: 20, paddingHorizontal: 16 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: colors.textLight, marginBottom: 10, textTransform: 'uppercase' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },
    rowLabel: { fontSize: 15, color: colors.textDark, fontWeight: '600' },
    rowSubtitle: { fontSize: 12, color: colors.textLight, marginTop: 2 },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },
    linkValue: { fontSize: 14, color: colors.textLight },
    logoutButton: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },
    logoutText: { color: colors.error, fontSize: 15, fontWeight: 'bold' },
  });
}