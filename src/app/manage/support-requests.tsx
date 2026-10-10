import { SupportScreen, supportStyles as s } from '@/components/support/SupportScreen';
import { Colors } from '@/constants/colors';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getSupportRequest, listSupportRequests, type SupportRequest, type SupportUpdate } from '@/utils/supportApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const statusColors = { new: Colors.textLight, open: '#997500', in_progress: '#087EA4', closed: Colors.success };
const statusLabels = { new: 'NEW', open: 'OPEN', in_progress: 'IN PROGRESS', closed: 'CLOSED' };
export default function SupportRequestsScreen() {
  const user = useAuth(); const token = user ? getAccessToken() : null;
  const [result, setResult] = useState<{ actor: string; items: SupportRequest[]; error: string } | null>(null);
  const [loading, setLoading] = useState(false); const [selected, setSelected] = useState(''); const [detail, setDetail] = useState<{ request: SupportRequest; updates: SupportUpdate[] } | null>(null); const [detailError, setDetailError] = useState('');
  const generation = useRef(0); const detailGeneration = useRef(0);
  const load = useCallback(async () => {
    const attempt = ++generation.current; if (!user || !token) return;
    setLoading(true);
    try { const items = await listSupportRequests(token); if (generation.current === attempt) setResult({ actor: user.id, items, error: '' }); }
    catch (error) { if (generation.current === attempt) setResult({ actor: user.id, items: [], error: error instanceof Error ? error.message : 'Could not load requests.' }); }
    finally { if (generation.current === attempt) setLoading(false); }
  }, [token, user]);
  useFocusEffect(useCallback(() => { void load(); return () => { generation.current += 1; detailGeneration.current += 1; }; }, [load]));
  const items = result && result.actor === user?.id ? result.items : []; const error = result && result.actor === user?.id ? result.error : '';
  const open = async (id: string) => { if (!token) return; const attempt = ++detailGeneration.current; setSelected(id); setDetail(null); setDetailError(''); try { const data = await getSupportRequest(id, token); if (detailGeneration.current === attempt) setDetail(data); } catch (error) { if (detailGeneration.current === attempt) setDetailError(error instanceof Error ? error.message : 'Could not load request.'); } };
  return <SupportScreen title="My Support Requests">
    {!user || !token ? <View style={s.card}><Ionicons name="lock-closed-outline" size={28} color={Colors.primary} /><Text style={s.title}>Sign in to view your requests</Text><Text style={s.body}>Your support conversations are linked to your LemonTrip account.</Text><TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => router.push('/login')}><Text style={s.buttonText}>Sign in</Text></TouchableOpacity></View> : <>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh support requests" style={styles.refresh} onPress={() => { setSelected(''); void load(); }}><Ionicons name="refresh-outline" size={18} color={Colors.secondary} /><Text style={s.body}>Refresh requests</Text></TouchableOpacity>
      {loading ? <ActivityIndicator accessibilityLabel="Loading support requests" color={Colors.secondary} /> : error ? <View style={s.card}><Text accessibilityRole="alert" style={s.error}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => void load()}><Text style={styles.link}>Try again</Text></TouchableOpacity></View> : !items.length ? <View style={s.card}><Text style={s.title}>No support requests yet</Text><Text style={s.body}>Requests you submit from Contact Support will appear here.</Text></View> : <View style={s.card}>{items.map(item => <View key={item.id}><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: selected === item.id }} style={styles.request} onPress={() => { if (selected === item.id) { detailGeneration.current += 1; setSelected(''); } else void open(item.id); }}><Text style={styles.subject}>{item.topic} · {item.subject}</Text><View style={styles.meta}><Text style={s.body}>Status</Text><View style={[styles.badge, { backgroundColor: statusColors[item.status] ?? Colors.textLight }]}><Text style={styles.badgeText}>{statusLabels[item.status] ?? item.status}</Text></View><Text style={[s.body, styles.count]}>{item.updateCount} {item.updateCount === 1 ? 'Update' : 'Updates'}</Text></View></TouchableOpacity>
        {selected === item.id ? <View style={styles.details}>{detailError ? <Text style={s.error}>{detailError}</Text> : !detail ? <ActivityIndicator color={Colors.secondary} /> : <><Text selectable style={s.body}>Reference: {detail.request.id}</Text><Text style={s.body}>{detail.request.message}</Text>{detail.updates.map(update => <View key={update.id} style={styles.update}><Text style={s.body}>{update.message}</Text><Text style={styles.date}>{new Date(update.createdAt).toLocaleDateString()}</Text></View>)}</>}</View> : null}
      </View>)}</View>}
    </>}
    <TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => router.push('/contact')}><Text style={s.buttonText}>Contact Support</Text></TouchableOpacity>
  </SupportScreen>;
}
const styles = StyleSheet.create({ refresh: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-end' }, request: { minHeight: 84, justifyContent: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 }, subject: { fontFamily: 'Manrope', fontSize: 14, color: Colors.textDark }, meta: { flexDirection: 'row', alignItems: 'center', gap: 7 }, badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, badgeText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', color: Colors.white }, count: { marginLeft: 'auto' }, details: { padding: 12, backgroundColor: Colors.background, gap: 12, borderRadius: 8 }, update: { paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border }, date: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 5 }, link: { fontFamily: 'Manrope', color: Colors.secondary, fontWeight: '800', paddingVertical: 12 } });
