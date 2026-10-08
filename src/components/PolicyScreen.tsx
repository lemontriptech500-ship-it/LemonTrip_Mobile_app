import { AppScreen } from '@/components/AppScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type PolicyProps = { title: string; introduction: string; sections: { title: string; paragraphs: string[] }[] };
export function PolicyScreen({ title, introduction, sections }: PolicyProps) {
  return <AppScreen><ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
    <ScreenHeader title={title} subtitle="Clear information for your journey." eyebrow="LEMONTRIP" onBack={() => router.canGoBack() ? router.back() : router.replace('/settings')} />
    <View style={styles.content}><Text style={styles.introduction}>{introduction}</Text>{sections.map(section => <View key={section.title} style={styles.section}><Text style={styles.title}>{section.title}</Text>{section.paragraphs.map(paragraph => <Text key={paragraph} selectable style={styles.copy}>{paragraph}</Text>)}</View>)}</View>
  </ScrollView></AppScreen>;
}
const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingBottom: 24 }, content: { paddingHorizontal: 18, gap: 14 }, introduction: { fontFamily: 'Manrope', fontSize: 15, lineHeight: 24, color: Colors.textDark, marginBottom: 10 }, section: { ...Ui.card, padding: 20 }, title: { fontFamily: 'Manrope', fontSize: 18, fontWeight: '800', color: Colors.primary, marginBottom: 10 }, copy: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 23, color: Colors.textLight, marginBottom: 6 },
});
