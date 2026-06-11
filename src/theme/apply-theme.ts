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

  const { colors, font, rounding } = ui

  if (colors) {
    set(vars, '--uw-bg', colors.bg)
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
