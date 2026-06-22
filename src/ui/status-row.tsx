import { cn } from '@/ui/lib/utils'
import { useText } from '@/text/text-context'

interface StatusRowProps {
  status: 'idle' | 'pending' | 'success' | 'error'
  error?: Error | null
  signature?: string | null
  className?: string
}

/** Inline result line shown under flow forms — error message or tx signature. */
export function StatusRow({
  status,
  error,
  signature,
  className
}: StatusRowProps) {
  const t = useText().status
  if (status === 'idle' || status === 'pending') return null
  return (
    <div
      className={cn(
        'rounded-uw-sm px-3 py-2 text-sm',
        status === 'error' ? 'text-uw-danger' : 'text-uw-success',
        className
      )}
    >
      {status === 'error'
        ? (error?.message ?? t.error)
        : `${t.success}${signature ? ` · ${signature.slice(0, 8)}…` : ''}`}
    </div>
  )
}
