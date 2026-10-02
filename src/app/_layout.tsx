import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useThemeName } from '@/utils/themeStore';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
  });
  const { theme } = useThemeName();

  if (!fontsLoaded || theme === null) return null;

  return (
    <Stack key={theme} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}
