import type { CSSProperties } from 'react'
import type { WidgetUiConfig } from '@/types'

/**
 * Translate the `ui` prop into a style object of CSS custom properties. Spread
 * the result onto the widget root element; unset fields simply inherit the
 * defaults declared in globals.css. Pure — no React, easy to test.
 */
export function uiToCssVars(ui?: WidgetUiConfig): CSSProperties {
  const vars: Record<string, string> = {}
  if (!ui) return vars as CSSProperties

  const { colors, font, rounding, tabs } = ui

  if (colors) {
    set(vars, '--uw-bg', colors.bg)
    // Tint the brand icon for contrast against the resolved bg.
    if (colors.bg) {
      set(vars, '--uw-icon-tint', isDark(colors.bg) ? '#ffffff' : '#000000')
    }
    set(vars, '--uw-surface', colors.surface)
    set(vars, '--uw-surface-alt', colors.surfaceAlt)
    set(vars, '--uw-border', colors.border)
    set(vars, '--uw-text', colors.text)
    set(vars, '--uw-text-secondary', colors.textSecondary)
    set(vars, '--uw-text-tertiary', colors.textTertiary)
    set(vars, '--uw-primary', colors.primary)
    set(vars, '--uw-primary-fg', colors.primaryFg)
    set(vars, '--uw-danger', colors.danger)
    set(vars, '--uw-success', colors.success)
    set(vars, '--uw-tab-active', colors.tabActive)
  }

  if (font) {
    set(vars, '--uw-font-primary', font.primary)
    set(vars, '--uw-font-secondary', font.secondary)
  }

  if (tabs) {
    set(vars, '--uw-tab-row-bg', tabs.rowBg)
    set(vars, '--uw-tab-row-padding', tabs.rowPadding)
    set(vars, '--uw-tab-bg', tabs.bg)
    set(vars, '--uw-tab-active', tabs.activeBg)
    set(vars, '--uw-tab-border', tabs.border)
    set(vars, '--uw-tab-radius', tabs.radius)
  }

  if (typeof rounding === 'string') {
    set(vars, '--uw-radius-sm', rounding)
    set(vars, '--uw-radius-md', rounding)
    set(vars, '--uw-radius-lg', rounding)
  } else if (rounding) {
    set(vars, '--uw-radius-sm', rounding.sm)
    set(vars, '--uw-radius-md', rounding.md)
    set(vars, '--uw-radius-lg', rounding.lg)
  }

  return vars as CSSProperties
}

function set(target: Record<string, string>, key: string, value?: string) {
  if (value != null) target[key] = value
}

/**
 * Rough luminance test for `#rgb`/`#rrggbb` hex colors. Non-hex (e.g. `rgb()`,
 * named, gradients) falls back to "light" so the default dark tint stands.
 */
function isDark(color: string): boolean {
  const hex = color.trim().replace('#', '')
  const full =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex
  if (full.length !== 6 || /[^0-9a-f]/i.test(full)) return false
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  // Perceived luminance (ITU-R BT.601).
  return (r * 299 + g * 587 + b * 114) / 1000 < 128
}
