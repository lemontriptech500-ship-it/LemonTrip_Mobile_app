import { Brand } from '@/constants/colors';
import { TripWordmark } from '@/components/TripWordmark';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, AppState, Dimensions, Easing, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WRITE_DURATION = 1350;
const REVEAL_DURATION = 2450;
const EXIT_DURATION = 520;
const MAX_SPLASH_DURATION = 4000;

export default function LaunchScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [writeProgress] = useState(() => new Animated.Value(0));
  const [taglineOpacity] = useState(() => new Animated.Value(0));
  const [transitionScale] = useState(() => new Animated.Value(1));
  const [transitionOpacity] = useState(() => new Animated.Value(1));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    let completed = false;
    const startedAt = Date.now();
    writeProgress.setValue(0);
    taglineOpacity.setValue(0);
    transitionScale.setValue(1);
    transitionOpacity.setValue(1);
    spin.setValue(0);
    let transition: Animated.CompositeAnimation | undefined;
    const spinner = Animated.loop(Animated.timing(spin, {
      toValue: 1,
      duration: 900,
      easing: Easing.linear,
      useNativeDriver: true,
      isInteraction: false,
    }));
    spinner.start();

    const entrance = Animated.parallel([
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(writeProgress, {
          toValue: 1,
          duration: WRITE_DURATION,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(100 + WRITE_DURATION),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]);
    entrance.start();

    // Navigation must not depend on the native animation delivering a callback.
    const finish = () => {
      if (!active || completed) return;
      completed = true;
      clearTimeout(revealTimer);
      clearTimeout(fallbackTimer);
      entrance.stop();
      transition?.stop();
      spinner.stop();
      router.replace('/onboarding');
    };

    const reveal = () => {
      if (!active || completed) return;
      const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

      transition = Animated.parallel([
        Animated.sequence([
          Animated.delay(240),
          Animated.timing(transitionOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
        ]),
        Animated.timing(transitionScale, {
          toValue: Math.max(screenWidth / 150, screenHeight / 105) * 1.35,
          duration: EXIT_DURATION,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]);
      transition.start(finish);
    };
    const revealTimer = setTimeout(reveal, REVEAL_DURATION);
    const fallbackTimer = setTimeout(finish, MAX_SPLASH_DURATION);
    // Timers and native animations may pause while the app is backgrounded.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - startedAt >= REVEAL_DURATION + EXIT_DURATION) finish();
    });

    return () => {
      active = false;
      clearTimeout(revealTimer);
      clearTimeout(fallbackTimer);
      subscription.remove();
      spinner.stop();
      entrance.stop();
      transition?.stop();
    };
  }, [writeProgress, spin, taglineOpacity, transitionOpacity, transitionScale]);

  const spinRotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container} onLayout={() => SplashScreen.hide()}>
      <View style={styles.centerContent}>
        <Animated.View style={{ opacity: transitionOpacity, transform: [{ scale: transitionScale }] }}>
          <TripWordmark progress={writeProgress} width={Math.min(width * 0.48, 200)} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.loadingRow, { bottom: insets.bottom + 32, opacity: taglineOpacity }]}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spinRotation }] }]} />
        <Animated.Text style={styles.tagline}>Travel smarter. Travel better.</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.forest },
  centerContent: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  loadingRow: { position: 'absolute', left: 20, right: 20, alignItems: 'center', gap: 20 },
  spinner: { width: 32, height: 32, borderWidth: 3, borderColor: 'rgba(255,208,0,0.16)', borderTopColor: Brand.lemon, borderLeftColor: Brand.lemon, borderRightColor: Brand.lemon, borderRadius: 16 },
  tagline: { color: '#FFFFFF', fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }), fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: 0, textAlign: 'center', includeFontPadding: false },
});
