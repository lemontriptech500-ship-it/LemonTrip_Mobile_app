import { Colors } from './colors';

/** Shared visual language, carried from the onboarding screen. */
export const Ui = {
  radius: { card: 24, control: 16, button: 18, pill: 24 },
  space: { page: 20, section: 24, card: 18, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 24,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 16,
    elevation: 1,
  },
  button: { minHeight: 52, borderRadius: 18 },
  field: { minHeight: 50, borderRadius: 16 },
  eyebrow: {
    fontFamily: 'Manrope',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
} as const;
