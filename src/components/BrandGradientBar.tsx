import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

export function BrandGradientBar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient
      colors={['#063b24', '#0b5d35', '#d7b814']}
      locations={[0, 0.78, 1]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}

export function LemonTripBrand({ size = 44 }: { size?: number }) {
  return (
    <View style={styles.brand} accessible accessibilityLabel="Lemon Trip">
      <Image source={require('../../assets/images/header_logo.png')} style={{ width: size, height: size * 0.72 }} resizeMode="contain" />
      <Text style={[styles.name, { fontSize: size * 0.29 }]}>Lemon Trip</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { color: '#FFFFFF', fontFamily: 'Manrope', fontWeight: '900' },
});