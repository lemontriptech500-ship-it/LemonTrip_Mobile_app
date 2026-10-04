import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getVisaApplications, openVisaApplicationDocument, type VisaApplication } from '@/utils/visaService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const documentLabels = { passportFront: 'Passport front', passportBack: 'Passport back', applicantPhoto: 'Applicant photo' } as const;

export default function VisaApplicationsScreen() {
  const user = useAuth();
  const [items, setItems] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState('');

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!user || !token) { setLoading(false); setError('Sign in to view your visa applications.'); return; }
    setLoading(true); setError('');
    try { const result = await getVisaApplications(token); setItems(result.items); setHasMore(result.pagination.hasMore); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Visa applications could not be loaded.'); }
    finally { setLoading(false); }
  }, [user]);

  const loadMore = async () => {
    const token = getAccessToken();
    if (!token || loadingMore) return;
    setLoadingMore(true);
    try { const result = await getVisaApplications(token, items.length); setItems((current) => [...current, ...result.items]); setHasMore(result.pagination.hasMore); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'More applications could not be loaded.'); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => { const task = setTimeout(() => void load(), 0); return () => clearTimeout(task); }, [load]);

  const openDocument = async (application: VisaApplication, key: keyof VisaApplication['documents']) => {
    const token = getAccessToken();
    if (!token) { setError('Your session expired. Sign in again to open documents.'); return; }
    setOpening(`${application.id}:${key}`); setError('');
    try { await openVisaApplicationDocument(application.id, key, token); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'The document could not be opened.'); }
    finally { setOpening(''); }
  };

  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.page}>
    <View style={styles.content}><ScreenHeader title="Visa applications" subtitle="Your submitted visa requests and uploaded documents." eyebrow="LEMONTRIP / VISA" onBack={() => router.back()} />
      {loading ? <ActivityIndicator accessibilityLabel="Loading visa applications" color={Colors.primary} style={styles.loader} /> : null}
      {!loading && !user ? <View style={styles.empty}><Ionicons name="lock-closed-outline" size={28} color={Colors.primary}/><Text style={styles.heading}>Sign in required</Text><Text style={styles.copy}>{error}</Text><TouchableOpacity style={styles.button} onPress={() => router.push('/login')}><Text style={styles.buttonText}>Sign in</Text></TouchableOpacity></View> : null}
      {!loading && user && error ? <View style={styles.errorPanel}><Text style={styles.copy}>{error}</Text><TouchableOpacity style={styles.button} onPress={() => void load()}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : null}
      {!loading && user && !error && items.length === 0 ? <View style={styles.empty}><Ionicons name="document-text-outline" size={28} color={Colors.primary}/><Text style={styles.heading}>No visa applications yet</Text><Text style={styles.copy}>Submitted applications will appear here.</Text><TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/explore/visa')}><Text style={styles.buttonText}>Browse visa services</Text></TouchableOpacity></View> : null}
      {!loading && !error ? items.map((item) => <View key={item.id} style={styles.card}>
        <View style={styles.row}><View style={styles.tag}><Text style={styles.tagText}>{item.status}</Text></View><Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text></View>
        <Text style={styles.heading}>{item.country}</Text><Text style={styles.copy}>{item.visaType}</Text>
        <Text style={styles.reference}>Reference: {item.referenceId}</Text>
        <View style={styles.documents}>{(Object.keys(documentLabels) as (keyof typeof documentLabels)[]).filter((key) => item.documents[key]).map((key) => {
          const busy = opening === `${item.id}:${key}`;
          return <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={`Open ${documentLabels[key]}`} disabled={Boolean(opening)} style={styles.document} onPress={() => void openDocument(item, key)}>
            {busy ? <ActivityIndicator size="small" color={Colors.primary}/> : <Ionicons name="document-attach-outline" size={17} color={Colors.primary}/>}
            <Text style={styles.documentText}>{documentLabels[key]}</Text><Ionicons name="open-outline" size={14} color={Colors.textLight}/>
          </TouchableOpacity>;
        })}</View>
      </View>) : null}
      {!loading && !error && hasMore ? <TouchableOpacity accessibilityRole="button" disabled={loadingMore} style={styles.moreButton} onPress={() => void loadMore()}>{loadingMore ? <ActivityIndicator size="small" color={Colors.primaryDark}/> : <Text style={styles.buttonText}>Load more applications</Text>}</TouchableOpacity> : null}
    </View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 32 }, content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16 },
  loader: { marginTop: 48 }, card: { padding: 17, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, tag: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.accentSoft }, tagText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', textTransform: 'capitalize' }, date: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11 }, heading: { marginTop: 10, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' }, copy: { marginTop: 5, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 12, lineHeight: 18 }, reference: { marginTop: 10, color: Colors.primary, fontFamily: 'Manrope', fontSize: 12, fontWeight: '800' }, documents: { gap: 7, marginTop: 14 }, document: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderRadius: 9, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border }, documentText: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '700' }, empty: { alignItems: 'center', marginTop: 45, padding: 24, borderRadius: 14, backgroundColor: Colors.surfaceMuted }, errorPanel: { marginTop: 24, padding: 15, borderRadius: 12, backgroundColor: Colors.surfaceMuted }, button: { minHeight: 40, alignItems: 'center', justifyContent: 'center', marginTop: 13, paddingHorizontal: 15, borderRadius: 9, backgroundColor: Colors.accent }, moreButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 14, borderRadius: 9, backgroundColor: Colors.accent }, buttonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 12, fontWeight: '900' },
});
