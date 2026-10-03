import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { TravelArtworkIcon } from '@/components/TravelArtworkIcon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useWishlist, toggleWishlist } from '@/utils/wishlistStore';

export default function WishlistScreen() {
  const wishlist = useWishlist();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Saved places" subtitle="Keep the places you want to come back to." eyebrow="YOUR SHORTLIST" onBack={() => router.back()} />

      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}><TravelArtworkIcon name="saved" size={40} /></View>
          <Text style={styles.emptyTitle}>No saved destinations yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any destination to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardPrice}>From {item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleWishlist(item)} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 18,
  },
  backArrow: {
    color: Colors.primary,
    fontFamily: 'Manrope',
    fontSize: 13,
    marginBottom: 10,
  },
  headerTitle: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 27,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Manrope',
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 17,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: 92,
    height: 92,
  },
  cardInfo: {
    flex: 1,
    padding: 12,
  },
  cardName: {
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardPrice: {
    fontFamily: 'Manrope',
    fontSize: 11,
    color: Colors.textLight,
  },
  removeButton: {
    paddingHorizontal: 14,
  },
  removeText: {
    color: Colors.error,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft, marginBottom: 18 },
});