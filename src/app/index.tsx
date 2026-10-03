import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPLASH_DURATION = 3100;
const appLogo = require('../../assets/images/App Logo.png');
export default function LaunchScreen() {
  const { width, height } = useWindowDimensions();
  const imageSize = Math.max(150, Math.min(width - 80, height * 0.32, 250));

  useEffect(() => {
    const transitionTimeout = setTimeout(() => router.replace('/(tabs)'), SPLASH_DURATION);
    return () => clearTimeout(transitionTimeout);
  }, []);

  return (
    <SafeAreaView style={styles.container} onLayout={() => SplashScreen.hide()}>
      <View style={styles.composition}>
        <View style={{ width: imageSize, height: imageSize }}>
          <Image source={appLogo} contentFit="contain" style={styles.appLogoImage} />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  composition: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLogoImage: {
    width: '100%',
    height: '100%',
  },
});
