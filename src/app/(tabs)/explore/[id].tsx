import { Colors } from '@/constants/colors';
import { dummyListings, services } from '@/data/services';
import { addToCart, isInCart, useCart } from '@/utils/cartStore';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = services.find((s) => s.id === id);
  const listings = dummyListings[id ?? ''] ?? [];
  useCart();
  const [searched, setSearched] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const showSearchForm = id === 'flights' || id === 'buses' || id === 'trains';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/explore');
    }
  };

  const handleAddToCart = (listingId: string, name: string, price: string) => {
    console.log('Add to Cart clicked!', listingId, name);
    addToCart({
      id: `${id}-${listingId}`,
      serviceName: service?.title ?? '',
      itemName: name,
      price,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service?.title ?? 'Listings'}</Text>
        <Text style={styles.headerSubtitle}>{service?.subtitle}</Text>
      </View>

      {showSearchForm && !searched ? (
        <View style={styles.searchForm}>
          <Text style={styles.label}>From</Text>
          <TextInput
            style={styles.input}
            placeholder="Departure city"
            placeholderTextColor={Colors.textLight}
            value={from}
            onChangeText={setFrom}
          />

          <Text style={styles.label}>To</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination city"
            placeholderTextColor={Colors.textLight}
            value={to}
            onChangeText={setTo}
          />

          <Text style={styles.label}>Travel Date</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={Colors.textLight}
            value={date}
            onChangeText={setDate}
          />

          <TouchableOpacity style={styles.searchButton} onPress={() => setSearched(true)}>
            <Text style={styles.searchButtonText}>Search {service?.title}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {showSearchForm && (
            <TouchableOpacity style={styles.editSearchBar} onPress={() => setSearched(false)}>
              <Text style={styles.editSearchText}>
                {from || 'Anywhere'} → {to || 'Anywhere'} · Edit Search
              </Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const inCart = isInCart(`${id}-${item.id}`);
              return (
                <View style={styles.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardDetail}>{item.detail}</Text>
                    <Text style={styles.cardPrice}>{item.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.bookButton, inCart && styles.addedButton]}
                    disabled={inCart}
                    onPress={() => handleAddToCart(item.id, item.name, item.price)}>
                    <Text style={[styles.bookButtonText, inCart && styles.addedButtonText]}>
                      {inCart ? 'Added ✓' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No listings available right now.</Text>
            }
          />
        </>
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
  searchForm: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editSearchBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  editSearchText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
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
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  bookButtonText: {
    color: Colors.primaryDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addedButtonText: {
    color: Colors.white,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: 40,
  },
});