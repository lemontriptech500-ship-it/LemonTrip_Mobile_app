import { Colors } from '@/constants/colors';
import { travelPackages } from '@/data/packages';
import { router } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PackagesListScreen() {
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tours & Packages</Text>
        <Text style={styles.headerSubtitle}>Curated holiday experiences</Text>
      </View>

      <FlatList
        data={travelPackages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/packages/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{item.duration}</Text>
                <Text style={styles.meta}>{item.rating}</Text>
              </View>
              <Text style={styles.price}>From {item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingVertical: 20, paddingHorizontal: 20 },
  backArrow: { color: Colors.accent, fontSize: 14, marginBottom: 10 },
  headerTitle: { color: Colors.accent, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { color: Colors.white, fontSize: 13 },
  list: { padding: 16, gap: 14 },
  card: { borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  image: { width: '100%', height: 150 },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: Colors.accent, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: Colors.primaryDark },
  body: { padding: 14 },
  title: { fontSize: 16, fontWeight: 'bold', color: Colors.textDark, marginBottom: 6 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  meta: { fontSize: 12, color: Colors.textLight },
  price: { fontSize: 15, fontWeight: 'bold', color: Colors.primary },
});