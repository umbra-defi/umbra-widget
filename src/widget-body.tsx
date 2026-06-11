import { useEffect, useState, type FC, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'
import type { WidgetTab } from '@/types'
import { RegistrationScreen } from '@/features/registration/components/RegistrationScreen'
import { useRegistration } from '@/features/registration/hooks/use-registration'
import { useEnsureUmbraClient } from '@/providers/use-umbra-client'
import { HomeTab } from '@/features/home/components/HomeTab'
import { ShieldTab } from '@/features/shield/components/ShieldTab'
import { TransferTab } from '@/features/transfer/components/TransferTab'
import { UnshieldTab } from '@/features/unshield/components/UnshieldTab'
import { ReceiveTab } from '@/features/receive/components/ReceiveTab'
import iconUrl from '@/assets/icon.png'

const TAB_LABEL: Record<WidgetTab, string> = {
  home: 'Home',
  shield: 'Shield',
  transfer: 'Transfer',
  unshield: 'Unshield',
  receive: 'Receive'
}

const TAB_VIEW: Record<WidgetTab, FC> = {
  home: HomeTab,
  shield: ShieldTab,
  transfer: TransferTab,
  unshield: UnshieldTab,
  receive: ReceiveTab
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Inner content. Gates on registration, then renders the requested tabs.
 * `layout` animates the widget's height as content changes (tab switch,
 * registration → tabs); each tab body cross-fades in.
 */
export function WidgetBody({ tabs }: { tabs: WidgetTab[] }) {
  const { isRegistered, isChecking } = useRegistration()
  useEnsureUmbraClient(isRegistered)
  const [active, setActive] = useState<WidgetTab>(tabs[0] ?? 'home')

  // Keep the splash up for at least 2s so it doesn't flash on fast loads.
  const [minElapsed, setMinElapsed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  let content: ReactNode
  let bodyKey: string

  if (isChecking || !minElapsed) {
    bodyKey = 'loading'
    content = (
      <div className='flex items-center justify-center p-32'>
        <img
          src={iconUrl}
          alt=''
          className='h-16 w-16 animate-pulse rounded-xl'
        />
      </div>
    )
  } else if (!isRegistered) {
    bodyKey = 'register'
    content = <RegistrationScreen />
  } else {
    const View = TAB_VIEW[active]
    bodyKey = `tab:${active}`
    content = <View />
  }

  return (
    <motion.div layout transition={{ layout: { duration: 0.3, ease: EASE } }}>
      {isRegistered && !isChecking && minElapsed && (
        <Tabs
          value={active}
          onValueChange={(v) => setActive(v as WidgetTab)}
          className='mb-1'
        >
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t}>
                {TAB_LABEL[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={bodyKey}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: EASE }}
          className='mt-4'
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
