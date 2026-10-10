import { Brand, Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <View style={{ backgroundColor: focused ? Colors.accent : 'transparent', borderRadius: 20, width: 38, height: 32, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={focused ? active : inactive} size={size - 2} color={color} /></View>
  );
  TabIcon.displayName = `TabIcon(${active})`;
  return TabIcon;
};

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: { width: 38, height: 32 },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: 'Manrope',
          marginTop: 4,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 72 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: icon('home', 'home-outline'),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: icon('compass', 'compass-outline'),
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Trips',
          tabBarIcon: icon('briefcase', 'briefcase-outline'),
        }}
      />

      <Tabs.Screen name="wallet" options={{ title: 'Wallet', tabBarIcon: icon('wallet', 'wallet-outline') }} />
      <Tabs.Screen name="planner" options={{ href: null }} />
      <Tabs.Screen name="deals" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: icon('person', 'person-outline'),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Manrope',
    fontSize: 11,
    marginTop: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: "#E5F1EC",
  },
});
