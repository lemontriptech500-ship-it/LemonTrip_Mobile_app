/**
 * Bus flow UI kit. The layout primitives are shared with the train and flight flows
 * (see components/trains/TrainUi) so every booking journey looks and behaves the same.
 */
export {
  Card, Chip, EmptyState, Field, FlowScreen, FooterBar, Notice, Pill, PrimaryButton, Row, SectionTitle, TrainProgress as BusProgress,
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
