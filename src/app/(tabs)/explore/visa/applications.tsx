import { useAppLanguage } from '@/utils/intl';
import { TouchableOpacity } from '@/components/ui/Pressable';
import { TextSize } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getVisaApplications, openVisaApplicationDocument, type VisaApplication } from '@/utils/visaService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

const INTER = { regular: 'Inter-Regular', semibold: 'Inter-SemiBold', bold: 'Inter-Bold', extrabold: 'Inter-ExtraBold' } as const;
const GREEN = '#103D30';
const documentLabels = { passportFront: 'Passport front', passportBack: 'Passport back', applicantPhoto: 'Applicant photo' } as const;

export default function VisaApplicationsScreen() {
  useAppLanguage();
  const user = useAuth();
  const [items, setItems] = useState<VisaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [opening, setOpening] = useState('');
  const [expanded, setExpanded] = useState('');

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

  return (
    <SafeAreaView headerTone="light" style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explore/visa'))} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={GREEN} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Visa Applications</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} style={styles.gear}>
          <Ionicons name="settings-outline" size={22} color={GREEN} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.banner}>
            <Image source={require('../../../../../assets/images/Visa Travel Documents in Green Landscape.png')} resizeMode="cover" style={styles.bannerImg} />
            <View style={styles.bannerCopy}>
              <Text style={styles.bannerEyebrow}>VISA SERVICES</Text>
              <Text style={styles.bannerTitle} numberOfLines={2}>Your visa applications</Text>
              <Text style={styles.bannerSub} numberOfLines={2}>View your requests, documents, and latest updates.</Text>
            </View>
          </View>

          {loading ? <ActivityIndicator accessibilityLabel="Loading visa applications" color={GREEN} style={styles.loader} /> : null}
          {!loading && !user ? <View style={styles.empty}><Ionicons name="lock-closed-outline" size={28} color={GREEN} /><Text style={styles.emptyTitle}>Sign in required</Text><Text style={styles.copy}>{error}</Text><TouchableOpacity style={styles.button} onPress={() => router.push('/login')}><Text style={styles.buttonText}>Sign in</Text></TouchableOpacity></View> : null}
          {!loading && user && error ? <View style={styles.empty}><Text style={styles.copy}>{error}</Text><TouchableOpacity style={styles.button} onPress={() => void load()}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : null}
          {!loading && user && !error && items.length === 0 ? <View style={styles.empty}><Ionicons name="document-text-outline" size={28} color={GREEN} /><Text style={styles.emptyTitle}>No visa applications yet</Text><Text style={styles.copy}>Submitted applications will appear here.</Text><TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/explore/visa')}><Text style={styles.buttonText}>Browse visa services</Text></TouchableOpacity></View> : null}

          {!loading && !error ? items.map((item) => {
            const open = expanded === item.id;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.tag}><Text style={styles.tagText}>{item.status}</Text></View>
                  <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</Text>
                </View>
                <Text style={styles.country}>{item.country}</Text>
                <Text style={styles.visaType}>{item.visaType}</Text>
                <Text style={styles.reference}>Reference: {item.referenceId}</Text>
                <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => router.push({ pathname: '/visa-application/[id]', params: { id: item.id, view: 'tracking' } })}>
                  <Text style={styles.buttonText}>Track status</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} style={styles.detailButton} onPress={() => setExpanded(open ? '' : item.id)}>
                  <Text style={styles.detailText}>Application details</Text>
                  <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={GREEN} />
                </TouchableOpacity>
                {open ? <View style={styles.documents}>
                  {(Object.keys(documentLabels) as (keyof typeof documentLabels)[]).filter((key) => item.documents[key]).map((key) => {
                    const busy = opening === `${item.id}:${key}`;
                    return (
                      <TouchableOpacity key={key} accessibilityRole="button" accessibilityLabel={`Open ${documentLabels[key]}`} disabled={Boolean(opening)} style={styles.document} onPress={() => void openDocument(item, key)}>
                        <View style={styles.docIcon}>{busy ? <ActivityIndicator size="small" color={GREEN} /> : <Ionicons name="document-text-outline" size={20} color={GREEN} />}</View>
                        <Text style={styles.documentText}>{documentLabels[key]}</Text>
                        <Ionicons name="open-outline" size={18} color={Colors.textLight} />
                      </TouchableOpacity>
                    );
                  })}
                </View> : null}
              </View>
            );
          }) : null}

          {!loading && !error && hasMore ? <TouchableOpacity accessibilityRole="button" disabled={loadingMore} style={styles.button} onPress={() => void loadMore()}>{loadingMore ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.buttonText}>Load more applications</Text>}</TouchableOpacity> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topTitle: { flex: 1, fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN },
  gear: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  page: { paddingBottom: 32 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16, paddingTop: 12 },
  banner: { width: '100%', aspectRatio: 2.993, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', backgroundColor: GREEN },
  bannerImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  bannerCopy: { width: '58%', paddingLeft: 16 },
  bannerEyebrow: { fontFamily: INTER.extrabold, fontSize: TextSize.micro, letterSpacing: 1.2, color: Colors.accent },
  bannerTitle: { fontFamily: INTER.bold, fontSize: 18, lineHeight: 22, color: Colors.white, marginTop: 4 },
  bannerSub: { fontFamily: INTER.regular, fontSize: 11, lineHeight: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  loader: { marginTop: 48 },
  card: { marginTop: 14, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#FFF1B8' },
  tagText: { fontFamily: INTER.semibold, fontSize: TextSize.caption, color: GREEN, textTransform: 'capitalize' },
  date: { fontFamily: INTER.regular, fontSize: TextSize.caption, color: Colors.textLight },
  country: { fontFamily: INTER.bold, fontSize: 20, color: GREEN, marginTop: 10 },
  visaType: { fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textLight, marginTop: 2 },
  reference: { fontFamily: INTER.bold, fontSize: TextSize.body, color: '#1B6B4A', marginTop: 8 },
  button: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14, paddingHorizontal: 15, borderRadius: 26, backgroundColor: GREEN },
  buttonText: { fontFamily: INTER.bold, fontSize: TextSize.body, color: Colors.white },
  detailButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginTop: 6 },
  detailText: { fontFamily: INTER.semibold, fontSize: TextSize.body, color: GREEN },
  documents: { gap: 8, marginTop: 4 },
  document: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, borderRadius: 14, backgroundColor: Colors.surfaceMuted, borderWidth: 1, borderColor: Colors.border },
  docIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.successSoft },
  documentText: { flex: 1, fontFamily: INTER.regular, fontSize: TextSize.body, color: Colors.textDark },
  empty: { alignItems: 'center', marginTop: 24, padding: 24, borderRadius: 18, backgroundColor: Colors.surfaceMuted },
  emptyTitle: { fontFamily: INTER.bold, fontSize: TextSize.title, color: GREEN, marginTop: 10 },
  copy: { fontFamily: INTER.regular, fontSize: TextSize.body, lineHeight: 19, color: Colors.textLight, marginTop: 5, textAlign: 'center' },
});