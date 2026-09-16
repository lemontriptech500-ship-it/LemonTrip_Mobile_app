import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { offers } from '@/data/offers';

export default function OffersScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exclusive Offers</Text>
        <Text style={styles.headerSubtitle}>Save on your next journey with these deals</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {offers.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <Image source={{ uri: offer.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.category}>{offer.category}</Text>
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
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  backArrow: {
    color: Colors.accent,
    fontSize: 14,
    marginBottom: 10,
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
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardBody: {
    padding: 14,
  },
  category: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  codeLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 6,
  },
  codeValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});