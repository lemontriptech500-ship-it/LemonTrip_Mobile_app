import { Colors } from '@/constants/colors';
import { BrandGradientBar, LemonTripBrand } from '@/components/BrandGradientBar';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <BrandGradientBar style={styles.brandBar}>
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
      </BrandGradientBar>
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rule} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  brandBar: { minHeight: 58, justifyContent: 'center', paddingHorizontal: 16 },
  actions: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconSpacer: { width: 34 },
  actionSpacer: { flex: 1 },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  rightAction: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 17,
    backgroundColor: Colors.accent,
  },
  actionLabel: {
    color: Colors.primaryDark,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  copy: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
  },
  eyebrow: {
    color: Colors.secondary,
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.textDark,
    fontFamily: 'Manrope',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: Colors.textLight,
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  rule: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
