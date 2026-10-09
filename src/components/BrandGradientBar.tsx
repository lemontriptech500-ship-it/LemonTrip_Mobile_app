import { Colors } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export function BrandGradientBar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={[Colors.primaryDark, Colors.primaryDark]}
      locations={[0, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

export function LemonTripBrand({ size = 44 }: { size?: number }) {
  const width = Math.max(110, Math.min(size * 2.6, 190));
  return (
    <View style={styles.brand} accessible accessibilityLabel="LemonTrip — Travel smarter. Travel better.">
      <Image
        source={require('../../assets/images/web_logo_news.png')}
        style={{ width, height: width / 3 }}
        resizeMode="contain"
        accessible={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { justifyContent: 'center', flexShrink: 1 },
});
