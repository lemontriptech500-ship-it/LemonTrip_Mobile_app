import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { Text, TextInput } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { InfoBanner } from '@/components/account/InfoBanner';
import { ServiceTopBar } from '@/components/ui/ServiceHeader';
import { Colors } from '@/constants/colors';
import { destinationIdeas } from '@/data/mock/destinations';
import type { Destination } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';

export default function DestinationsScreen() {
  useAppLanguage();
  const { items } = useContentItems<Destination>('destination');
  const [query, setQuery] = useState('');
  const all = items.length ? items : destinationIdeas;
  const destinations = all.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <AppScreen headerTone="light">
      <ServiceTopBar title="Destinations" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <InfoBanner title="Somewhere wonderful." text="Find the place that feels like your next adventure." />
          <View style={styles.body}>
            <View style={styles.searchPill}>
              <Ionicons name="search-outline" size={20} color={Colors.textLight} />
              <TextInput value={query} onChangeText={setQuery} placeholder="Mountains, islands, your favourite city..." placeholderTextColor={Colors.textLight} style={styles.searchText} accessibilityLabel="Find a destination" />
            </View>
            {destinations.map((item) => (
              <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityLabel={item.name} activeOpacity={0.9} onPress={() => router.push({ pathname: '/destinations/[id]', params: { id: item.id } })}>
                <ImageBackground source={{ uri: item.image }} style={styles.card} imageStyle={styles.cardImage}>
                  <View style={styles.shade} />
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.caption}>{item.priceFrom}</Text>
                </ImageBackground>
              </TouchableOpacity>
            ))}
            {!destinations.length ? <Text style={styles.empty}>No destinations match. Try another name.</Text> : null}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  body: { paddingHorizontal: 16, gap: 12 },
  searchPill: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 25, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  searchText: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Inter-Regular', fontSize: 14, paddingVertical: 10 },
  card: { height: 180, justifyContent: 'flex-end', padding: 16, borderRadius: 18, overflow: 'hidden', backgroundColor: '#103D30' },
  cardImage: { borderRadius: 18 },
  shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  name: { color: Colors.white, fontFamily: 'Inter-ExtraBold', fontSize: 20 },
  caption: { color: Colors.white, fontFamily: 'Inter-Regular', fontSize: 13, marginTop: 4 },
  empty: { color: Colors.textLight, fontFamily: 'Inter-Regular', fontSize: 13, paddingVertical: 8 },
});
