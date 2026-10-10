# LemonTrip mobile UI style guide

All app and widget colors come from `src/constants/colors.ts`. Shared shape, spacing, typography, and shadow values come from `src/constants/theme.ts`.

- Navigation/header: deep forest `primaryDark` (#0C3026).
- Brand, selected controls, and text actions: forest `primary` (#103D30).
- Main booking/continue actions and highlights: lemon `accent` (#FFD600), with dark green text.
- Canvas: warm neutral `background` (#F3F6F2).
- Cards: white `surface`; quiet panels and icon containers: `surfaceMuted` (#E8F1ED).
- Text: `textDark` for headings/body, `textLight` for secondary copy, `white` and `onDarkMuted` on dark surfaces.
- Feedback: shared success, error, error-soft, and error-border tokens. Third-party Google sign-in branding retains its own blue token.
- Images: shared light/hero/strong forest overlays. Header ornaments use shared translucent surface/border tokens.

Main actions use 52px minimum height / 18px corners; compact actions use 44px / 16px. Inputs use 50px / 16px. Content cards use 24px corners and the shared soft shadow. Circular icons, pills, image arches, and 30px header corners are intentional variants.

Page gutters use `Ui.space.page` (20px). Manrope is the app font, with 800-weight headings and action labels. `Ui.typography` defines shared page titles, headings, body, and action text. `ScreenHeader` is the common logo, back, title, subtitle, and action header; the home/explore and onboarding hero layouts retain their purpose-specific presentation using the same palette.

Use semantic tokens for new screens; avoid local hex/rgba colors, local card shadows, or alternate font weights for the same hierarchy.
