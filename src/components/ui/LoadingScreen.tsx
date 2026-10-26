import { Brand } from '@/constants/colors';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/** Spinning lemon-yellow ring, same as the splash screen loader. */
export function LoadingSpinner({ size = 36 }: { size?: number }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true, isInteraction: false }));
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2, transform: [{ rotate }] }]}
    />
  );
}

/** Full-screen loading state: plain white background with only the yellow spinner. */
export function LoadingScreen({ size }: { size?: number }) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <LoadingSpinner size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  ring: { borderWidth: 3, borderColor: 'rgba(255,208,0,0.16)', borderTopColor: Brand.lemon, borderLeftColor: Brand.lemon, borderRightColor: Brand.lemon },
});
