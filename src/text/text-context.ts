import { createContext, useContext } from 'react'
import { DEFAULT_TEXT, type WidgetText } from './defaults'

/**
 * Fully-resolved user-facing copy. Lives in context so every component reads
 * the host's overrides (merged over {@link DEFAULT_TEXT}) without prop drilling.
 * Defaults to the built-in copy when no provider is mounted.
 */
export const TextContext = createContext<WidgetText>(DEFAULT_TEXT)

export function useText(): WidgetText {
  return useContext(TextContext)
}
