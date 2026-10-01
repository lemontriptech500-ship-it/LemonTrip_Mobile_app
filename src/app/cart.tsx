import { Colors } from '@/constants/colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { removeFromCart, useCart } from '@/utils/cartStore';

type PassengerForm = { title: string; firstName: string; lastName: string; email: string; mobile: string; dateOfBirth: string; gender: string; nationality: string; documentNumber: string };
type Errors = Partial<Record<keyof PassengerForm, string>>;

const initialForm: PassengerForm = { title: '', firstName: '', lastName: '', email: '', mobile: '', dateOfBirth: '', gender: '', nationality: '', documentNumber: '' };
const titles = ['Mr', 'Ms', 'Mrs', 'Mx'];
const genders = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];

export default function CartScreen() {
  const cart = useCart();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const requiresTravelDetails = cart.some((item) => item.serviceName.toLowerCase().includes('flight'));

  const totalLabel = useMemo(() => cart.length === 1 ? cart[0].price : `${cart.length} items`, [cart]);

  const updateField = (field: keyof PassengerForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: Errors = {};
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!form.mobile.trim() || form.mobile.replace(/\D/g, '').length < 7) nextErrors.mobile = 'Enter a valid mobile number.';
    if (!form.title) nextErrors.title = 'Select a title.';
    if (!form.firstName.trim()) nextErrors.firstName = 'Enter the passenger first name.';
    if (!form.lastName.trim()) nextErrors.lastName = 'Enter the passenger last name.';
    if (requiresTravelDetails) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)) nextErrors.dateOfBirth = 'Use YYYY-MM-DD.';
      if (!form.gender) nextErrors.gender = 'Select a gender.';
      if (!form.nationality.trim()) nextErrors.nationality = 'Enter the passenger nationality.';
      if (!form.documentNumber.trim()) nextErrors.documentNumber = 'Enter the travel document number.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) router.push('/payment');
  };

  if (!cart.length) {
    return <SafeAreaView style={styles.safeArea}><View style={styles.emptyState}><View style={styles.emptyIcon}><Ionicons name="bag-handle-outline" size={27} color={Colors.primary} /></View><Text style={styles.emptyTitle}>Your trip cart is empty</Text><Text style={styles.emptyText}>Browse flights, hotels, and packages to add a journey.</Text><TouchableOpacity onPress={() => router.push('/(tabs)/explore')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Browse journeys</Text></TouchableOpacity></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <ScreenHeader title="Passenger details" subtitle="Tell us who is travelling. We only ask for what your booking needs." eyebrow="CHECKOUT / PASSENGER" onBack={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} />
          <ProgressStep />
          <View style={[styles.layout, desktop && styles.layoutDesktop]}>
            <View style={styles.formColumn}>
              <FormSection eyebrow="CONTACT DETAILS" title="How can we reach you?" icon="mail-outline">
                <Field label="Email" value={form.email} placeholder="you@example.com" keyboardType="email-address" error={errors.email} onChangeText={(value) => updateField('email', value)} />
                <Field label="Mobile" value={form.mobile} placeholder="Your mobile number" keyboardType="phone-pad" error={errors.mobile} onChangeText={(value) => updateField('mobile', value)} />
              </FormSection>

              <FormSection eyebrow="PASSENGER" title="Who is travelling?" icon="person-outline">
                <Text style={styles.fieldLabel}>Title</Text><View style={styles.choiceRow}>{titles.map((title) => <TouchableOpacity key={title} onPress={() => updateField('title', title)} style={[styles.choice, form.title === title && styles.choiceActive]}><Text style={[styles.choiceText, form.title === title && styles.choiceTextActive]}>{title}</Text></TouchableOpacity>)}</View>{errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
                <View style={styles.nameRow}><View style={styles.nameField}><Field label="First name" value={form.firstName} placeholder="First name" error={errors.firstName} onChangeText={(value) => updateField('firstName', value)} /></View><View style={styles.nameField}><Field label="Last name" value={form.lastName} placeholder="Last name" error={errors.lastName} onChangeText={(value) => updateField('lastName', value)} /></View></View>
                {requiresTravelDetails ? <><View style={styles.nameRow}><View style={styles.nameField}><Field label="Date of birth" value={form.dateOfBirth} placeholder="YYYY-MM-DD" error={errors.dateOfBirth} onChangeText={(value) => updateField('dateOfBirth', value)} /></View><View style={styles.nameField}><Text style={styles.fieldLabel}>Gender</Text><View style={styles.choiceRow}><TouchableOpacity onPress={() => updateField('gender', 'Female')} style={[styles.choice, form.gender === 'Female' && styles.choiceActive]}><Text style={[styles.choiceText, form.gender === 'Female' && styles.choiceTextActive]}>F</Text></TouchableOpacity><TouchableOpacity onPress={() => updateField('gender', 'Male')} style={[styles.choice, form.gender === 'Male' && styles.choiceActive]}><Text style={[styles.choiceText, form.gender === 'Male' && styles.choiceTextActive]}>M</Text></TouchableOpacity></View>{errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}</View></View><Field label="Nationality" value={form.nationality} placeholder="Nationality" error={errors.nationality} onChangeText={(value) => updateField('nationality', value)} /><Field label="Travel document number" value={form.documentNumber} placeholder="Passport or required travel document" error={errors.documentNumber} onChangeText={(value) => updateField('documentNumber', value)} autoCapitalize="characters" /></> : null}
              </FormSection>

              <View style={styles.trustNote}><Ionicons name="shield-checkmark-outline" size={19} color={Colors.secondary} /><View style={styles.trustCopy}><Text style={styles.trustTitle}>Your details are handled securely</Text><Text style={styles.trustText}>We only collect information required to process this booking and share it with the relevant travel provider.</Text></View></View>
            </View>
            <View style={styles.summaryColumn}><BookingSummary cart={cart} totalLabel={totalLabel} onRemove={removeFromCart} /><View style={styles.desktopContinue}><ContinueButton onPress={handleContinue} /></View></View>
          </View>
        </View>
      </ScrollView>
      <View style={[styles.mobileFooter, !desktop && styles.mobileFooterVisible]}><View><Text style={styles.totalCaption}>TOTAL</Text><Text style={styles.totalValue}>{totalLabel}</Text></View><View style={styles.mobileCta}><ContinueButton onPress={handleContinue} /></View></View>
    </SafeAreaView>
  );
}

function ProgressStep() { return <View style={styles.progress}>{['Search', 'Select', 'Passenger', 'Payment', 'Confirmation'].map((step, index) => <View key={step} style={styles.progressItem}><View style={[styles.progressDot, index <= 2 && styles.progressDotActive]}><Text style={[styles.progressNumber, index <= 2 && styles.progressNumberActive]}>{index + 1}</Text></View><Text style={[styles.progressLabel, index === 2 && styles.progressLabelActive]}>{step}</Text>{index < 4 ? <View style={[styles.progressLine, index < 2 && styles.progressLineActive]} /> : null}</View>)}</View>; }

function FormSection({ eyebrow, title, icon, children }: { eyebrow: string; title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode }) { return <View style={styles.formSection}><View style={styles.sectionHeading}><View style={styles.sectionIcon}><Ionicons name={icon} size={18} color={Colors.primary} /></View><View><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.sectionTitle}>{title}</Text></View></View>{children}</View>; }

function Field({ label, value, placeholder, error, onChangeText, keyboardType = 'default', autoCapitalize = 'words' }: { label: string; value: string; placeholder: string; error?: string; onChangeText: (value: string) => void; keyboardType?: 'default' | 'email-address' | 'phone-pad'; autoCapitalize?: 'none' | 'words' | 'characters' }) { return <View style={styles.field}><View style={[styles.inputWrap, error && styles.inputError]}><Text style={styles.floatingLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.textLight} autoCapitalize={autoCapitalize} keyboardType={keyboardType} autoCorrect={false} style={styles.input} /></View>{error ? <Text style={styles.errorText}>{error}</Text> : null}</View>; }

function BookingSummary({ cart, totalLabel, onRemove }: { cart: ReturnType<typeof useCart>; totalLabel: string; onRemove: (id: string) => void }) { return <View style={styles.summary}><View style={styles.summaryHeading}><View><Text style={styles.eyebrow}>YOUR TRIP</Text><Text style={styles.summaryTitle}>Booking summary</Text></View><Ionicons name="receipt-outline" size={21} color={Colors.primary} /></View>{cart.map((item) => <View key={item.id} style={styles.summaryItem}><View style={styles.summaryIcon}><Ionicons name={item.serviceName.toLowerCase().includes('flight') ? 'airplane-outline' : 'ticket-outline'} size={18} color={Colors.primary} /></View><View style={styles.summaryCopy}><Text style={styles.summaryService}>{item.serviceName}</Text><Text style={styles.summaryName} numberOfLines={3}>{item.itemName}</Text><Text style={styles.summaryPrice}>{item.price}</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove ${item.itemName}`} onPress={() => onRemove(item.id)}><Ionicons name="close-circle-outline" size={18} color={Colors.textLight} /></TouchableOpacity></View>)}<View style={styles.summaryTotal}><Text style={styles.totalCaption}>TOTAL</Text><Text style={styles.totalValue}>{totalLabel}</Text></View></View>; }

function ContinueButton({ onPress }: { onPress: () => void }) { return <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.continueButton}><Text style={styles.continueText}>Continue to payment</Text><Ionicons name="arrow-forward" size={16} color={Colors.primaryDark} /></TouchableOpacity>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  page: { paddingBottom: 30 },
  content: { width: '100%', maxWidth: 1160, alignSelf: 'center' },
  progress: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 5 },
  progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: { width: 27, height: 27, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  progressDotActive: { backgroundColor: Colors.primary },
  progressNumber: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '900' },
  progressNumberActive: { color: Colors.white },
  progressLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, marginTop: 5 },
  progressLabelActive: { color: Colors.primary, fontWeight: '900' },
  progressLine: { position: 'absolute', top: 13, left: '61%', right: '-39%', height: 1, backgroundColor: Colors.border },
  progressLineActive: { backgroundColor: Colors.primary },
  layout: { gap: 15, paddingHorizontal: 16 },
  layoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  formColumn: { flex: 1, minWidth: 0, gap: 14 },
  summaryColumn: { width: 320, gap: 12 },
  formSection: { padding: 17, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, backgroundColor: Colors.surface },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 17 },
  sectionIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.accentSoft },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  sectionTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 3 },
  field: { marginBottom: 12 },
  inputWrap: { minHeight: 57, justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 7, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, backgroundColor: Colors.background },
  inputError: { borderColor: Colors.error, backgroundColor: '#fffafa' },
  floatingLabel: { position: 'absolute', left: 12, top: 8, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '800' },
  input: { minHeight: 25, padding: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11 },
  errorText: { color: Colors.error, fontFamily: 'Manrope', fontSize: 9, lineHeight: 13, marginTop: 4 },
  fieldLabel: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', marginBottom: 7 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { minWidth: 42, minHeight: 34, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: Colors.border, borderRadius: 9, backgroundColor: Colors.background },
  choiceActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  choiceText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  choiceTextActive: { color: Colors.white },
  nameRow: { flexDirection: 'row', gap: 9 },
  nameField: { flex: 1, minWidth: 0 },
  trustNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, padding: 14, borderRadius: 14, backgroundColor: Colors.surfaceMuted },
  trustCopy: { flex: 1 },
  trustTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  trustText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 9, lineHeight: 14, marginTop: 3 },
  summary: { padding: 17, borderWidth: 1, borderColor: Colors.border, borderRadius: 17, backgroundColor: Colors.surface },
  summaryHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900', marginTop: 3 },
  summaryItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accentSoft },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryService: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900' },
  summaryName: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, lineHeight: 14, fontWeight: '800', marginTop: 3 },
  summaryPrice: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900', marginTop: 5 },
  summaryTotal: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 14 },
  totalCaption: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, fontWeight: '900', letterSpacing: 0.9 },
  totalValue: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },
  desktopContinue: { marginTop: 1 },
  continueButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 13, borderRadius: 11, backgroundColor: Colors.accent },
  continueText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 11, fontWeight: '900' },
  mobileFooter: { display: 'none', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  mobileFooterVisible: { display: 'flex' },
  mobileCta: { flex: 1, maxWidth: 230 },
  primaryButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 15, paddingHorizontal: 16, borderRadius: 11, backgroundColor: Colors.accent },
  primaryButtonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '900' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: Colors.accentSoft },
  emptyTitle: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 18, fontWeight: '900', marginTop: 16 },
  emptyText: { maxWidth: 300, color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 5 },
});
