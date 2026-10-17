/**
 * Bus flow UI kit. The layout primitives are shared with the train and flight flows
 * (see components/trains/TrainUi) so every booking journey looks and behaves the same.
 */
import { StepProgress } from '@/components/ui/StepProgress';

export {
  Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle,
  goBackOr, goTo, replaceTo,
} from '@/components/trains/TrainUi';

export const BUS_ROUTES = {
  results: '/(tabs)/explore/buses',
  details: '/(tabs)/explore/bus-details',
  passengers: '/(tabs)/explore/bus-passengers',
  review: '/(tabs)/explore/bus-review',
  payment: '/(tabs)/explore/bus-payment',
  confirmation: '/(tabs)/explore/bus-confirmation',
} as const;

const BUS_STEPS = ['Seats', 'Passengers', 'Review', 'Payment', 'Done'];
export function BusProgress({ current }: { current: 0 | 1 | 2 | 3 | 4 }) {
  return <StepProgress steps={BUS_STEPS} current={current} />;
}