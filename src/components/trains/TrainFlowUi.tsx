/**
 * Train booking-flow UI kit. The six steps (select → passengers → seats → review → payment → done)
 * share the same light layout as the flight and bus flows: back/settings header, banner, round step
 * tracker, white cards and a sticky pill-button footer. The pieces below are thin aliases so the three
 * flows stay visually identical.
 */
import { BRAND, INTER, FlightBanner, FlightHeading, FlightShell, FlightSteps, FlightTag } from '@/components/flights/FlightFlowUi';
import { BusCardBox, BusFooter, BusInput, BusNotice, BusRow } from '@/components/buses/BusUi';
import type { ReactNode } from 'react';
import type { ImageSourcePropType } from 'react-native';

export {
  Chip, EmptyState, Pill, PrimaryButton, TRAIN_ROUTES, goBackOr, goTo, replaceTo,
} from '@/components/trains/TrainUi';
export { BRAND, INTER };
export {
  FlightHeading as TrainHeading, FlightTag as TrainTag,
  BusCardBox as TrainCardBox, BusFooter as TrainFooter, BusInput as TrainInput, BusNotice as TrainNotice, BusRow as TrainRow,
};

// Banner artwork lives in assets/images (file names as saved in the project).
const TRAIN_BANNER: ImageSourcePropType = require('../../../assets/images/Daylight High-Speed Train and Mosque Skyline.png');
export const TRAIN_DONE_BANNER: ImageSourcePropType = require('../../../assets/images/Celebratory Green Payment Confirmation Banner.png');

export const TRAIN_STEPS = ['Select', 'Passengers', 'Seats', 'Review', 'Payment', 'Done'] as const;

export function TrainShell({ children, footer, onBack }: { children: ReactNode; footer?: ReactNode; onBack: () => void }) {
  return <FlightShell title="Trains" onBack={onBack} footer={footer}>{children}</FlightShell>;
}
export function TrainBanner({ title, text }: { title: string; text: string }) {
  return <FlightBanner eyebrow="LEMONTRIP / RAIL" image={TRAIN_BANNER} title={title} text={text} />;
}
export function TrainSteps({ current }: { current: 0 | 1 | 2 | 3 | 4 | 5 }) {
  return <FlightSteps steps={TRAIN_STEPS} current={current} />;
}
