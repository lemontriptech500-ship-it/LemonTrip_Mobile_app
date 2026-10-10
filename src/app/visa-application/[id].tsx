import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { AppScreen } from '@/components/AppScreen';
import { VisaHeader } from '@/components/visa/VisaHeader';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getVisaApplication, openVisaApplicationDocument, type VisaDocumentKey, type VisaTracking } from '@/utils/visaService';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ComponentProps } from 'react';

export default function VisaTrackingScreen() {
  const { id, view = 'tracking' } = useLocalSearchParams<{ id: string; view?: string }>();
  const user = useAuth();
  const token = user ? getAccessToken() : null;
  const [result, setResult] = useState<{ key: string; data: VisaTracking | null; error: string } | null>(null);
  const [retry, setRetry] = useState(0);
  const [opening, setOpening] = useState('');
  const [documentError, setDocumentError] = useState('');
  const key = `${user?.id}:${token}:${id}:${retry}`;
  const application = result?.key === key ? result.data : null;
  const error = result?.key === key ? result.error : '';
  const details = view === 'details';
  useEffect(() => {
    let active = true;
    if (!user || !token) return;
    getVisaApplication(id, token).then(data => { if (active) setResult({ key, data, error: '' }); })
      .catch(cause => { if (active) setResult({ key, data: null, error: cause instanceof Error ? cause.message : 'Application unavailable.' }); });
    return () => { active = false; };
  }, [id, key, token, user]);
  const showView = (next: string) => router.setParams({ view: next });
  const status = application?.status.replace(/_/g, ' ') ?? '';
  const openDocument = async (document: VisaDocumentKey) => {
    if (!token || opening) return;
    setOpening(document); setDocumentError('');
    try { await openVisaApplicationDocument(id, document, token); }
    catch (cause) { setDocumentError(cause instanceof Error ? cause.message : 'Could not open document.'); }
    finally { setOpening(''); }
  };
  const stages = application ? [
    { title: 'Submitted', copy: `Received ${application.submittedDate}`, done: true, current: application.status === 'submitted' },
    { title: 'Under review', copy: application.status === 'submitted' ? 'Awaiting review' : 'Application review', done: ['in_review', 'approved', 'rejected'].includes(application.status), current: application.status === 'in_review' },
    { title: application.status === 'approved' ? 'Approved' : application.status === 'rejected' ? 'Rejected' : 'Decision pending', copy: ['approved', 'rejected'].includes(application.status) ? 'Decision recorded' : 'Awaiting a visa decision', done: ['approved', 'rejected'].includes(application.status), current: ['approved', 'rejected'].includes(application.status) },
  ] : [];
  return <AppScreen headerTone="light">
    <VisaHeader title={details ? 'Application Details' : 'Status Tracking'} onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore/visa/applications')} />
    <ScrollView contentContainerStyle={styles.page}>
      {!user || !token ? <View style={styles.card}><Text style={styles.title}>Sign in to view your application</Text><TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => router.push('/login')}><Text style={styles.buttonText}>Sign in</Text></TouchableOpacity></View> : error ? <View style={styles.card}><Text accessibilityRole="alert" style={styles.error}>{error}</Text><TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => setRetry(value => value + 1)}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : !application ? <ActivityIndicator accessibilityLabel="Loading application" color={Colors.secondary} /> : <>
        <View style={styles.tabs}>{['tracking', 'details'].map(tab => <TouchableOpacity key={tab} accessibilityRole="button" accessibilityState={{ selected: view === tab }} style={[styles.tab, view === tab && styles.activeTab]} onPress={() => showView(tab)}><Text style={[styles.tabText, view === tab && styles.activeTabText]}>{tab === 'tracking' ? 'Status Tracking' : 'Application Details'}</Text></TouchableOpacity>)}</View>
        {details ? <View style={styles.card}>
          <Detail icon="grid-outline" label="Application ID" value={application.id} />
          <Detail icon="person-outline" label="Applicant name" value={application.applicantName} />
          <Detail icon="calendar-outline" label="Application date" value={application.submittedDate} />
          <Detail icon="earth-outline" label="Destination" value={application.country} />
          <Detail icon="document-text-outline" label="Visa type" value={application.visaType} />
          <Detail icon="calendar-number-outline" label="Date of birth" value={application.dateOfBirth ?? 'Not provided'} />
          <Detail icon="id-card-outline" label="Passport number" value={application.passportNumber ?? 'Not provided'} />
          <Detail icon="airplane-outline" label="Travel date" value={application.intendedEntryDate ?? 'Not provided'} />
          <Detail icon="checkmark-circle-outline" label="Application status" value={status} />
        </View> : <View style={styles.timeline}>
          {stages.map((stage, index) => <View key={stage.title} style={styles.timelineRow}>
            <View style={styles.timelineSide}>{index % 2 === 0 ? <><Text style={styles.stageTitle}>{stage.title}</Text><Text style={styles.copy}>{stage.copy}</Text></> : null}</View>
            <View style={styles.rail}>{index < stages.length - 1 ? <View style={[styles.line, stage.done && styles.doneLine]} /> : null}<View style={[styles.dot, stage.done && styles.doneDot]}>{stage.current ? <View style={styles.innerDot} /> : null}</View></View>
            <View style={styles.timelineSide}>{index % 2 === 1 ? <><Text style={styles.stageTitle}>{stage.title}</Text><Text style={styles.copy}>{stage.copy}</Text></> : null}</View>
          </View>)}
          <Text style={styles.copy}>Latest status: {status}. Updates appear when the visa team changes your application status.</Text>
        </View>}
        {details && application.uploadedDocuments ? <View style={styles.card}><Text style={styles.title}>Uploaded documents</Text>{(['applicantPhoto', 'passportFront', 'passportBack'] as VisaDocumentKey[]).filter(document => application.uploadedDocuments?.[document]).map(document => <TouchableOpacity key={document} accessibilityRole="button" disabled={Boolean(opening)} style={styles.document} onPress={() => void openDocument(document)}>{opening === document ? <ActivityIndicator color={Colors.secondary} /> : <Ionicons name="document-text-outline" size={20} color={Colors.secondary} />}<Text style={styles.documentText}>{document === 'applicantPhoto' ? 'Passport photo' : document === 'passportFront' ? 'Passport front' : 'Passport back'}</Text><Ionicons name="open-outline" size={17} color={Colors.secondary} /></TouchableOpacity>)}{documentError ? <Text accessibilityRole="alert" style={styles.error}>{documentError}</Text> : null}</View> : null}
        <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => setRetry(value => value + 1)}><Text style={styles.buttonText}>Refresh status</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" style={styles.support} onPress={() => router.push({ pathname: '/contact', params: { reference: id } })}><Text style={styles.tabText}>Contact visa support</Text></TouchableOpacity>
      </>}
    </ScrollView>
  </AppScreen>;
}
function Detail({ icon, label, value }: { icon: ComponentProps<typeof Ionicons>['name']; label: string; value: string }) {
  return <View style={styles.detail}><View style={styles.detailIcon}><Ionicons name={icon} size={20} color={Colors.secondary} /></View><View style={styles.detailCopy}><Text style={styles.detailLabel}>{label}</Text><Text selectable style={styles.detailValue}>{value}</Text></View></View>;
}
const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 14, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 14 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold }, copy: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 8, padding: 4, borderWidth: 1, borderColor: Colors.border }, tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 6 }, activeTab: { backgroundColor: Colors.secondary }, tabText: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, fontWeight: FontWeight.extraBold, color: Colors.secondary }, activeTabText: { color: Colors.white },
  timeline: { padding: 16, backgroundColor: Colors.surface, borderRadius: 8, borderWidth: 1, borderColor: Colors.border }, timelineRow: { flexDirection: 'row', minHeight: 112 }, timelineSide: { flex: 1, paddingTop: 4, gap: 5 }, rail: { width: 36, alignItems: 'center', marginHorizontal: 12 }, line: { position: 'absolute', top: 12, bottom: -12, width: 2, backgroundColor: Colors.borderStrong }, doneLine: { backgroundColor: Colors.secondary }, dot: { marginTop: 4, width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: Colors.borderStrong, backgroundColor: Colors.surface }, doneDot: { backgroundColor: Colors.secondary, borderColor: Colors.secondary }, innerDot: { width: 6, height: 6, backgroundColor: Colors.white, borderRadius: 3, alignSelf: 'center', marginTop: 3 }, stageTitle: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  detail: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, detailIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted }, detailCopy: { flex: 1, minWidth: 0 }, detailLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight }, detailValue: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.bold, color: Colors.textDark, marginTop: 3, textTransform: 'capitalize' },
  document: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.background, borderRadius: 6, padding: 10 }, documentText: { flex: 1, fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.textDark },
  button: { minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: Colors.secondary }, buttonText: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.white }, support: { minHeight: 44, justifyContent: 'center', alignItems: 'center' }, error: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.body },
});
