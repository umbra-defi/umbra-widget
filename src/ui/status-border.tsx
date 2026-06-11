import { useEffect, useRef, useState } from 'react'
import { useFlowStatus } from '@/providers/flow-status'

const RING: Record<'pending' | 'success' | 'error', string> = {
  pending: 'uw-status-ring--pending',
  success: 'uw-status-ring--success',
  error: 'uw-status-ring--error'
}

/**
 * Modal-level status ring driven by FlowStatusContext. Shimmering blue while a
 * flow is pending, solid green/red on success/error for `holdMs`, then fades
 * out — keeping its colour through the fade so the exit doesn't snap. Drawn as
 * an inset overlay so it never shifts layout.
 */
export function ModalStatusRing({ holdMs = 2200 }: { holdMs?: number }) {
  const status = useFlowStatus()
  // `tone` is retained through the fade-out; `visible` drives the opacity.
  const [tone, setTone] = useState<'pending' | 'success' | 'error'>('pending')
  const [visible, setVisible] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    clearTimeout(timer.current)
    if (status === 'pending') {
      setTone('pending')
      setVisible(true)
    } else if (status === 'success' || status === 'error') {
      setTone(status)
      setVisible(true)
      timer.current = setTimeout(() => setVisible(false), holdMs)
    } else {
      setVisible(false)
    }
    return () => clearTimeout(timer.current)
  }, [status, holdMs])

  return (
    <span
      aria-hidden
      className={`uw-status-ring ${RING[tone]} ${visible ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}
