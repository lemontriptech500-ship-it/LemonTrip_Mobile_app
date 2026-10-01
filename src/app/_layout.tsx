import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
  const [fontsLoaded] = useFonts({
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}
