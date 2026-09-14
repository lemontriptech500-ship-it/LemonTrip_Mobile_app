import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const services = [
  { title: 'Flights', subtitle: 'Book domestic & international flights' },
  { title: 'Hotels', subtitle: 'Handpicked stays across the globe' },
  { title: 'Buses', subtitle: 'Comfortable bus travel' },
  { title: 'Trains', subtitle: 'IRCTC bookings made easy' },
  { title: 'Tours & Packages', subtitle: 'Curated holiday experiences' },
  { title: 'Visa Services', subtitle: 'Expert visa assistance' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explore</Text>
          <Text style={styles.headerSubtitle}>All our travel services in one place</Text>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((item, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{item.title}</Text>
              <Text style={styles.serviceSubtitle}>{item.subtitle}</Text>
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 18,
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