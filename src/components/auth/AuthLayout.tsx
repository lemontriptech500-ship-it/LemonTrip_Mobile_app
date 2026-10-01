import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  onBack: () => void;
  children: ReactNode;
};

type AuthFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secure?: boolean;
  onToggleSecure?: () => void;
};

export function AuthLayout({ eyebrow, title, subtitle, onBack, children }: AuthLayoutProps) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.layout, desktop && styles.layoutDesktop]}>
          {desktop ? <TravelVisual style={styles.desktopVisual} /> : null}
          <View style={styles.formPane}>
            {!desktop ? <TravelVisual style={styles.mobileVisual} compact /> : null}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={[styles.formScrollContent, desktop && styles.formScrollContentDesktop]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <View style={styles.formWrap}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={18} color={Colors.primaryDark} />
                </TouchableOpacity>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {children}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TravelVisual({ style, compact = false }: { style: object; compact?: boolean }) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=90' }}
      resizeMode="cover"
      style={[styles.visual, style]}
      imageStyle={styles.visualImage}>
      <View style={styles.visualShade} />
      <View style={[styles.visualCopy, compact && styles.visualCopyCompact]}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>L</Text></View>
          <Text style={styles.brandName}>LemonTrip</Text>
        </View>
        {!compact ? (
          <View style={styles.visualMessage}>
            <Text style={styles.visualEyebrow}>YOUR NEXT STORY IS OUT THERE</Text>
            <Text style={styles.visualTitle}>Make room for somewhere new.</Text>
            <Text style={styles.visualSubtitle}>Thoughtful travel starts with a single step.</Text>
          </View>
        ) : null}
      </View>
    </ImageBackground>
  );
}

export function AuthField({
  label,
  value,
  placeholder,
  onChangeText,
  error,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  secure = false,
  onToggleSecure,
}: AuthFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          autoCorrect={false}
          style={styles.input}
        />
        {onToggleSecure ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={secure ? 'Show password' : 'Hide password'} onPress={onToggleSecure} style={styles.visibilityButton}>
            <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={17} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function GoogleAuthButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={styles.googleButton}>
      <View style={styles.googleMark}><Text style={styles.googleMarkText}>G</Text></View>
      <Text style={styles.googleButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function AuthLegalLinks({ onTerms, onPrivacy }: { onTerms: () => void; onPrivacy: () => void }) {
  return (
    <View style={styles.legalRow}>
      <Text style={styles.legalText}>By continuing, you agree to our </Text>
      <TouchableOpacity onPress={onTerms}><Text style={styles.legalLink}>Terms</Text></TouchableOpacity>
      <Text style={styles.legalText}> and </Text>
      <TouchableOpacity onPress={onPrivacy}><Text style={styles.legalLink}>Privacy Policy</Text></TouchableOpacity>
      <Text style={styles.legalText}>.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoiding: { flex: 1 },
  layout: { flex: 1 },
  layoutDesktop: { flexDirection: 'row' },
  visual: { overflow: 'hidden', backgroundColor: Colors.primaryDark },
  desktopVisual: { flex: 1.05, minWidth: 0 },
  mobileVisual: { height: 132 },
  visualImage: {},
  visualShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5, 35, 23, 0.38)' },
  visualCopy: { flex: 1, justifyContent: 'space-between', padding: 30 },
  visualCopyCompact: { justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 13 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Colors.accent },
  brandMarkText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  brandName: { color: Colors.white, fontFamily: 'Manrope', fontSize: 16, fontWeight: '900' },
  visualMessage: { maxWidth: 480, paddingBottom: 22 },
  visualEyebrow: { color: Colors.accent, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  visualTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 34, lineHeight: 41, fontWeight: '900', marginTop: 9 },
  visualSubtitle: { color: 'rgba(255,255,255,0.86)', fontFamily: 'Manrope', fontSize: 12, marginTop: 9 },
  formPane: { flex: 1, minWidth: 0, backgroundColor: Colors.background },
  formScroll: { flex: 1 },
  formScrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  formScrollContentDesktop: { paddingHorizontal: 38 },
  formWrap: { width: '100%', maxWidth: 430, alignSelf: 'center' },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 14, marginLeft: -7, borderRadius: 11, backgroundColor: Colors.surface },
  eyebrow: { color: Colors.secondary, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 26, lineHeight: 32, fontWeight: '900', marginTop: 5 },
  subtitle: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 11, lineHeight: 17, marginTop: 4, marginBottom: 20 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 9, fontWeight: '800', marginBottom: 6 },
  inputWrap: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 11, backgroundColor: Colors.surface },
  inputWrapError: { borderColor: Colors.error },
  input: { flex: 1, minWidth: 0, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 11, paddingHorizontal: 12, paddingVertical: 10 },
  visibilityButton: { width: 40, height: 42, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.error, fontFamily: 'Manrope', fontSize: 9, marginTop: 4 },
  googleButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, backgroundColor: Colors.surface },
  googleMark: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  googleMarkText: { color: '#4285F4', fontFamily: 'Manrope', fontSize: 17, fontWeight: '900' },
  googleButtonText: { color: Colors.textDark, fontFamily: 'Manrope', fontSize: 10, fontWeight: '800' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 },
  legalText: { color: Colors.textLight, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13 },
  legalLink: { color: Colors.primary, fontFamily: 'Manrope', fontSize: 8, lineHeight: 13, fontWeight: '800' },
});