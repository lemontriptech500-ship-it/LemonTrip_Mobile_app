import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { offers } from '@/data/offers';

export default function OffersScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Offers worth travelling for" subtitle="A little more journey for less." eyebrow="LEMON TRIP / OFFERS" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.list}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <Image source={{ uri: offer.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.offerMeta}>
                <Text style={styles.category}>{offer.category}</Text>
                <Ionicons name="pricetag-outline" size={15} color={Colors.primary} />
              </View>
              <Text style={styles.title}>{offer.title}</Text>
              <Text style={styles.description}>{offer.description}</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Code:</Text>
                <Text style={styles.codeValue}>{offer.code}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.white,
    fontFamily: 'Manrope',
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 30,
    gap: 20,
  },
  card: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 190,
  },
  cardBody: {
    paddingVertical: 14,
  },
  category: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 6,
  },
  title: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  description: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  codeLabel: {
    fontFamily: 'Manrope',
    fontSize: 10,
    color: Colors.textLight,
    marginRight: 6,
  },
  codeValue: {
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  offerMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
});