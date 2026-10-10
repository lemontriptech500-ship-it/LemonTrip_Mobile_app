import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text, TextInput } from '@/components/ui/Text';
import { VisaHeader, visaCountryFlag } from '@/components/visa/VisaHeader';
import { Colors } from '@/constants/colors';
import type { VisaCountry } from '@/types/content';
import { getAccessToken, useAuth } from '@/utils/authStore';
import { getVisaServices, visaApiConfigured, visaApiRoot } from '@/utils/visaService';
import { blurWebNavigationFocus } from '@/utils/webNavigationFocus';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { AppScreen as SafeAreaView } from '@/components/AppScreen';

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
  const [step, setStep] = useState<'service' | 'application' | 'documents'>('service');
  const [destination, setDestination] = useState<VisaCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [files, setFiles] = useState<Partial<Record<UploadKey, Upload>>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState('');
  const scroll = useRef<ScrollView>(null);
  const submitting = useRef(false);
  const submissionKey = useRef('');

  useEffect(() => { submissionKey.current = ''; }, [fullName, email, dateOfBirth, passportNumber, entryDate, files]);
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

  const validateDetails = () => {
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    const birthDate = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ? new Date(`${dateOfBirth}T00:00:00Z`) : null;
    if (!birthDate || Number.isNaN(birthDate.getTime()) || birthDate.toISOString().slice(0, 10) !== dateOfBirth || birthDate.getTime() > Date.now()) next.dateOfBirth = 'Enter a valid date of birth (YYYY-MM-DD).';
    if (passportNumber.trim().length < 3) next.passportNumber = 'Enter your passport number.';
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(entryDate) ? new Date(`${entryDate}T00:00:00Z`) : null;
    const validCalendarDate = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === entryDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!validCalendarDate || parsedDate!.getTime() < Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) next.entryDate = 'Enter a valid date that is today or later (YYYY-MM-DD).';
    return next;
  };

  const submit = async () => {
    const next = validateDetails();
    (Object.keys(uploadSpecs) as UploadKey[]).forEach((key) => { if (!files[key]) next[key] = `Add ${uploadSpecs[key].title.toLowerCase()}.`; });
    setErrors(next); setNotice('');
    if (Object.keys(next).length) { if (Object.keys(validateDetails()).length) setStep('application'); return; }
    if (submitting.current) return;
    if (!destination) return;
    if (!visaApiConfigured || !visaApiRoot) { setNotice('Applications cannot be submitted in demo mode. Connect to the LemonTrip API to apply.'); return; }
    if (visaApiConfigured && !getAccessToken()) { setNotice('Sign in to your LemonTrip account before submitting this application.'); return; }
    submitting.current = true;
    setSaving(true);
    try {
      if (!submissionKey.current) submissionKey.current = `visa-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const form = new FormData();
      // The website visa API accepts the established nested multipart contract.
      form.append('serviceId', destination.id);
      form.append('personalDetails', JSON.stringify({ fullName: fullName.trim(), email: email.trim(), dateOfBirth }));
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
      const payload = await response.json().catch(() => null) as { error?: string | { message?: string }; data?: { applicationId?: string }; application?: { referenceId?: string } } | null;
      const referenceId = payload?.application?.referenceId ?? payload?.data?.applicationId;
      if (!response.ok || !referenceId) throw new Error((typeof payload?.error === 'string' ? payload.error : payload?.error?.message) ?? 'Your application could not be submitted. Please retry.');
      setReference(referenceId);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Submission failed. Please retry.'); }
    finally { submitting.current = false; setSaving(false); }
  };

  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (saving) return true;
      if (!reference && step !== 'service') { setStep(step === 'documents' ? 'application' : 'service'); scroll.current?.scrollTo({ y: 0, animated: false }); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [reference, saving, step]));
  const editField = (key: string, setter: (value: string) => void) => (value: string) => { setter(value); setErrors(current => ({ ...current, [key]: '' })); };
  const changeStep = (next: typeof step) => { setStep(next); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const back = () => { if (saving) return; if (!reference && step !== 'service') { changeStep(step === 'documents' ? 'application' : 'service'); return; } blurWebNavigationFocus(); if (router.canGoBack()) router.back(); else router.replace('/(tabs)/explore/visa'); };
  const nextStep = () => { if (step === 'service') changeStep('application'); else if (step === 'application') { const next = validateDetails(); setErrors(next); if (!Object.keys(next).length) changeStep('documents'); } else void submit(); };
  const openRecord = (view: 'tracking' | 'details') => router.replace({ pathname: '/visa-application/[id]', params: { id: reference, view } });
  return <SafeAreaView headerTone="light" style={styles.safe} edges={['top']}>
    <VisaHeader title={reference ? 'Application Details' : step === 'service' ? 'Service Details' : step === 'application' ? 'Application' : 'Document Upload'} onBack={back} />
    <ScrollView ref={scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {loading ? <ActivityIndicator accessibilityLabel="Loading service" color={Colors.secondary} /> : loadError ? <View style={styles.card}><Text style={styles.error}>{loadError}</Text><TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => { setLoading(true); setLoadError(''); setLoadAttempt(value => value + 1); }}><Text style={styles.buttonText}>Try again</Text></TouchableOpacity></View> : destination ? reference ? <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={36} color={Colors.secondary} /><Text style={styles.title}>Application submitted</Text><Text style={styles.copy}>Your documents and application have been received.</Text><Text selectable style={styles.reference}>{reference}</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.button} onPress={() => openRecord('tracking')}><Text style={styles.buttonText}>Track application</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => openRecord('details')}><Text style={styles.linkText}>View application details</Text></TouchableOpacity>
        </View> : <>
          {step === 'service' ? <View style={styles.card}>
            <View style={styles.serviceHeading}><Text style={styles.flag}>{visaCountryFlag(destination.name)}</Text><View style={styles.grow}><Text style={styles.title}>{destination.visaType}</Text><Text style={styles.copy}>{destination.name}</Text></View></View>
            <Text style={styles.copy}>Review the requirements for your destination before completing your application.</Text>
            <View style={styles.featureIcons}><Ionicons name="time-outline" size={20} color={Colors.secondary} /><Text style={styles.copy}>{destination.processing ?? 'Processing time not listed'}</Text></View>
            <Text style={styles.label}>Features & requirements</Text>
            {destination.documents.length ? destination.documents.map(doc => <View key={doc} style={styles.requirement}><Ionicons name="checkmark" size={16} color={Colors.secondary} /><Text style={[styles.copy, styles.grow]}>{doc}</Text></View>) : <Text style={styles.copy}>Contact an advisor for document requirements.</Text>}
            <View style={styles.priceRow}><Text style={styles.copy}>Service fee</Text><Text style={styles.price}>{destination.fee ?? 'Not listed'}</Text></View>
          </View> : step === 'application' ? <View style={styles.card}>
            <Field label="Full name" value={fullName} onChangeText={editField('fullName', setFullName)} error={errors.fullName} autoComplete="name" />
            <Field label="Date of birth" value={dateOfBirth} onChangeText={editField('dateOfBirth', setDateOfBirth)} error={errors.dateOfBirth} placeholder="YYYY-MM-DD" />
            <Field label="Passport number" value={passportNumber} onChangeText={editField('passportNumber', setPassportNumber)} error={errors.passportNumber} autoCapitalize="characters" />
            <Field label="Email address" value={email} onChangeText={editField('email', setEmail)} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
            <Field label="Travel date" value={entryDate} onChangeText={editField('entryDate', setEntryDate)} error={errors.entryDate} placeholder="YYYY-MM-DD" />
            <Text style={styles.label}>Visa option</Text><View style={styles.visaOption}><Text style={[styles.copy, styles.grow]}>{destination.visaType}</Text><Ionicons name="checkmark-circle" size={18} color={Colors.secondary} /></View>
          </View> : <>
            {(['applicantPhoto', 'passportFront', 'passportBack'] as UploadKey[]).map(key => <View key={key}>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Upload ${uploadSpecs[key].title}`} disabled={saving} style={styles.upload} onPress={() => void pick(key)}>
                <View style={styles.uploadIcon}><Ionicons name={files[key] ? 'checkmark-circle' : key === 'applicantPhoto' ? 'person-outline' : 'document-text-outline'} size={23} color={Colors.secondary} /></View>
                <View style={styles.grow}><Text style={styles.uploadTitle}>{key === 'applicantPhoto' ? 'Upload passport photo' : key === 'passportFront' ? 'Upload passport front' : 'Upload passport back'}</Text><Text numberOfLines={1} style={styles.copy}>{files[key]?.name ?? (key === 'applicantPhoto' ? 'JPG / PNG · up to 2 MB' : 'PDF / JPG / PNG · up to 5 MB')}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </TouchableOpacity>
              {files[key] ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${uploadSpecs[key].title}`} disabled={saving} style={styles.remove} onPress={() => setFiles(current => ({ ...current, [key]: undefined }))}><Text style={styles.linkText}>Remove file</Text></TouchableOpacity> : null}
              {errors[key] ? <Text style={styles.error}>{errors[key]}</Text> : null}
            </View>)}
          </>}
          {step !== 'service' && !user ? <View style={styles.auth}><Text style={styles.copy}>Sign in to submit your application.</Text><TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push('/login')}><Text style={styles.linkText}>Sign in</Text></TouchableOpacity></View> : null}
          {!visaApiConfigured && step !== 'service' ? <Text style={styles.copy}>Submission is unavailable in demo mode.</Text> : null}
          {notice ? <Text accessibilityRole="alert" style={styles.error}>{notice}</Text> : null}
        </> : null}
      </View>
    </ScrollView>
    {!loading && !loadError && destination && !reference ? <View style={styles.footer}><TouchableOpacity accessibilityRole="button" accessibilityLabel={step === 'documents' ? 'Upload documents and submit application' : 'Continue'} disabled={saving || (step === 'documents' && (!visaApiConfigured || !user))} onPress={nextStep} style={[styles.button, (saving || (step === 'documents' && (!visaApiConfigured || !user))) && styles.disabled]}>{saving ? <ActivityIndicator color={Colors.white} /> : null}<Text style={styles.buttonText}>{saving ? 'Uploading…' : step === 'service' ? 'Continue' : step === 'application' ? 'Continue to documents' : 'Upload & submit'}</Text></TouchableOpacity></View> : null}
  </SafeAreaView>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; error?: string; placeholder?: string; keyboardType?: 'default' | 'email-address'; autoComplete?: 'name'; autoCapitalize?: 'none' | 'characters' }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput accessibilityLabel={props.label} value={props.value} onChangeText={props.onChangeText} placeholder={props.placeholder ?? props.label} placeholderTextColor={Colors.textLight} keyboardType={props.keyboardType} autoComplete={props.autoComplete} autoCapitalize={props.autoCapitalize ?? 'none'} style={styles.input} />{props.error ? <Text style={styles.error}>{props.error}</Text> : null}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 }, page: { paddingBottom: 24 }, content: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  serviceHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 }, flag: { fontSize: TextSize.hero }, grow: { flex: 1, minWidth: 0 },
  title: { color: Colors.textDark, fontFamily: FontFamily.sans, fontWeight: FontWeight.extraBold, fontSize: TextSize.title }, copy: { color: Colors.textLight, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18 },
  featureIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 }, requirement: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: Colors.textDark, fontFamily: FontFamily.sans, fontWeight: FontWeight.bold, fontSize: TextSize.caption, marginBottom: 6 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 10, gap: 12, borderTopWidth: 1, borderTopColor: Colors.border }, price: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.title, fontWeight: FontWeight.extraBold, flexShrink: 1 },
  field: { marginBottom: 4 }, input: { minHeight: 44, borderWidth: 1, borderColor: Colors.borderStrong, borderRadius: 6, paddingHorizontal: 10, color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, backgroundColor: Colors.background },
  visaOption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 6 },
  upload: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  uploadIcon: { width: 40, height: 44, borderRadius: 6, backgroundColor: Colors.surfaceMuted, justifyContent: 'center', alignItems: 'center' }, uploadTitle: { color: Colors.textDark, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold },
  remove: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-end', paddingHorizontal: 8 },
  footer: { padding: 16, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
  button: { width: '100%', maxWidth: 608, alignSelf: 'center', minHeight: 48, flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: Colors.secondary }, buttonText: { color: Colors.white, fontFamily: FontFamily.sans, fontWeight: FontWeight.extraBold, fontSize: TextSize.body }, disabled: { opacity: 0.5 },
  secondaryButton: { minHeight: 44, justifyContent: 'center', alignItems: 'center' }, linkText: { color: Colors.secondary, fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold }, auth: { padding: 12, backgroundColor: Colors.surfaceMuted, borderRadius: 8 }, error: { color: Colors.error, fontFamily: FontFamily.sans, fontSize: TextSize.caption, lineHeight: 18, marginTop: 6 }, reference: { color: Colors.secondary, fontFamily: FontFamily.sans, fontWeight: FontWeight.extraBold, fontSize: TextSize.body },
});
