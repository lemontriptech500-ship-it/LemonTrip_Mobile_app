import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
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
      <ScreenHeader title="Tours & packages" subtitle="Considered itineraries for your next escape." eyebrow="CURATED JOURNEYS" onBack={handleBack} />

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
                <View style={styles.rating}><Ionicons name="star" size={12} color={Colors.primary} /><Text style={styles.meta}>{item.rating.replace(/[^0-9.]/g, '')}</Text></View>
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
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18 },
  backArrow: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, marginBottom: 10 },
  headerTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 27, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12 },
  list: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30, gap: 20 },
  card: { overflow: 'hidden', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 14 },
  image: { width: '100%', height: 190, backgroundColor: Colors.surfaceMuted },
  badge: { position: 'absolute', top: 12, left: 12, backgroundColor: Colors.accent, paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', color: Colors.primaryDark },
  body: { paddingTop: 12 },
  title: { fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 7 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  meta: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  price: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.primary },
});