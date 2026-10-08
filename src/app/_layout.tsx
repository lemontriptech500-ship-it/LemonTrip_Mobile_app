import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useFonts } from 'expo-font';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Manrope: require('../../assets/fonts/Manrope[wght].ttf'),
  });
  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}