import { Colors } from '@/constants/colors';
import { services } from '@/data/services';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const handlePress = (serviceId: string) => {
    if (serviceId === 'visa') {
      router.push('/(tabs)/explore/visa');
    } else if (serviceId === 'hotels') {
      router.push('/(tabs)/explore/hotels');
    } else {
      router.push(`/(tabs)/explore/${serviceId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>All our travel services in one place</Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.serviceCard}
              onPress={() => handlePress(item.id)}>
              <Text style={styles.serviceIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceTitle}>{item.title}</Text>
                <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
              </View>
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
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: Colors.accent,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 14,
  },
  servicesGrid: {
    padding: 16,
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 18,
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceTitle: {
    color: Colors.textDark,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  serviceSubtitle: {
    color: Colors.textLight,
    fontSize: 13,
  },
});