import { createContext, useContext, type CSSProperties } from 'react'

/**
 * Host theme as CSS custom properties. Lives in context so portaled UI
 * (dialogs render to `document.body`, outside the themed widget root) can
 * re-apply the vars instead of falling back to globals.css defaults.
 */
export const ThemeVarsContext = createContext<CSSProperties>({})

export function useThemeVars(): CSSProperties {
  return useContext(ThemeVarsContext)
}
