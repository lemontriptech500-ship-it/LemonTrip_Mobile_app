import { useAppLanguage } from '@/utils/intl';
import { Text } from '@/components/ui/Text';
import { Brand } from '@/constants/colors';
import { TripWordmark } from '@/components/TripWordmark';
import { getUser, restoreSession } from '@/utils/authStore';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, AppState, Dimensions, Easing, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WRITE_DURATION = 1350;
const WRITE_DELAY = 400;
const REVEAL_DURATION = 2450;
const EXIT_DURATION = 520;
const MAX_SPLASH_DURATION = 4000;

export default function LaunchScreen() {
  useAppLanguage();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [lemonEntrance] = useState(() => new Animated.Value(0));
  const [writeProgress] = useState(() => new Animated.Value(0));
  const [taglineOpacity] = useState(() => new Animated.Value(0));
  const [transitionScale] = useState(() => new Animated.Value(1));
  const [transitionOpacity] = useState(() => new Animated.Value(1));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    let completed = false;
    let sessionReady = false;
    let revealRequested = false;
    let finishRequested = false;
    const startedAt = Date.now();
    lemonEntrance.setValue(0);
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
      Animated.timing(lemonEntrance, {
        toValue: 1,
        duration: WRITE_DELAY,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(WRITE_DELAY),
        Animated.timing(writeProgress, {
          toValue: 1,
          duration: WRITE_DURATION,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.delay(WRITE_DELAY + WRITE_DURATION),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      ]),
    ]);
    entrance.start();

    // Navigation must not depend on the native animation delivering a callback.
    const finish = () => {
      if (!active || completed) return;
      if (!sessionReady) { finishRequested = true; return; }
      completed = true;
      clearTimeout(revealTimer);
      clearTimeout(fallbackTimer);
      entrance.stop();
      transition?.stop();
      spinner.stop();
      router.replace(getUser() ? '/(tabs)/home' : '/onboarding');
    };

    const reveal = () => {
      if (!active || completed) return;
      if (!sessionReady) { revealRequested = true; return; }
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
    // Keep the logo visible until saved credentials are checked, even on a cold backend.
    // The animation watchdog must never mistake a pending restore for a signed-out user.
    void restoreSession().then(() => {
      sessionReady = true;
      if (!active || completed) return;
      if (finishRequested) finish();
      else if (revealRequested) reveal();
    });
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
  }, [lemonEntrance, writeProgress, spin, taglineOpacity, transitionOpacity, transitionScale]);

  const spinRotation = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const wordmarkWidth = Math.min(width * 0.48, 200);
  const lemonSize = wordmarkWidth * 0.75;
  // Frame the fruit within the original 1024px image, excluding the corner mark.
  const lemonImageScale = lemonSize / 680;

  return (
    <View style={styles.container} onLayout={() => SplashScreen.hide()}>
      <View style={styles.centerContent}>
        <Animated.View style={[styles.brandRow, { opacity: transitionOpacity, transform: [{ scale: transitionScale }] }]}>
          <Animated.View style={{
            opacity: lemonEntrance,
            width: lemonSize,
            height: lemonImageScale * 800,
            overflow: 'hidden',
            marginBottom: wordmarkWidth * 0.12,
            transform: [
              { translateY: lemonEntrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              { scale: lemonEntrance.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) },
              { rotate: lemonEntrance.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
            ],
          }}>
            <Image
              source={require('../../assets/images/lemonImage.avif')}
              style={{
                position: 'absolute',
                width: lemonImageScale * 1024,
                height: lemonImageScale * 1024,
                left: -lemonImageScale * 140,
                top: -lemonImageScale * 110,
              }}
              contentFit="contain"
              accessibilityLabel="Lemon"
            />
          </Animated.View>
          <TripWordmark progress={writeProgress} width={wordmarkWidth} />
        </Animated.View>
      </View>
      <Animated.View style={[styles.loadingRow, { bottom: insets.bottom + 32, opacity: taglineOpacity }]}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spinRotation }] }]} />
        <Text style={styles.tagline}>Travel smarter. Travel better.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.forest },
  centerContent: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  loadingRow: { position: 'absolute', left: 20, right: 20, alignItems: 'center', gap: 20 },
  spinner: { width: 32, height: 32, borderWidth: 3, borderColor: 'rgba(255,208,0,0.16)', borderTopColor: Brand.lemon, borderLeftColor: Brand.lemon, borderRightColor: Brand.lemon, borderRadius: 16 },
  tagline: { color: '#FFFFFF', fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }), fontSize: 14, fontWeight: '400', lineHeight: 20, letterSpacing: 0, textAlign: 'center', includeFontPadding: false },
});
