import { Colors } from '@/constants/colors';
import { StyleSheet, View } from 'react-native';

/** Quiet orbit lines echo the journey artwork on onboarding. */
export function BrandMotif() {
  return (
    <View pointerEvents="none" style={styles.clip}>
      <View style={styles.orbit} />
      <View style={[styles.orbit, styles.second]} />
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  orbit: {
    position: 'absolute', width: 310, height: 180, right: -130, top: 20,
    borderWidth: 1, borderColor: Colors.accent, opacity: 0.18,
    borderRadius: 160, transform: [{ rotate: '-28deg' }],
  },
  second: { top: 50, right: -90, borderStyle: 'dashed', opacity: 0.1 },
});
