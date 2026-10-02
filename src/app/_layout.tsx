import { Stack } from "expo-router";
<<<<<<< HEAD
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect } from "react";
=======
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
>>>>>>> origin/dev

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
<<<<<<< HEAD
  const [fontsLoaded, fontError] = useFonts({
    Manrope: require("../../assets/fonts/Manrope[wght].ttf"),
=======
  const [fontsLoaded] = useFonts({
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
>>>>>>> origin/dev
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
    </Stack>
  );
}