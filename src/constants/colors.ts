export type ThemeName = 'light' | 'dark';

const lightColors = {
  primary: '#0b5d35',
  primaryDark: '#063b24',
  secondary: '#118047',
  accent: '#ffd21a',
  accentSoft: '#fff6bd',
  white: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#edf2ee',
  textDark: '#10231a',
  textLight: '#64736b',
  border: '#e2eae5',
  borderStrong: '#cbd8cf',
  success: '#22C55E',
  error: '#EF4444',
  overlay: 'rgba(6, 59, 36, 0.58)',
} as const;

const darkColors = {
  ...lightColors,
  background: '#0d1713',
  surface: '#14231d',
  surfaceMuted: '#1b3027',
  textDark: '#f2f7f3',
  textLight: '#a8b9af',
  border: '#294238',
  borderStrong: '#3a5b4b',
  accentSoft: '#665b12',
  overlay: 'rgba(0, 0, 0, 0.68)',
};

export const Colors: { -readonly [K in keyof typeof lightColors]: typeof lightColors[K] } = { ...lightColors };

export function applyTheme(theme: ThemeName) {
  Object.assign(Colors, theme === 'dark' ? darkColors : lightColors);
}