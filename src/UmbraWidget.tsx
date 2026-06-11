import { useMemo } from 'react'
import type { UmbraWidgetProps, WidgetTab } from '@/types'
import { uiToCssVars } from '@/theme/apply-theme'
import { ThemeVarsContext } from '@/theme/theme-context'
import { WidgetProvider } from '@/providers/WidgetProvider'
import { WidgetBody } from '@/widget-body'
import { WidgetHeader } from '@/ui/widget-header'
import { Dialog, DialogContent, DialogTrigger } from '@/ui/dialog'
import { FlowStatusProvider } from '@/providers/flow-status'
import { ModalStatusRing } from '@/ui/status-border'
import { cn } from '@/ui/lib/utils'
import '@/theme/globals.css'

const ALL_TABS: WidgetTab[] = [
  'home',
  'shield',
  'transfer',
  'unshield',
  'receive'
]

/** Theme vars + the framed inner tree (provider, header, body, status ring). */
function useWidgetShell(props: UmbraWidgetProps) {
  const { ui, tabs } = props
  const themeVars = useMemo(() => uiToCssVars(ui), [ui])
  const resolvedTabs = tabs?.length ? tabs : ALL_TABS

  const framed = (
    <FlowStatusProvider>
      <ThemeVarsContext.Provider value={themeVars}>
        <WidgetProvider
          signer={props.signer}
          rpcUrl={props.rpcUrl}
          network={props.network}
          mints={props.mints}
          storage={props.storage}
          walletAddress={props.walletAddress}
        >
          <WidgetHeader />
          <WidgetBody tabs={resolvedTabs} />
        </WidgetProvider>
      </ThemeVarsContext.Provider>
      <ModalStatusRing />
    </FlowStatusProvider>
  )

  return { themeVars, framed }
}

/**
 * Inline widget — renders in place anywhere, no modal. `className` lets the host
 * size/position it (defaults to the standalone card chrome).
 */
export function UmbraWidgetInline(
  props: UmbraWidgetProps & { className?: string }
) {
  const { themeVars, framed } = useWidgetShell(props)
  return (
    <div
      className={cn(
        'uw-root relative bg-uw-bg',
        props.className ??
          'w-[min(540px,94vw)] rounded-uw-lg border border-uw-border p-7'
      )}
      style={themeVars}
    >
      {framed}
    </div>
  )
}

/**
 * The single public component. Renders as a modal when `trigger`/`open` is
 * provided, otherwise renders inline (same as {@link UmbraWidgetInline}).
 */
export function UmbraWidget(props: UmbraWidgetProps) {
  const { open, onOpenChange, trigger } = props
  const { themeVars, framed } = useWidgetShell(props)

  if (trigger || open !== undefined) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent style={themeVars}>{framed}</DialogContent>
      </Dialog>
    )
  }

  return <UmbraWidgetInline {...props} />
}
