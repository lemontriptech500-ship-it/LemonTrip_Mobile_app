
import { Brand, Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ focused }: { color: ColorValue; focused: boolean; size: number }) => (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? active : inactive}
        size={22}
        color={focused ? Brand.forest : Colors.textLight}
      />
    </View>
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
        tabBarActiveTintColor: Brand.forest,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingTop: 6 },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 72 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          shadowColor: '#0F3D2E',
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
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

      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: icon('wallet', 'wallet-outline'),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: icon('person', 'person-outline'),
        }}
      />

      <Tabs.Screen name="planner" options={{ href: null }} />
      <Tabs.Screen name="deals" options={{ href: null }} />
      <Tabs.Screen name="wishlist" options={{ href: null }} />

      <Tabs.Screen
        name="booking-confirmation"
        options={{
          href: null,
          title: 'Booking Confirmation',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
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
    backgroundColor: '#E5F1EC',
  },
});