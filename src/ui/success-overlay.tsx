import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useFlowStatus } from '@/providers/flow-status'
import { Button } from '@/ui/button'
import { useText } from '@/text/text-context'

const COUNTDOWN = 5

type Tone = 'success' | 'error'

/** Solid primary-coloured circle with the glyph knocked out (transparent). */
function StatusIcon({ tone }: { tone: Tone }) {
  const glyph =
    tone === 'success'
      ? 'M28 43 l9 9 l19 -22' // tick
      : 'M31 31 l22 22 M53 31 l-22 22' // cross
  return (
    <svg width='128' height='128' viewBox='0 0 84 84' aria-hidden>
      <defs>
        <mask id={`uw-status-${tone}`}>
          <rect width='84' height='84' fill='black' />
          <circle cx='42' cy='42' r='34' fill='white' />
          <path
            d={glyph}
            fill='none'
            stroke='black'
            strokeWidth='6'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </mask>
      </defs>
      <rect
        width='84'
        height='84'
        fill='var(--uw-primary)'
        mask={`url(#uw-status-${tone})`}
      />
    </svg>
  )
}

/**
 * Full-card black overlay shown on flow success or error. Tone-coloured knockout
 * glyph (tick / cross) centred, with a primary "Go Home" button pinned to the
 * bottom that counts down from 5s and auto-navigates home at zero.
 * Mounted inside the card so `absolute inset-0` covers it.
 */
export function SuccessOverlay({ onGoHome }: { onGoHome: () => void }) {
  const status = useFlowStatus()
  const t = useText().successOverlay
  const open = status === 'success' || status === 'error'
  // Retain the last tone through the exit animation.
  const [tone, setTone] = useState<Tone>('success')
  const [secs, setSecs] = useState(COUNTDOWN)

  useEffect(() => {
    if (status === 'success' || status === 'error') setTone(status)
  }, [status])

  useEffect(() => {
    if (!open) {
      setSecs(COUNTDOWN)
      return
    }
    setSecs(COUNTDOWN)
    const id = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(id)
          onGoHome()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [open, onGoHome])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className='absolute inset-0 z-50 flex flex-col items-center rounded-uw-lg bg-black p-5'
        >
          <div className='flex flex-1 items-center justify-center'>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            >
              <StatusIcon tone={tone} />
            </motion.div>
          </div>
          <Button className='w-full' onClick={onGoHome}>
            {t.goHome} · {secs}s
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
