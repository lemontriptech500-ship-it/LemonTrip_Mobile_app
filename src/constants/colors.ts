/** LemonTrip palette: forest green, lemon yellow, warm neutral surfaces. */
export const Colors = {
  primary: '#103D30',
  primaryDark: '#0C3026',
  secondary: '#286653',
  accent: '#FFD600',
  accentSoft: '#FFF6BD',
  white: '#FFFFFF',
  background: '#F3F6F2',
  surface: '#FFFFFF',
  surfaceMuted: '#E8F1ED',
  textDark: '#142D26',
  textLight: '#60746B',
  onDarkMuted: '#B6CCC2',
  borderOnDark: '#416356',
  border: '#E2EAE5',
  borderStrong: '#CBD8CF',
  success: '#286653',
  successSoft: '#E8F1ED',
  error: '#B42318',
  errorSoft: '#FFF0ED',
  errorBorder: '#F2C9C2',
  errorOnDark: '#FFB4B4',
  // Photo overlays and decorative surfaces also use the forest-green palette.
  overlay: 'rgba(12,48,38,0.58)',
  imageOverlay: 'rgba(12,48,38,0.28)',
  heroOverlay: 'rgba(12,48,38,0.42)',
  strongOverlay: 'rgba(12,48,38,0.72)',
  onDarkSurface: 'rgba(255,255,255,0.14)',
  onDarkBorder: 'rgba(255,255,255,0.18)',
  onDarkHighlight: 'rgba(255,255,255,0.25)',
  onDarkSubtle: 'rgba(255,255,255,0.10)',
  decorativeGreen: 'rgba(16,61,48,0.14)',
  // Preserve the recognizable third-party sign-in mark.
  googleBlue: '#4285F4',
} as const;

export const Brand = {
  forest: '#0F3D2E',      // dark green for headers/hero/cards
  forestLight: '#1B5340',
  lemon: '#FFD000',       // yellow CTA
  cream: '#F6F5EF',       // screen background
} as const;

export const Radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;