import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { FontWeight, TextSize } from '@/constants/typography';

export function RazorpayPaymentDetails({ error, compact }: { error: string; compact?: boolean }) {
  if (compact) return <View style={s.container}>
    <View style={s.row}>
      <Ionicons name="shield-checkmark-outline" size={40} color="#103D30" />
      <View style={s.copy}><Text style={s.cTitle}>Razorpay · Test mode</Text><Text style={s.cBody}>Choose your payment method securely in Razorpay Checkout.</Text></View>
    </View>
    <View style={s.cNote}><Ionicons name="information-circle-outline" size={18} color="#103D30" /><Text style={s.cBody}>Use test payment details only. No real money is charged.</Text></View>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
  </View>;
  return <View style={s.container}>
    <View style={s.row}>
      <Ionicons name="shield-checkmark-outline" size={28} color={Colors.primary} />
      <View style={s.copy}><Text style={s.title}>Razorpay · Test mode</Text><Text style={s.body}>Choose your payment method securely in Razorpay Checkout.</Text></View>
    </View>
    <Text style={s.body}>Use test payment details only. No real money is charged.</Text>
    {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text> : null}
  </View>;
}
const s = StyleSheet.create({
  container: { gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, copy: { flex: 1 },
  title: { color: Colors.textDark, fontSize: TextSize.bodyLarge, fontWeight: FontWeight.extraBold },
  body: { color: Colors.textLight, fontSize: TextSize.body, lineHeight: 21 },
  cTitle: { fontFamily: 'Inter-ExtraBold', fontSize: 14, color: Colors.textDark },
  cBody: { flexShrink: 1, fontFamily: 'Inter-Regular', fontSize: 12, lineHeight: 17, color: Colors.textLight },
  cNote: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#E8F2EE' },
  error: { color: Colors.error, backgroundColor: Colors.errorSoft, padding: 12, borderRadius: 12, fontSize: TextSize.body, lineHeight: 21 },
});