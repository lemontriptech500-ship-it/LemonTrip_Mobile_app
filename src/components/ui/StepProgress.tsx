import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { FontFamily, FontWeight, TextSize } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

const HALO = 36;
const DOT = 26;
const TRACK = 3;

/**
 * Shared step indicator for every booking flow.
 * The connector is a single track drawn BEHIND the dots (so it never cuts through them),
 * with a filled portion that grows as the user moves forward.
 */
export function StepProgress({ steps, current }: { steps: readonly string[]; current: number }) {
  const count = steps.length;
  const inset = `${100 / (count * 2)}%` as const;
  const fill = `${count > 1 ? (Math.min(current, count - 1) / (count - 1)) * 100 : 0}%` as const;

  return (
    <View style={s.card} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${count}: ${steps[current]}`} accessibilityValue={{ min: 1, max: count, now: current + 1 }}>
      <View style={s.row}>
        <View pointerEvents="none" style={[s.track, { left: inset, right: inset }]}>
          <View style={[s.trackFill, { width: fill }]} />
        </View>
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <View key={label} style={s.item}>
              <View style={[s.halo, active && s.haloActive]}>
                <View style={[s.dot, done && s.dotDone, active && s.dotActive]}>
                  {done
                    ? <Ionicons name="checkmark" size={15} color={Colors.white} />
                    : <Text style={[s.dotText, active && s.dotTextActive]}>{i + 1}</Text>}
                </View>
              </View>
              <Text style={[s.label, done && s.labelDone, active && s.labelActive]} numberOfLines={1}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: Ui.space.page, marginBottom: 16, paddingTop: 12, paddingBottom: 12, paddingHorizontal: 4, ...Ui.card, borderRadius: 18 },
  row: { flexDirection: 'row' },
  track: { position: 'absolute', top: (HALO - TRACK) / 2, height: TRACK, borderRadius: TRACK / 2, backgroundColor: Colors.border },
  trackFill: { height: TRACK, borderRadius: TRACK / 2, backgroundColor: Colors.primary },
  item: { flex: 1, minWidth: 0, alignItems: 'center' },
  halo: { width: HALO, height: HALO, borderRadius: HALO / 2, alignItems: 'center', justifyContent: 'center' },
  haloActive: { backgroundColor: Colors.accentSoft },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.borderStrong },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotActive: { backgroundColor: Colors.accent, borderColor: Colors.primary },
  dotText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.textLight },
  dotTextActive: { color: Colors.primaryDark },
  label: { marginTop: 4, maxWidth: '100%', fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight },
  labelDone: { color: Colors.primary },
  labelActive: { color: Colors.textDark, fontWeight: FontWeight.extraBold },
});