import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import type { Listing, TravelService } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { addToCart, isInCart, useCart } from '@/utils/cartStore';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

export default function ServiceListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items: services } = useContentItems<TravelService>('service');
  const { items: allListings } = useContentItems<Listing>('listing');
  const service = services.find((item) => item.id === id);
  const listings = allListings.filter((item) => item.serviceId === id);
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

      <ScreenHeader title={service?.title ?? 'Listings'} subtitle={service?.subtitle} eyebrow="LEMON TRIP / SEARCH" onBack={handleBack} />

      {showSearchForm && !searched ? (
        <View style={styles.searchForm}>
          <Text style={styles.label}>FROM</Text>
          <TextInput
            style={styles.input}
            placeholder="Departure city"
            placeholderTextColor={Colors.textLight}
            value={from}
            onChangeText={setFrom}
          />

          <Text style={styles.label}>TO</Text>
          <TextInput
            style={styles.input}
            placeholder="Destination city"
            placeholderTextColor={Colors.textLight}
            value={to}
            onChangeText={setTo}
          />

          <Text style={styles.label}>TRAVEL DATE</Text>
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
              <Ionicons name="search-outline" size={17} color={Colors.primary} />
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
                      {inCart ? 'Added' : 'Add to cart'}
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
  searchForm: {
    ...Ui.card,
    marginHorizontal: 22,
    marginTop: 18,
    padding: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    color: Colors.textDark,
    marginBottom: 6,
  },
  input: { minHeight: Ui.field.minHeight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Ui.radius.control,
    backgroundColor: Colors.background,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    color: Colors.textDark,
    marginBottom: 16,
  },
  searchButton: { minHeight: Ui.button.minHeight,
    backgroundColor: Colors.accent,
    borderRadius: Ui.radius.button,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: Colors.primaryDark,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    fontWeight: FontWeight.extraBold,
  },
  editSearchBar: {
    minHeight: 48,
    marginHorizontal: 22,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  editSearchText: {
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  list: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 26,
    gap: 11,
  },
  card: { ...Ui.card,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 15,
  },
  cardName: {
    fontFamily: FontFamily.sans,
    fontSize: TextSize.bodyLarge,
    fontWeight: FontWeight.extraBold,
    color: Colors.textDark,
    marginBottom: 4,
  },
  cardDetail: {
    fontFamily: FontFamily.sans,
    fontSize: TextSize.caption,
    color: Colors.textLight,
    marginBottom: 6,
  },
  cardPrice: {
    fontFamily: FontFamily.sans,
    fontSize: TextSize.title,
    fontWeight: FontWeight.extraBold,
    color: Colors.primary,
    marginBottom: 12,
  },
  bookButton: { minHeight: Ui.button.minHeight,
    backgroundColor: Colors.accent,
    borderRadius: Ui.radius.button,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addedButton: {
    backgroundColor: Colors.success,
  },
  bookButtonText: {
    color: Colors.primaryDark,
    fontFamily: FontFamily.sans,
    fontWeight: FontWeight.extraBold,
    fontSize: TextSize.body,
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