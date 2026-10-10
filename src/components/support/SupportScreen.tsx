import { AppScreen } from '@/components/AppScreen';
import { Colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function SupportScreen({ title, children, footer, scroll = true }: { title: string; children: ReactNode; footer?: ReactNode; scroll?: boolean }) {
  return <AppScreen edges={['top', 'bottom']}><View style={{ flex: 1, backgroundColor: Colors.primaryDark }}><View style={supportStyles.header}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={supportStyles.back} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile'); }}><Ionicons name="chevron-back" size={20} color={Colors.white} /></TouchableOpacity><Text accessibilityRole="header" style={supportStyles.headerTitle}>{title}</Text></View>
    <KeyboardAvoidingView style={supportStyles.canvas} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={supportStyles.page}>{children}</ScrollView> : children}
      {footer ? <View style={supportStyles.footer}>{footer}</View> : null}
    </KeyboardAvoidingView></View>
  </AppScreen>;
}
export function SupportRow({ title, icon, route, onPress }: { title: string; icon: ComponentProps<typeof Ionicons>['name']; route?: Href; onPress?: () => void }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} style={supportStyles.row} onPress={onPress ?? (() => { if (route) router.push(route); })}><View style={supportStyles.icon}><Ionicons name={icon} size={20} color={Colors.primary} /></View><Text style={supportStyles.rowTitle}>{title}</Text><Ionicons name="chevron-forward" size={16} color={Colors.textLight} /></TouchableOpacity>;
}
export const supportStyles = StyleSheet.create({
  header: { minHeight: 70, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primaryDark }, back: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.onDarkSubtle, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: Colors.white, fontFamily: 'Manrope', fontSize: 18, fontWeight: '700', flex: 1 },
  canvas: { flex: 1, borderTopLeftRadius: 22, borderTopRightRadius: 22, overflow: 'hidden', backgroundColor: Colors.background },
  page: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 18, gap: 16, paddingBottom: 30 }, footer: { width: '100%', maxWidth: 640, alignSelf: 'center', padding: 16 },
  card: { padding: 16, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12 },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, backgroundColor: Colors.surfaceMuted }, icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.borderStrong }, rowTitle: { flex: 1, fontFamily: 'Manrope', fontSize: 14, color: Colors.textDark },
  title: { fontFamily: 'Manrope', fontSize: 17, fontWeight: '800', color: Colors.textDark }, body: { fontFamily: 'Manrope', fontSize: 13, lineHeight: 20, color: Colors.textLight },
  input: { minHeight: 46, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderStrong, color: Colors.textDark, fontFamily: 'Manrope', fontSize: 13 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Colors.accent, paddingHorizontal: 16 }, buttonText: { color: Colors.primaryDark, fontFamily: 'Manrope', fontSize: 14, fontWeight: '800' }, error: { fontFamily: 'Manrope', fontSize: 13, color: Colors.error, lineHeight: 20 },
});
