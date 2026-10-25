import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Image, StyleSheet, View } from 'react-native';

// Same type scale as Explore.
const TextSize = { body: 13, heading: 18 } as const;
const BRAND = '#103D30';

/** Mint "Where will you go next?"-style card used instead of the top banner on account pages. */
export function InfoBanner({ title, text }: { title: string; text: string }) {
  return (
    <View style={s.card}>
      <View style={s.copy}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.text}>{text}</Text>
      </View>
      <Image source={require('../../../assets/images/profile-banner.png')} style={s.art} resizeMode="contain" />
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 14, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  copy: { flex: 1, minWidth: 0 },
  title: { color: BRAND, fontFamily: 'Inter-ExtraBold', fontSize: TextSize.heading },
  text: { color: BRAND, fontFamily: 'Inter-Regular', fontSize: TextSize.body, lineHeight: 19, marginTop: 4 },
  art: { width: 120, height: 80 },
});