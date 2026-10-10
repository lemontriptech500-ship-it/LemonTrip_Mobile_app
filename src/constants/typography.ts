export const FontFamily = {
  sans: 'Manrope',
} as const;

/** Shared app type scale. Keep display, headings, body, and labels on these steps. */
export const TextSize = {
  micro: 11,
  caption: 12,
  body: 14,
  bodyLarge: 16,
  title: 18,
  heading: 20,
  displaySmall: 24,
  display: 28,
  hero: 34,
  heroLarge: 40,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extraBold: '800',
} as const;
