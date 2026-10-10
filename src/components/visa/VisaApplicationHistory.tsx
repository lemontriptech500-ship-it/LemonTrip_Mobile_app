import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { getVisaApplications, getVisaDocumentUrl, type VisaApplication, type VisaDocumentKey } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';

const documentLabels: Record<VisaDocumentKey, string> = {
  passportFront: 'Passport front',
  passportBack: 'Passport back',
  applicantPhoto: 'Applicant photo',
};

type Props = { accessToken: string | null };

export function VisaApplicationHistory({ accessToken }: Props) {
  const [result, setResult] = useState<{ requestKey: string; applications: VisaApplication[]; error: string }>({ requestKey: '', applications: [], error: '' });
  const [attempt, setAttempt] = useState(0);
  const [opening, setOpening] = useState('');
  const [openingError, setOpeningError] = useState('');
  const requestKey = `${accessToken ?? 'signed-out'}:${attempt}`;
  const loading = Boolean(accessToken) && result.requestKey !== requestKey;
  const applications = result.requestKey === requestKey ? result.applications : [];
  const error = result.requestKey === requestKey ? result.error : '';

  useEffect(() => {
    let active = true;
    if (!accessToken) return () => { active = false; };
    getVisaApplications(accessToken).then((result) => {
      if (active) setResult({ requestKey, applications: result.items, error: '' });
    }).catch((reason: unknown) => {
      if (active) setResult({ requestKey, applications: [], error: reason instanceof Error ? reason.message : 'Visa applications could not be loaded.' });
    });
    return () => { active = false; };
  }, [accessToken, attempt, requestKey]);

  const openDocument = async (application: VisaApplication, document: VisaDocumentKey) => {
    if (!accessToken || opening) return;
    setOpening(`${application.id}:${document}`);
    setOpeningError('');
    try {
      const result = await getVisaDocumentUrl(application.id, document, accessToken);
      if (!result.url.startsWith('https://')) throw new Error('The document service returned an invalid link.');
      await Linking.openURL(result.url);
    } catch (reason) {
      setOpeningError(reason instanceof Error ? reason.message : 'The document could not be opened.');
    } finally {
      setOpening('');
    }
  };

  return <View style={styles.section}>
    <View style={styles.headingRow}>
      <View style={styles.headingCopy}>
        <Text style={styles.eyebrow}>YOUR VISA RECORDS</Text>
        <Text style={styles.title}>Applications</Text>
      </View>
      {accessToken ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Refresh visa applications" onPress={() => setAttempt((value) => value + 1)} style={styles.refreshButton}>
        <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
      </TouchableOpacity> : null}
    </View>
    {!accessToken ? <View style={styles.state}>
      <Text style={styles.body}>Sign in to view submitted applications and documents.</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => { blurWebNavigationFocus(); router.push('/login'); }} style={styles.retryButton}><Text style={styles.retryText}>Sign in</Text></TouchableOpacity>
    </View> : loading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : error && applications.length === 0 ? <View style={styles.state}>
      <Text style={styles.body}>{error}</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)} style={styles.retryButton}><Text style={styles.retryText}>Try again</Text></TouchableOpacity>
    </View> : applications.length === 0 ? <Text style={styles.body}>Submitted visa applications will appear here.</Text> : <>
      {error || openingError ? <Text style={styles.error}>{openingError || error}</Text> : null}
      {applications.map((application) => <View key={application.id} style={styles.application}>
        <View style={styles.applicationTop}>
          <View style={styles.applicationTitle}>
            <Text style={styles.country}>{application.country}</Text>
            <Text style={styles.visaType}>{application.visaType}</Text>
          </View>
          <Text style={styles.status}>{application.status}</Text>
        </View>
        <Text style={styles.reference}>Reference {application.referenceId}</Text>
        <Text style={styles.date}>{new Date(application.createdAt).toLocaleDateString()}</Text>
        <View style={styles.documents}>
          {(Object.keys(documentLabels) as VisaDocumentKey[]).map((document) => application.documents[document] ? <TouchableOpacity
            key={document}
            accessibilityRole="button"
            accessibilityLabel={`Open ${documentLabels[document]}`}
            disabled={Boolean(opening)}
            onPress={() => void openDocument(application, document)}
            style={[styles.documentButton, Boolean(opening) && styles.dimmed]}
          >
            {opening === `${application.id}:${document}` ? <ActivityIndicator size="small" color={Colors.primary} /> : <Ionicons name="document-text-outline" size={15} color={Colors.primary} />}
            <Text style={styles.documentText}>{documentLabels[document]}</Text>
          </TouchableOpacity> : null)}
        </View>
      </View>)}
    </>}
  </View>;
}

const styles = StyleSheet.create({
  section: { marginHorizontal: Ui.space.page, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headingCopy: { gap: 3 },
  eyebrow: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, letterSpacing: 0.8 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold },
  refreshButton: { minHeight: 44,  width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Ui.radius.control, backgroundColor: Colors.surface },
  body: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19 },
  loader: { marginVertical: 18 },
  state: { alignItems: 'flex-start', gap: 8 },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: Ui.radius.control, backgroundColor: Colors.accent },
  retryText: { color: Colors.primaryDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  error: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginBottom: 8 },
  application: { marginTop: 8, padding: 13, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.surface },
  applicationTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  applicationTitle: { flex: 1, minWidth: 0 },
  country: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  visaType: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.body, lineHeight: 19, marginTop: 2 },
  status: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, textTransform: 'capitalize' },
  reference: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, marginTop: 8 },
  date: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, marginTop: 3 },
  documents: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 11 },
  documentButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, backgroundColor: Colors.background },
  documentText: { color: Colors.primary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  dimmed: { opacity: 0.6 },
});
