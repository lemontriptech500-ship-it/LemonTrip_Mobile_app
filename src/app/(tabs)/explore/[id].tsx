import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors } from '@/constants/colors';
import { services, dummyListings } from '@/data/services';

export default function ServiceListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = services.find((s) => s.id === id);
  const listings = dummyListings[id ?? ''] ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{service?.title ?? 'Listings'}</Text>
        <Text style={styles.headerSubtitle}>{service?.subtitle}</Text>
      </View>

      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardDetail}>{item.detail}</Text>
            </View>
            <Text style={styles.cardPrice}>{item.price}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No listings available right now.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontSize: 13,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});