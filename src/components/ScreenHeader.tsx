import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Ui } from '@/constants/theme';
import { BrandMotif } from '@/components/BrandMotif';
import { Colors } from '@/constants/colors';
import { LemonTripBrand } from '@/components/BrandGradientBar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  eyebrow?: string;
  rightAction?: {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
  };
};

export function ScreenHeader({ title, subtitle, onBack, eyebrow, rightAction }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <BrandMotif />
      <View style={styles.brandBar}>
        <View style={styles.actions}>
          {onBack ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : <View style={styles.iconSpacer} />}
          <LemonTripBrand size={44} />
          <View style={styles.actionSpacer} />
          {rightAction ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={rightAction.label}
              onPress={rightAction.onPress}
              style={styles.rightAction}>
              <Ionicons name={rightAction.icon} size={18} color={Colors.primaryDark} />
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryDark,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: Ui.space.section,
    overflow: 'hidden',
  },
  brandBar: { minHeight: 72, justifyContent: 'center', paddingHorizontal: 20 },
  actions: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconSpacer: { width: 34 },
  actionSpacer: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.onDarkSurface,
  },
  rightAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 20,
    backgroundColor: Colors.accent,
  },
  actionLabel: {
    color: Colors.primaryDark,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.bold,
  },
  copy: {
    paddingHorizontal: Ui.space.page,
    paddingTop: 10,
    paddingBottom: 26,
  },
  eyebrow: {
    ...Ui.eyebrow,
    color: Colors.accent,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.micro,
    fontWeight: FontWeight.extraBold,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.white,
    ...Ui.typography.pageTitle,
  },
  subtitle: {
    color: Colors.onDarkMuted,
    fontFamily: FontFamily.sans,
    fontSize: TextSize.body,
    lineHeight: 19,
    marginTop: 5,
  },
  rule: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
