import { BrandMotif } from '@/components/BrandMotif';
import { Colors } from '@/constants/colors';
import { StyleSheet, Text, View, type ReactNode } from 'react-native';

export function ExploreSectionIntro({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.container}>
      <BrandMotif />
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
    backgroundColor: Colors.primaryDark,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  eyebrow: {
    color: Colors.accent,
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: Colors.white,
    fontFamily: 'Manrope',
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    color: Colors.onDarkMuted,
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
});
