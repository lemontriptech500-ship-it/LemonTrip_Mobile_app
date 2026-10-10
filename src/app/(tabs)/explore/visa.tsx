import { visaCountryFlag } from '@/components/visa/VisaHeader';
import { ExploreSectionIntro } from '@/components/explore/ExploreSectionIntro';
import { Colors } from '@/constants/colors';
import type { VisaCountry } from '@/types/content';
import { getVisaServices } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VisaScreen() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ attempt: number; items: VisaCountry[]; error: string } | null>(null);
  useEffect(() => {
    let active = true;
    getVisaServices().then(items => { if (active) setResult({ attempt, items, error: '' }); })
      .catch(error => { if (active) setResult({ attempt, items: [], error: error instanceof Error ? error.message : 'Visa services could not load.' }); });
    return () => { active = false; };
  }, [attempt]);
  const loading = result?.attempt !== attempt;
  const countries = useMemo(() => result?.attempt === attempt ? result.items : [], [result, attempt]);
  const visible = countries.filter(country => `${country.name} ${country.visaType}`.toLowerCase().includes(query.trim().toLowerCase()));
  const destination = countries.find(country => country.id === selected);
  return <View style={{ flex: 1, backgroundColor: Colors.background }}>
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <ExploreSectionIntro eyebrow="TRAVEL WITH CONFIDENCE" title="Visa Services" subtitle="Explore visa guidance for your next destination.">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="My visa applications" onPress={() => router.push('/(tabs)/explore/visa/applications')} style={styles.applications}><Ionicons name="document-text-outline" size={18} color={Colors.primaryDark} /><Text style={styles.applicationsText}>My applications</Text></TouchableOpacity>
      </ExploreSectionIntro>
      <View style={styles.page}>
      <View style={styles.search}><Ionicons name="search-outline" size={17} color={Colors.textLight} /><TextInput accessibilityLabel="Search countries" value={query} onChangeText={setQuery} placeholder="Search country or visa" placeholderTextColor={Colors.textLight} style={styles.input} /></View>
      {loading ? <ActivityIndicator accessibilityLabel="Loading visa services" color={Colors.secondary} /> : result?.error ? <View style={styles.state}><Text style={styles.body}>{result.error}</Text><TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => setAttempt(value => value + 1)}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : visible.length === 0 ? <Text style={styles.body}>No visa services found. Try another country.</Text> : visible.map(country => <TouchableOpacity key={country.id} accessibilityRole="radio" accessibilityLabel={`${country.name}, ${country.visaType}`} accessibilityState={{ selected: selected === country.id, checked: selected === country.id }} onPress={() => setSelected(country.id)} style={[styles.country, selected === country.id && styles.selected]}>
        <Text style={styles.flag}>{visaCountryFlag(country.name)}</Text><View style={styles.countryCopy}><Text style={styles.countryName}>{country.name}</Text><Text style={styles.body}>{country.visaType}</Text></View><Ionicons name={selected === country.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected === country.id ? Colors.secondary : Colors.textLight} />
      </TouchableOpacity>)}
      </View>
    </ScrollView>
    {!loading && !result?.error && countries.length > 0 ? <View style={styles.footer}><TouchableOpacity accessibilityRole="button" disabled={!destination} style={[styles.button, !destination && styles.disabled]} onPress={() => { if (destination) { blurWebNavigationFocus(); router.push({ pathname: '/(tabs)/explore/visa/[id]', params: { id: destination.id } }); } }}><Text style={styles.buttonText}>Continue</Text></TouchableOpacity></View> : null}
  </View>;
}
const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 24 },
  applications: { minHeight: 42, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14, paddingHorizontal: 14, borderRadius: 22, backgroundColor: Colors.white }, applicationsText: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.primaryDark },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 10, paddingBottom: 24 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 44, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginBottom: 4 },
  input: { flex: 1, minWidth: 0, paddingVertical: 10, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13 },
  country: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 72, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  selected: { borderColor: Colors.secondary, backgroundColor: Colors.surfaceMuted },
  flag: { fontSize: 28 }, countryCopy: { flex: 1 }, countryName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' },
  body: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 }, state: { gap: 14 },
  footer: { padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  button: { width: '100%', maxWidth: 608, alignSelf: 'center', minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.secondary, borderRadius: 8 },
  buttonText: { color: Colors.white, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' }, disabled: { opacity: 0.45 },
});
