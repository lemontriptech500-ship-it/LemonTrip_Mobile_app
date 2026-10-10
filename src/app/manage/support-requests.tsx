import { SupportButton, SupportCard, SupportHeading, SupportNotice, SupportPage, goBackOr } from '@/components/support/SupportKit';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getSupportRequest, listSupportRequests, type SupportRequest, type SupportUpdate } from '@/utils/supportApi';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const statusColors = { new: Colors.textLight, open: '#997500', in_progress: '#087EA4', closed: Colors.success };
const statusLabels = { new: 'NEW', open: 'OPEN', in_progress: 'IN PROGRESS', closed: 'CLOSED' };

export default function SupportRequestsScreen() {
  const user = useAuth();
  const token = user ? getAccessToken() : null;
  const [result, setResult] = useState<{ actor: string; items: SupportRequest[]; error: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [detail, setDetail] = useState<{ request: SupportRequest; updates: SupportUpdate[] } | null>(null);
  const [detailError, setDetailError] = useState('');
  const generation = useRef(0);
  const detailGeneration = useRef(0);

  const load = useCallback(async () => {
    const attempt = ++generation.current;
    if (!user || !token) return;
    setLoading(true);
    try {
      const items = await listSupportRequests(token);
      if (generation.current === attempt) setResult({ actor: user.id, items, error: '' });
    } catch (error) {
      if (generation.current === attempt) setResult({ actor: user.id, items: [], error: error instanceof Error ? error.message : 'Could not load requests.' });
    } finally {
      if (generation.current === attempt) setLoading(false);
    }
  }, [token, user]);

  useFocusEffect(useCallback(() => { void load(); return () => { generation.current += 1; detailGeneration.current += 1; }; }, [load]));

  const items = result && result.actor === user?.id ? result.items : [];
  const error = result && result.actor === user?.id ? result.error : '';

  const open = async (id: string) => {
    if (!token) return;
    const attempt = ++detailGeneration.current;
    setSelected(id); setDetail(null); setDetailError('');
    try {
      const data = await getSupportRequest(id, token);
      if (detailGeneration.current === attempt) setDetail(data);
    } catch (cause) {
      if (detailGeneration.current === attempt) setDetailError(cause instanceof Error ? cause.message : 'Could not load request.');
    }
  };

  const refresh = () => { setSelected(''); void load(); };

  return (
    <SupportPage
      title="My support requests"
      subtitle="Follow every request and its updates."
      eyebrow="LEMONTRIP / SUPPORT"
      onBack={() => goBackOr('/help')}
      footer={<SupportButton label="Contact support" icon="mail-open-outline" onPress={() => router.push('/contact')} />}>
      {!user || !token ? (
        <SupportCard style={s.center}>
          <View style={s.bigIcon}><Ionicons name="lock-closed-outline" size={28} color={Colors.primaryDark} /></View>
          <Text style={s.centerTitle}>Sign in to view your requests</Text>
          <Text style={[s.body, s.centerText]}>Your support conversations are linked to your LemonTrip account.</Text>
          <View style={s.fullWidth}><SupportButton label="Sign in" icon="arrow-forward" onPress={() => router.push('/login')} /></View>
        </SupportCard>
      ) : loading && !items.length ? (
        <SupportCard style={s.center}>
          <ActivityIndicator accessibilityLabel="Loading support requests" color={Colors.secondary} />
          <Text style={[s.body, { marginTop: 10 }]}>Loading your requests…</Text>
        </SupportCard>
      ) : error ? (
        <>
          <SupportNotice tone="error">{error}</SupportNotice>
          <View style={s.pad}><SupportButton variant="soft" label="Try again" icon="refresh-outline" onPress={() => void load()} /></View>
        </>
      ) : !items.length ? (
        <SupportCard style={s.center}>
          <View style={s.bigIcon}><Ionicons name="chatbubbles-outline" size={28} color={Colors.primaryDark} /></View>
          <Text style={s.centerTitle}>No support requests yet</Text>
          <Text style={[s.body, s.centerText]}>Requests you submit from Contact support will appear here.</Text>
        </SupportCard>
      ) : (
        <SupportCard>
          <SupportHeading
            eyebrow={`${items.length} REQUEST${items.length === 1 ? '' : 'S'}`}
            title="Your requests"
            right={
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh support requests" onPress={refresh} hitSlop={8} style={s.refresh}>
                {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Ionicons name="refresh-outline" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            }
          />
          {items.map((item, index) => {
            const expanded = selected === item.id;
            const color = statusColors[item.status] ?? Colors.textLight;
            return (
              <View key={item.id} style={[s.request, index < items.length - 1 && s.divider]}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  activeOpacity={0.75}
                  style={s.requestHead}
                  onPress={() => { if (expanded) { detailGeneration.current += 1; setSelected(''); } else void open(item.id); }}>
                  <View style={s.flex}>
                    <Text style={s.topic}>{String(item.topic).toUpperCase()}</Text>
                    <Text style={s.subject} numberOfLines={2}>{item.subject}</Text>
                    <View style={s.meta}>
                      <View style={[s.badge, { backgroundColor: color }]}><Text style={s.badgeText}>{statusLabels[item.status] ?? String(item.status).toUpperCase()}</Text></View>
                      <Text style={s.count}>{item.updateCount} {item.updateCount === 1 ? 'update' : 'updates'}</Text>
                    </View>
                  </View>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
                </TouchableOpacity>

                {expanded ? (
                  <View style={s.details}>
                    {detailError ? <Text accessibilityRole="alert" style={s.error}>{detailError}</Text> : !detail ? <ActivityIndicator color={Colors.secondary} /> : (
                      <>
                        <View style={s.refBox}><Text style={s.refLabel}>REFERENCE</Text><Text selectable style={s.ref}>{detail.request.id}</Text></View>
                        <Text selectable style={s.message}>{detail.request.message}</Text>
                        {detail.updates.length ? <Text style={s.updatesLabel}>UPDATES</Text> : null}
                        {detail.updates.map((update) => (
                          <View key={update.id} style={s.update}>
                            <Text selectable style={s.message}>{update.message}</Text>
                            <Text style={s.date}>{new Date(update.createdAt).toLocaleDateString()}</Text>
                          </View>
                        ))}
                      </>
                    )}
                  </View>
                ) : null}
              </View>
            );
          })}
        </SupportCard>
      )}
    </SupportPage>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  pad: { marginHorizontal: Ui.space.page },
  fullWidth: { alignSelf: 'stretch', marginTop: 16 },
  body: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, color: Colors.textLight },
  center: { alignItems: 'center', paddingVertical: 24 },
  centerTitle: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.textDark, marginTop: 12, marginBottom: 6, textAlign: 'center' },
  centerText: { textAlign: 'center' },
  bigIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  refresh: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accentSoft },
  request: { paddingVertical: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  requestHead: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  topic: { ...Ui.eyebrow, color: Colors.secondary, marginBottom: 3 },
  subject: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.textDark },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  badgeText: { fontFamily: 'Manrope', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, color: Colors.white },
  count: { fontFamily: 'Manrope', fontSize: 12, color: Colors.textLight },
  details: { gap: 12, padding: 14, marginBottom: 10, borderRadius: 16, backgroundColor: Colors.background },
  refBox: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.surfaceMuted },
  refLabel: { ...Ui.eyebrow, color: Colors.textLight },
  ref: { fontFamily: 'Manrope', fontSize: 14, fontWeight: '800', color: Colors.textDark, marginTop: 2 },
  message: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, color: Colors.textDark },
  updatesLabel: { ...Ui.eyebrow, color: Colors.secondary },
  update: { paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.border },
  date: { fontFamily: 'Manrope', fontSize: 11, color: Colors.textLight, marginTop: 5 },
  error: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, color: Colors.error },
});