import type { WidgetUiConfig } from '@/index'

/**
 * Neobrutalist green theme, ported from the shadcn-style template. Only the
 * subset the widget actually consumes (colors / fonts / rounding) is mapped —
 * the template's offset-shadow system has no `--uw-*` equivalent. Fonts
 * (Montserrat / Space Mono) are loaded via <link> in index.html.
 */
export const umbraThemeLight: WidgetUiConfig = {
  colors: {
    bg: 'oklch(0.9923 0.0104 91.4994)', // --background
    surface: 'oklch(1.0000 0 0)', // --card
    surfaceAlt: 'oklch(0.9465 0.0314 91.6628)', // --muted
    border: 'oklch(0 0 0)', // --border (hard black)
    text: 'oklch(0.1759 0.0275 161.2531)', // --foreground
    textSecondary: 'oklch(0.3525 0.0379 91.7268)', // --muted-foreground
    textTertiary: 'oklch(0.5525 0.0379 91.7268)', // derived, lighter
    primary: 'oklch(0.5687 0.1498 151.9380)', // --primary (green)
    primaryFg: 'oklch(1.0000 0 0)', // --primary-foreground
    danger: 'oklch(0.5799 0.2380 29.2339)', // --destructive
    success: 'oklch(0.5687 0.1498 151.9380)', // --primary (green)
    tabActive: 'oklch(0.7721 0.1727 64.1585 / 0.20)' // --accent, translucent
  },
  font: {
    primary: "'Montserrat', sans-serif",
    secondary: "'Space Mono', monospace"
  },
  rounding: '0px'
}

export const umbraThemeDark: WidgetUiConfig = {
  colors: {
    bg: 'oklch(0.1649 0.0308 162.2739)', // --background
    surface: 'oklch(0.2283 0.0445 158.2398)', // --card
    surfaceAlt: 'oklch(0.2724 0.0467 159.1721)', // --muted
    border: 'oklch(0.9809 0.0260 91.6197)', // --border (hard cream)
    text: 'oklch(0.9809 0.0260 91.6197)', // --foreground
    textSecondary: 'oklch(0.8253 0.0270 91.6606)', // --muted-foreground
    textTertiary: 'oklch(0.6253 0.0270 91.6606)', // derived, dimmer
    primary: 'oklch(0.8484 0.2275 151.1487)', // --primary (green)
    primaryFg: 'oklch(0.1292 0.0270 165.3808)', // --primary-foreground
    danger: 'oklch(0.6280 0.2577 29.2339)', // --destructive
    success: 'oklch(0.8484 0.2275 151.1487)', // --primary (green)
    tabActive: 'oklch(0.7951 0.1631 68.6392 / 0.22)' // --accent, translucent
  },
  font: {
    primary: "'Montserrat', sans-serif",
    secondary: "'Space Mono', monospace"
  },
  rounding: '0px'
}
