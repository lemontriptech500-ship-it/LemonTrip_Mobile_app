import { ExploreHeader, exploreDirectoryPaths } from '@/components/explore/ExploreHeader';
import { Colors } from '@/constants/colors';
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

export default function ExploreLayout() {
  const pathname = usePathname();
  return <View style={{ flex: 1, backgroundColor: Colors.background }}>
    {exploreDirectoryPaths.includes(pathname) ? <ExploreHeader pathname={pathname} /> : null}
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="packages" options={{ animation: 'none' }} />
      <Stack.Screen name="offers" options={{ animation: 'none' }} />
      <Stack.Screen name="visa" options={{ animation: 'none' }} />
    </Stack>
  </View>;
}
