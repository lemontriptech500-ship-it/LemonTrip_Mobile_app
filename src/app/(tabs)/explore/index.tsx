import { Colors } from '@/constants/colors';
import { services } from '@/data/services';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const handlePress = (serviceId: string) => {
    if (serviceId === 'visa') {
      router.push('/(tabs)/explore/visa');
    } else if (serviceId === 'hotels') {
      router.push('/(tabs)/explore/hotels');
    } else if (serviceId === 'packages') {
      router.push('/packages');
    } else {
      router.push(`/(tabs)/explore/${serviceId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.eyebrow}>LEMON TRIP / DISCOVER</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open cart" onPress={() => router.push('/cart')} style={styles.cartButton}>
              <Ionicons name="bag-outline" size={19} color={Colors.primaryDark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>Everything for a considered journey.</Text>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.textLight} />
          <TextInput placeholder="Where would you like to go?" placeholderTextColor={Colors.textLight} style={styles.searchText} editable={false} onPressIn={() => router.push('/(tabs)/explore/flights')} />
          <Ionicons name="options-outline" size={18} color={Colors.primary} />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Travel, your way</Text>
          <Text style={styles.sectionSubtitle}>Choose a service to get started</Text>
        </View>
        <View style={styles.servicesGrid}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceCard}
              onPress={() => handlePress(item.id)}>
              <View style={styles.serviceIcon}>
                <Ionicons name={item.icon} size={23} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={Colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 15,
    paddingBottom: 18,
    paddingHorizontal: 22,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 17 },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  headerTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 30,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 13,
    marginTop: 4,
  },
  cartButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
  },
  searchBox: {
    height: 52,
    marginHorizontal: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, paddingVertical: 0 },
  sectionHeading: { marginTop: 29, paddingHorizontal: 22, marginBottom: 14 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, marginTop: 4 },
  servicesGrid: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    width: '48%',
    minHeight: 142,
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  serviceIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted, marginBottom: 13 },
  serviceTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  serviceSubtitle: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 10,
    lineHeight: 15,
  },
});