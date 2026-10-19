import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { usePreferences } from '@/utils/preferencesStore';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { Brand } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// Keep the native background until the first app view is laid out.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  usePreferences();
  // Load fonts in the background. The SVG splash and system tagline are ready
  // immediately; font failures must not block routes or change hydration markup.
  useFonts({
    ...Ionicons.font,
    'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
    'Inter-ExtraBold': require('../../assets/fonts/Inter-ExtraBold.ttf'),
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
    Italianno: require('../../assets/fonts/Italianno-Regular.ttf'),
    Caveat: require('../../assets/fonts/Caveat[wght].ttf'),
    NotoSansDevanagari: require('../../assets/fonts/NotoSansDevanagari[wdth,wght].ttf'),
  });

  return (
    <View style={{ flex: 1, backgroundColor: Brand.forest }} onLayout={() => SplashScreen.hide()}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </View>
  );
}