import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Copy, FeatureScreen, Field } from '@/components/FeatureScreen';
import { Colors } from '@/constants/colors';
import type { Destination } from '@/types/content';
import { useContentItems } from '@/utils/contentApi';
import { router } from 'expo-router';
import { useState } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
export default function DestinationsScreen() {
  const { items, loading } = useContentItems<Destination>('destination'); const [query, setQuery] = useState('');
  const destinations = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  return <FeatureScreen title="Somewhere wonderful." subtitle="Find the place that feels like your next adventure." eyebrow="DESTINATIONS"><Field label="Find a destination" value={query} onChangeText={setQuery} placeholder="Mountains, islands, your favourite city…" />{!items.length ? <Copy>{loading ? 'Loading destinations…' : 'Published destinations will appear here when they are available.'}</Copy> : null}{destinations.map(item => <TouchableOpacity key={item.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/destinations/[id]', params: { id: item.id } })}><ImageBackground source={{ uri: item.image }} style={styles.hero} imageStyle={{ borderRadius: 24 }}><View style={styles.shade} /><Text style={styles.name}>{item.name}</Text><Text style={styles.caption}>{item.priceFrom}</Text></ImageBackground></TouchableOpacity>)}{items.length > 0 && !destinations.length ? <Copy>No destinations match. Try another name.</Copy> : null}</FeatureScreen>;
}
const styles = StyleSheet.create({ hero: { height: 220, justifyContent: 'flex-end', padding: 22, borderRadius: 24, overflow: 'hidden', backgroundColor: Colors.primary }, shade: { ...StyleSheet.absoluteFill, backgroundColor: Colors.heroOverlay }, name: { fontFamily: FontFamily.sans, color: Colors.white, fontSize: TextSize.display, fontWeight: FontWeight.extraBold }, caption: { fontFamily: FontFamily.sans, color: Colors.white, fontSize: TextSize.body, marginTop: 6 } });
