/**
 * Hotel flow UI kit. The layout primitives are shared with the train, bus and flight flows
 * (see components/trains/TrainUi) so every booking journey looks and behaves the same.
 * Only the progress bar is hotel-specific because its step names differ.
 */
import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Colors } from '@/constants/colors';
import { Ui } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export {
  Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle,
  goBackOr, goTo, replaceTo,
} from '@/components/trains/TrainUi';

export const HOTEL_ROUTES = {
  results: '/(tabs)/explore/hotels',
  details: '/(tabs)/explore/hotel-details',
  guests: '/(tabs)/explore/hotel-guests',
  review: '/(tabs)/explore/hotel-review',
  payment: '/(tabs)/explore/hotel-payment',
  confirmation: '/(tabs)/explore/hotel-confirmation',
} as const;

const STEPS = ['Room', 'Guests', 'Review', 'Payment', 'Done'];

export function HotelProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <View style={s.progress} accessibilityRole="progressbar" accessibilityLabel={`Step ${current + 1} of ${STEPS.length}: ${STEPS[current]}`}>
      {STEPS.map((label, i) => {
        const done = i < current; const active = i === current;
        return (
          <View key={label} style={s.progressItem}>
            {i > 0 ? <View style={[s.progressLine, (done || active) && s.progressLineOn]} /> : null}
            <View style={[s.dot, done && s.dotDone, active && s.dotActive]}>
              {done ? <Ionicons name="checkmark" size={13} color={Colors.white} /> : <Text style={[s.dotText, active && s.dotTextActive]}>{i + 1}</Text>}
            </View>
            <Text style={[s.stepLabel, (active || done) && s.stepLabelOn]} numberOfLines={1}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  progress: { flexDirection: 'row', marginHorizontal: Ui.space.page, marginBottom: 16, paddingVertical: 12, paddingHorizontal: 8, ...Ui.card, borderRadius: 18 },
  progressItem: { flex: 1, alignItems: 'center' },
  progressLine: { position: 'absolute', top: 11, right: '50%', width: '100%', height: 2, backgroundColor: Colors.border },
  progressLineOn: { backgroundColor: Colors.primary },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.borderStrong },
  dotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dotActive: { borderColor: Colors.primary, backgroundColor: Colors.accent },
  dotText: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.extraBold, color: Colors.textLight },
  dotTextActive: { color: Colors.primaryDark },
  stepLabel: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, fontWeight: FontWeight.bold, color: Colors.textLight, marginTop: 5 },
  stepLabelOn: { color: Colors.primary },
});