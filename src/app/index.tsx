import { Brand, Colors } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLASH_DURATION = 3100;

const lemonImage = require('../../assets/images/lemon-slice.png');

const useNativeDriver = Platform.OS !== 'web';

export default function LaunchScreen() {
  const { width, height } = useWindowDimensions();

  const [fontsLoaded] = useFonts({
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
  });

  // --------------------------------------------------
  // Animation values
  // --------------------------------------------------

  const imageOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const imageScale = useRef(
    new Animated.Value(0.88)
  ).current;

  const imageRotation = useRef(
    new Animated.Value(1)
  ).current;

  const revealProgress = useRef(
    new Animated.Value(0)
  ).current;

  const strokeOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const wordmarkOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const wordmarkScale = useRef(
    new Animated.Value(0.98)
  ).current;

  const taglineOpacity = useRef(
    new Animated.Value(0)
  ).current;

  // --------------------------------------------------
  // Responsive sizing
  // --------------------------------------------------

  const imageSize = Math.max(
    150,
    Math.min(width - 80, height * 0.32, 250)
  );

  const lockupWidth = Math.min(
    width - 48,
    360
  );

  // --------------------------------------------------
  // Reveal animation
  // --------------------------------------------------

  const revealWidth =
    revealProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, lockupWidth],
    });

  const strokeWidth =
    revealProgress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, lockupWidth, 0],
    });

  const imageRotationDegrees =
    imageRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['-4deg', '0deg'],
    });

  // --------------------------------------------------
  // Splash animation
  // --------------------------------------------------

  useEffect(() => {
    if (!fontsLoaded) return;

    const entrance = Animated.parallel([
      // Lemon image
      Animated.sequence([
        Animated.delay(350),

        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 420,
            useNativeDriver,
          }),

          Animated.timing(imageScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver,
          }),

          Animated.timing(imageRotation, {
            toValue: 0,
            duration: 700,
            useNativeDriver,
          }),
        ]),
      ]),

      // Line reveal
      Animated.sequence([
        Animated.delay(1450),

        Animated.parallel([
          Animated.timing(revealProgress, {
            toValue: 1,
            duration: 650,
            useNativeDriver: false,
          }),

          Animated.timing(strokeOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver,
          }),
        ]),
      ]),

      // Logo text
      Animated.sequence([
        Animated.delay(1750),

        Animated.parallel([
          Animated.timing(wordmarkOpacity, {
            toValue: 1,
            duration: 340,
            useNativeDriver,
          }),

          Animated.timing(wordmarkScale, {
            toValue: 1,
            duration: 340,
            useNativeDriver,
          }),
        ]),

        Animated.timing(strokeOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver,
        }),
      ]),

      // Tagline
      Animated.sequence([
        Animated.delay(2350),

        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver,
        }),
      ]),
    ]);

    entrance.start();

    // First launch -> onboarding, otherwise straight to the app
    const transitionTimeout = setTimeout(async () => {
      const seen = await AsyncStorage.getItem('onboardingSeen');
      router.replace(seen ? '/(tabs)' : '/onboarding');
    }, SPLASH_DURATION);

    return () => {
      entrance.stop();
      clearTimeout(transitionTimeout);
    };
  }, [
    fontsLoaded,
    imageOpacity,
    imageScale,
    imageRotation,
    revealProgress,
    strokeOpacity,
    taglineOpacity,
    wordmarkOpacity,
    wordmarkScale,
  ]);

  // --------------------------------------------------
  // Wait for font
  // --------------------------------------------------

  if (!fontsLoaded) {
    return null;
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <SafeAreaView
      style={styles.container}
      onLayout={() => {
        SplashScreen.hide();
      }}
    >
      <View style={styles.composition}>

        {/* Lemon Image */}
        <Animated.View
          style={[
            styles.lemonWrapper,
            {
              width: imageSize,
              height: imageSize,
              opacity: imageOpacity,
              transform: [
                {
                  scale: imageScale,
                },
                {
                  rotate: imageRotationDegrees,
                },
              ],
            },
          ]}
        >
          <Image
            source={lemonImage}
            contentFit="contain"
            style={styles.lemonImage}
          />
        </Animated.View>

        {/* Brand */}
        <View
          style={[
            styles.brandLockup,
            {
              width: lockupWidth,
            },
          ]}
        >
          {/* Wordmark frame */}
          <View
            style={[
              styles.wordmarkFrame,
              {
                width: lockupWidth,
              },
            ]}
          >
            {/* Animated accent line */}
            <Animated.View
              style={[
                styles.strokeReveal,
                {
                  width: strokeWidth,
                  opacity: strokeOpacity,
                },
              ]}
            />

            {/* Logo reveal */}
            <Animated.View
              style={[
                styles.wordmarkReveal,
                {
                  width: revealWidth,
                  opacity: wordmarkOpacity,
                },
              ]}
            >
              <Animated.Text
                style={[
                  styles.brandName,
                  {
                    width: lockupWidth,
                    transform: [
                      {
                        scale: wordmarkScale,
                      },
                    ],
                  },
                ]}
                numberOfLines={1}
              >
                LEMON TRIP
              </Animated.Text>
            </Animated.View>
          </View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: taglineOpacity,
              },
            ]}
          >
            Travel • Tourism • Technology
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Brand.forest,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  composition: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  lemonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  lemonImage: {
    width: '100%',
    height: '100%',
  },

  brandLockup: {
    alignItems: 'center',
    marginTop: 8,
  },

  wordmarkFrame: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },

  strokeReveal: {
    position: 'absolute',
    height: 1.5,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },

  wordmarkReveal: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 54,
    overflow: 'hidden',
  },

  brandName: {
    color: Colors.accent,
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: 'Manrope',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 54,
    textAlign: 'center',
    includeFontPadding: false,
  },

  tagline: {
    color: Colors.white,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});