import { Colors } from './colors';

const cardShadow = {
  shadowColor: Colors.primaryDark,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.035,
  shadowRadius: 16,
  elevation: 1,
} as const;

/** Shared visual language, carried from the onboarding screen. */
export const Ui = {
  radius: { card: 24, control: 16, button: 18, pill: 24 },
  space: { page: 20, section: 24, card: 18, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    ...cardShadow,
  },
  shadow: cardShadow,
  typography: {
    pageTitle: { fontFamily: 'Manrope', fontSize: 28, lineHeight: 34, fontWeight: '800' },
    heading: { fontFamily: 'Manrope', fontSize: 20, lineHeight: 28, fontWeight: '800' },
    body: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 22 },
    button: { fontFamily: 'Manrope', fontSize: 14, lineHeight: 20, fontWeight: '800' },
  },
  button: { minHeight: 52, borderRadius: 18 },
  compactButton: { minHeight: 44, borderRadius: 16 },
  field: { minHeight: 50, borderRadius: 16 },
  eyebrow: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
} as const;
