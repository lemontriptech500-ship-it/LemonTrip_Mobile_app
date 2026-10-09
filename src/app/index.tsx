import { Brand } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLASH_DURATION = 3100;

export default function LaunchScreen() {
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    const transitionTimeout = setTimeout(async () => {
      const seen = await AsyncStorage.getItem('onboardingSeen');
      router.replace(seen ? '/(tabs)' : '/onboarding');
    }, SPLASH_DURATION);

    return () => clearTimeout(transitionTimeout);
  }, []);

  return (
    <SafeAreaView style={styles.container} onLayout={() => SplashScreen.hide()}>
      <Image
        source={require('../../assets/images/onboarding1.png')}
        contentFit="cover"
        style={[styles.mountainImage, { height: Math.min(height * 0.28, 270) }]}
      />
      <LinearGradient
        colors={['rgba(15,61,46,0)', 'rgba(15,61,46,0.48)', Brand.forest]}
        locations={[0, 0.52, 1]}
        style={[styles.mountainShade, { height: Math.min(height * 0.36, 330) }]}
      />
      <View style={styles.content}>
        <View style={{ transform: [{ translateY: -Math.min(height * 0.07, 64) }] }}>
          <Image
            source={require('../../assets/images/web_logo_news.png')}
            contentFit="contain"
            style={{ width: Math.min(width - 44, 390), height: Math.min((width - 44) / 2.72, 140) }}
            accessibilityLabel="LemonTrip. Travel smarter, travel better."
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.forest },
  mountainImage: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' },
  mountainShade: { position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%' },
  content: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
});
