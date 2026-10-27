import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export function VisaHeader({ title, onBack, action, contact }: { contact?: boolean; title: string; onBack: () => void; action?: { label: string; onPress: () => void } }) {
  return <View style={styles.header}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.back}><Ionicons name={contact ? 'arrow-back' : 'chevron-back'} size={contact ? 22 : 21} color={contact ? '#103D30' : Colors.textDark} /></TouchableOpacity>
    <Text accessibilityRole="header" style={[styles.title, contact && styles.titleLeft]}>{title}</Text>
    {action ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress} style={styles.back}><Ionicons name="document-text-outline" size={21} color={Colors.secondary} /></TouchableOpacity> : contact ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings' as never)} style={[styles.back, styles.gear]}><Ionicons name="settings-outline" size={20} color="#103D30" /></TouchableOpacity> : <View style={styles.back} />}
  </View>;
}
const styles = StyleSheet.create({
  titleLeft: { textAlign: 'left', fontSize: 16, fontFamily: 'Inter-Bold', color: '#103D30' },
  gear: { width: 40, height: 40, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  header: { minHeight: 56, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: FontFamily.sans, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold, color: Colors.textDark },
});

export function visaCountryFlag(name: string) {
  const codes: Record<string, string> = { 'Schengen Area': 'EU', Schengen: 'EU', Australia: 'AU', France: 'FR', Singapore: 'SG', Thailand: 'TH', 'United Kingdom': 'GB', UK: 'GB', 'United States': 'US', USA: 'US', 'United Arab Emirates': 'AE', UAE: 'AE', Dubai: 'AE', Canada: 'CA', Japan: 'JP', Germany: 'DE', Italy: 'IT', Malaysia: 'MY', Indonesia: 'ID', Vietnam: 'VN', Switzerland: 'CH', India: 'IN' };
  const code = codes[name];
  return code ? String.fromCodePoint(...[...code].map(char => 127397 + char.charCodeAt(0))) : '🌐';
}
