import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PolicyProps = { title: string; introduction: string; sections: { title: string; paragraphs: string[] }[] };

export function PolicyScreen({ title, introduction, sections }: PolicyProps) {
  const privacy = /privacy/i.test(title);
  // Sections start open; tapping a heading folds it away so long policies are easy to skim.
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const toggle = (key: string) => setClosed((current) => ({ ...current, [key]: !current[key] }));
  const allClosed = sections.length > 0 && sections.every((section) => closed[section.title]);
  const setAll = (value: boolean) => setClosed(Object.fromEntries(sections.map((section) => [section.title, value])));

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={title} subtitle="Clear information for your journey." eyebrow="LEMONTRIP / LEGAL" onBack={() => router.canGoBack() ? router.back() : router.replace('/settings')} />

        <View style={s.intro}>
          <View style={s.introIcon}><Ionicons name={privacy ? 'shield-checkmark-outline' : 'document-text-outline'} size={22} color={Colors.primaryDark} /></View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.introLabel}>IN SHORT</Text>
            <Text style={s.introText}>{introduction}</Text>
          </View>
        </View>

        <View style={s.toolbar}>
          <Text style={s.count}>{sections.length} section{sections.length === 1 ? '' : 's'}</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => setAll(!allClosed)} hitSlop={8}><Text style={s.toolbarLink}>{allClosed ? 'Expand all' : 'Collapse all'}</Text></TouchableOpacity>
        </View>

        {sections.map((section, index) => {
          const open = !closed[section.title];
          return (
            <View key={section.title} style={s.section}>
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={`${section.title}, section ${index + 1}`} onPress={() => toggle(section.title)} activeOpacity={0.75} style={s.sectionHead}>
                <View style={s.number}><Text style={s.numberText}>{String(index + 1).padStart(2, '0')}</Text></View>
                <Text style={s.sectionTitle}>{section.title}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
              </TouchableOpacity>
              {open ? <View style={s.sectionBody}>{section.paragraphs.map((paragraph) => <Text key={paragraph} selectable style={s.copy}>{paragraph}</Text>)}</View> : null}
            </View>
          );
        })}

        <View style={s.help}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.helpTitle}>Questions about this {privacy ? 'policy' : 'agreement'}?</Text>
            <Text style={s.helpText}>Our team is happy to explain anything in plain words.</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Contact support" onPress={() => router.push('/contact' as Href)} style={s.helpButton}>
            <Text style={s.helpButtonText}>Contact us</Text>
            <Ionicons name="arrow-forward" size={15} color={Colors.primaryDark} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const s = StyleSheet.create({
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 28 },
  intro: { flexDirection: 'row', gap: 14, marginHorizontal: Ui.space.page, marginBottom: 16, padding: 18, borderRadius: Ui.radius.card, backgroundColor: Colors.accentSoft },
  introIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.accent },
  introLabel: { ...Ui.eyebrow, color: Colors.secondary, marginBottom: 4 },
  introText: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22, color: Colors.textDark },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: Ui.space.page + 4, marginBottom: 10 },
  count: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '700', color: Colors.textLight },
  toolbarLink: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primary },
  section: { ...Ui.card, marginHorizontal: Ui.space.page, marginBottom: 10, overflow: 'hidden' },
  sectionHead: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  number: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceMuted },
  numberText: { fontFamily: 'Manrope', fontSize: 12, fontWeight: '800', color: Colors.primary },
  sectionTitle: { flex: 1, fontFamily: 'Manrope', fontSize: 16, fontWeight: '800', color: Colors.textDark },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, paddingLeft: 62 },
  copy: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 23, color: Colors.textLight, marginBottom: 8 },
  help: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Ui.space.page, marginTop: 6, padding: 16, borderRadius: Ui.radius.card, backgroundColor: Colors.primaryDark },
  helpTitle: { fontFamily: 'Manrope', fontSize: 15, fontWeight: '800', color: Colors.white },
  helpText: { fontFamily: 'Manrope', fontSize: 12, lineHeight: 18, color: Colors.onDarkMuted, marginTop: 3 },
  helpButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 14, backgroundColor: Colors.accent },
  helpButtonText: { fontFamily: 'Manrope', fontSize: 13, fontWeight: '800', color: Colors.primaryDark },
});