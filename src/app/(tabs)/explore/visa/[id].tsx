import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import type { VisaCountry } from '@/types/content';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getVisaServices, openVisaApplicationDocument, visaApiConfigured, visaApiRoot } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Upload = { name: string; mimeType: string; size: number; uri: string };
type UploadKey = 'passportFront' | 'passportBack' | 'applicantPhoto';
const uploadSpecs: Record<UploadKey, { title: string; limit: number; types: string[]; extensions: string[] }> = {
  passportFront: { title: 'Passport front', limit: 5 * 1024 * 1024, types: ['application/pdf', 'image/jpeg', 'image/png'], extensions: ['pdf', 'jpg', 'jpeg', 'png'] },
  passportBack: { title: 'Passport back', limit: 5 * 1024 * 1024, types: ['application/pdf', 'image/jpeg', 'image/png'], extensions: ['pdf', 'jpg', 'jpeg', 'png'] },
  applicantPhoto: { title: 'Applicant photograph', limit: 2 * 1024 * 1024, types: ['image/jpeg', 'image/png'], extensions: ['jpg', 'jpeg', 'png'] },
};
function mimeFor(name: string, supplied?: string | null) {
  if (supplied && supplied !== 'application/octet-stream') return supplied;
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return supplied ?? '';
}

export default function VisaApplicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuth();
  const [destination, setDestination] = useState<VisaCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [files, setFiles] = useState<Partial<Record<UploadKey, Upload>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState('');
  const [openingDocument, setOpeningDocument] = useState<UploadKey | null>(null);
  const submitting = useRef(false);
  const submissionKey = useRef('');

  useEffect(() => { if (user) { setFullName(user.name); setEmail(user.email ?? ''); } }, [user]);
  useEffect(() => {
    let active = true;
    getVisaServices().then((services) => {
      const match = services.find((item) => item.id === id);
      if (!match) throw new Error('This visa destination is no longer available.');
      return match;
    }).then((item) => { if (active) { setDestination(item); setLoading(false); } }).catch((error: unknown) => {
      if (active) { setLoadError(error instanceof Error ? error.message : 'Could not load visa information.'); setLoading(false); }
    });
    return () => { active = false; };
  }, [id, loadAttempt]);

  const pick = async (key: UploadKey) => {
    const spec = uploadSpecs[key];
    setErrors((current) => ({ ...current, [key]: '' }));
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: spec.types, copyToCacheDirectory: true });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const mimeType = mimeFor(asset.name, asset.mimeType);
      if (!spec.types.includes(mimeType) || !spec.extensions.includes(asset.name.split('.').pop()?.toLowerCase() ?? '')) {
        setErrors((current) => ({ ...current, [key]: `Choose a ${spec.extensions.join(', ').toUpperCase()} file.` })); return;
      }
      if (!asset.size || asset.size > spec.limit) { setErrors((current) => ({ ...current, [key]: `File must be no larger than ${key === 'applicantPhoto' ? '2 MB' : '5 MB'}.` })); return; }
      setFiles((current) => ({ ...current, [key]: { name: asset.name, mimeType, size: asset.size!, uri: asset.uri } }));
    } catch (error) { setErrors((current) => ({ ...current, [key]: error instanceof Error ? error.message : 'Could not select this file.' })); }
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (passportNumber.trim().length < 3) next.passportNumber = 'Enter your passport number.';
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(entryDate) ? new Date(`${entryDate}T00:00:00Z`) : null;
    const validCalendarDate = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === entryDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!validCalendarDate || parsedDate!.getTime() < Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) next.entryDate = 'Enter a valid date that is today or later (YYYY-MM-DD).';
    (Object.keys(uploadSpecs) as UploadKey[]).forEach((key) => { if (!files[key]) next[key] = `Add ${uploadSpecs[key].title.toLowerCase()}.`; });
    setErrors(next); setNotice('');
    if (Object.keys(next).length || submitting.current) return;
    if (!destination) return;
    if (!visaApiConfigured || !visaApiRoot) { setNotice('Applications cannot be submitted in demo mode. Connect to the LemonTrip API to apply.'); return; }
    if (visaApiConfigured && !getAccessToken()) { setNotice('Sign in to your LemonTrip account before submitting this application.'); return; }
    submitting.current = true;
    setSaving(true);
    try {
      if (!visaApiConfigured || !visaApiRoot) {
        setReference(`MOCK-${Date.now().toString(36).toUpperCase()}`);
        return;
      }
      if (!submissionKey.current) submissionKey.current = `visa-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const form = new FormData();
      // The website visa API accepts the established nested multipart contract.
      form.append('serviceId', destination.id);
      form.append('personalDetails', JSON.stringify({ fullName: fullName.trim(), email: email.trim() }));
      form.append('passportDetails', JSON.stringify({ passportNumber: passportNumber.trim() }));
      form.append('travelDetails', JSON.stringify({ intendedEntryDate: entryDate }));
      for (const key of Object.keys(uploadSpecs) as UploadKey[]) {
        const file = files[key]!;
        if (Platform.OS === 'web') {
          const blob = await fetch(file.uri).then((result) => result.blob());
          form.append(key === 'applicantPhoto' ? 'photograph' : key, blob, file.name);
        } else {
          form.append(key === 'applicantPhoto' ? 'photograph' : key, { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
        }
      }
      const token = getAccessToken();
      const response = await fetch(`${visaApiRoot}/applications`, {
        method: 'POST', headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': submissionKey.current }, body: form,
      });
      const payload = await response.json().catch(() => null) as { error?: string; data?: { applicationId?: string }; application?: { referenceId?: string } } | null;
      const referenceId = payload?.application?.referenceId ?? payload?.data?.applicationId;
      if (!response.ok || !referenceId) throw new Error(payload?.error ?? 'Your application could not be submitted. Please retry.');
      setReference(referenceId);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Submission failed. Please retry.'); }
    finally { submitting.current = false; setSaving(false); }
  };

  const back = () => { blurWebNavigationFocus(); if (router.canGoBack()) router.back(); else router.replace('/(tabs)/explore/visa'); };
  return <SafeAreaView style={styles.safe} edges={['top']}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
    <View style={styles.content}><ScreenHeader title="Visa application" subtitle="Review destination requirements and submit your details securely." eyebrow="LEMONTRIP / VISA" onBack={back} />
      {loading ? <ActivityIndicator color={Colors.primary} style={styles.loader} /> : loadError ? <View><Text style={styles.messageError}>{loadError}</Text><TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); setLoadError(''); setLoadAttempt((attempt) => attempt + 1); }}><Text style={styles.pickText}>Try again</Text></TouchableOpacity></View> : destination ? <>
        {reference ? <View style={styles.confirmation}><Ionicons name="checkmark-circle" size={38} color={Colors.secondary} /><Text style={styles.title}>Application received</Text><Text style={styles.copy}>Your application was submitted. Reference ID:</Text><Text selectable style={styles.reference}>{reference}</Text><View style={styles.documentActions}>{(['passportFront', 'passportBack', 'applicantPhoto'] as UploadKey[]).map((key) => <TouchableOpacity key={key} disabled={openingDocument !== null} accessibilityRole="button" style={styles.documentButton} onPress={async () => { const token = getAccessToken(); if (!token) { setNotice('Sign in again to open your documents.'); return; } setOpeningDocument(key); try { await openVisaApplicationDocument(reference, key, token); setNotice(''); } catch (error) { setNotice(error instanceof Error ? error.message : 'The document could not be opened.'); } finally { setOpeningDocument(null); } }}>{openingDocument === key ? <ActivityIndicator size="small" color={Colors.primary}/> : <Ionicons name="document-text-outline" size={17} color={Colors.primary}/>}<Text style={styles.pickText}>Open {uploadSpecs[key].title}</Text></TouchableOpacity>)}</View>{notice ? <Text style={styles.messageError}>{notice}</Text> : null}</View> : <>
          <View style={styles.destination}><Text style={styles.eyebrow}>DESTINATION</Text><Text style={styles.title}>{destination.name}</Text><Text style={styles.copy}>{destination.visaType}</Text><View style={styles.meta}><Text style={styles.copy}>Processing: {destination.processing ?? 'Not listed'}</Text><Text style={styles.copy}>Guidance: {destination.fee ?? 'Price not listed'}</Text></View>
            <Text style={styles.label}>Required documents</Text>{destination.documents.length ? destination.documents.map((doc) => <Text key={doc} style={styles.copy}>• {doc}</Text>) : <Text style={styles.copy}>Requirements have not been published for this destination.</Text>}
          </View>
          {visaApiConfigured && !user ? <View style={styles.authNotice}><Text style={styles.copy}>Sign in is required to submit an application.</Text><TouchableOpacity style={styles.linkButton} onPress={() => { blurWebNavigationFocus(); router.push('/login'); }}><Text style={styles.buttonText}>Sign in</Text></TouchableOpacity></View> : null}
          <View style={styles.form}><Text style={styles.title}>Applicant details</Text>
            <Field label="Full name" value={fullName} onChangeText={setFullName} error={errors.fullName} autoComplete="name" />
            <Field label="Email address" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Passport number" value={passportNumber} onChangeText={setPassportNumber} error={errors.passportNumber} autoCapitalize="characters" />
            <Field label="Intended entry date" value={entryDate} onChangeText={setEntryDate} error={errors.entryDate} placeholder="YYYY-MM-DD" />
            {(Object.keys(uploadSpecs) as UploadKey[]).map((key) => <View key={key} style={styles.uploadBlock}><Text style={styles.label}>{uploadSpecs[key].title} <Text style={styles.hint}>({key === 'applicantPhoto' ? 'JPG/PNG, max 2 MB' : 'PDF/JPG/PNG, max 5 MB'})</Text></Text>
              {files[key] ? <View style={styles.fileRow}>{key !== 'passportFront' && key !== 'passportBack' && files[key]?.mimeType.startsWith('image/') ? <Image source={{ uri: files[key]!.uri }} style={styles.preview} /> : <Ionicons name="document-attach-outline" size={18} color={Colors.primary} />}<Text numberOfLines={1} style={styles.fileName}>{files[key]!.name}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Replace ${uploadSpecs[key].title}`} onPress={() => void pick(key)}><Text style={styles.pickText}>Replace</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${uploadSpecs[key].title}`} onPress={() => setFiles((current) => ({ ...current, [key]: undefined }))}><Ionicons name="close-circle" size={19} color={Colors.textLight} /></TouchableOpacity></View> : <TouchableOpacity style={styles.pickButton} onPress={() => void pick(key)}><Ionicons name="cloud-upload-outline" size={17} color={Colors.primary} /><Text style={styles.pickText}>Choose file</Text></TouchableOpacity>}
              {errors[key] ? <Text style={styles.error}>{errors[key]}</Text> : null}
            </View>)}
            {notice ? <Text style={styles.messageError}>{notice}</Text> : null}
            {!visaApiConfigured ? <Text style={styles.copy}>Demo mode supports browsing only. Connect to the API to submit applications.</Text> : null}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={saving ? 'Uploading and submitting visa application' : 'Submit visa application'} disabled={saving || !visaApiConfigured || !user} onPress={() => void submit()} style={[styles.submit, (saving || !visaApiConfigured || !user) && styles.disabled]}>{saving ? <View style={styles.progressRow}><ActivityIndicator color={Colors.primaryDark} /><Text style={styles.buttonText}>Uploading documents…</Text></View> : <Text style={styles.buttonText}>Submit application</Text>}</TouchableOpacity>
          </View>
        </>}
      </> : null}
    </View>
  </ScrollView></SafeAreaView>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; error?: string; placeholder?: string; keyboardType?: 'default' | 'email-address'; autoComplete?: 'name'; autoCapitalize?: 'none' | 'characters' }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder} placeholderTextColor={Colors.textLight} keyboardType={props.keyboardType} autoComplete={props.autoComplete} autoCapitalize={props.autoCapitalize} style={styles.input} />{props.error ? <Text style={styles.error}>{props.error}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, page: { paddingBottom: 32 }, content: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: 16 }, loader: { marginTop: 48 },
  destination: { padding: 18, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 }, eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontWeight: '800', fontSize: 10, letterSpacing: 1 }, title: { color: Colors.textDark, fontFamily: 'Manrope', fontWeight: '900', fontSize: 21, marginTop: 5 }, copy: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, marginTop: 4 }, meta: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 8 }, label: { color: Colors.textDark, fontFamily: 'Manrope', fontWeight: '800', fontSize: 13, marginTop: 14, marginBottom: 6 }, hint: { color: Colors.textLight, fontWeight: '400', fontSize: 11 },
  form: { padding: 18, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, field: { marginTop: 9 }, input: { minHeight: 46, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background, borderRadius: 10, paddingHorizontal: 12, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 14 }, error: { color: '#B42318', fontFamily: 'Manrope', fontSize: 11, marginTop: 4 }, uploadBlock: { marginTop: 3 }, pickButton: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.primary, borderRadius: 10 }, retryButton: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, backgroundColor: Colors.accent }, pickText: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 13, fontWeight: '800' }, fileRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, backgroundColor: Colors.background, borderRadius: 10 }, fileName: { flex: 1, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 12 }, preview: { width: 38, height: 38, borderRadius: 6 }, submit: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderRadius: 11, backgroundColor: Colors.accent }, buttonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontWeight: '900', fontSize: 14 }, disabled: { opacity: 0.55 }, messageError: { color: '#B42318', fontFamily: 'Manrope', fontSize: 13, marginVertical: 12 }, authNotice: { marginBottom: 12, padding: 14, borderRadius: 12, backgroundColor: Colors.surfaceMuted }, linkButton: { alignSelf: 'flex-start', paddingVertical: 8 }, confirmation: { alignItems: 'center', marginTop: 30, padding: 24, borderRadius: 16, backgroundColor: Colors.surface }, reference: { color: Colors.primary, fontFamily: 'Manrope', fontWeight: '900', fontSize: 15, marginTop: 8 }, documentActions: { alignSelf: 'stretch', gap: 8, marginTop: 18 }, documentButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.background }, progressRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
});
