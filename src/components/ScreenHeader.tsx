import { Colors } from '@/constants/colors';
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
      {(onBack || rightAction) && (
        <View style={styles.actions}>
          {onBack ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={20} color={Colors.textDark} />
            </TouchableOpacity>
          ) : <View />}
          {rightAction && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={rightAction.label}
              onPress={rightAction.onPress}
              style={styles.rightAction}>
              <Ionicons name={rightAction.icon} size={18} color={Colors.primary} />
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  actions: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  rightAction: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  actionLabel: {
    color: Colors.primary,
    fontFamily: 'Manrope',
    fontSize: 13,
    fontWeight: '700',
  },
  copy: {
    paddingTop: 4,
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
