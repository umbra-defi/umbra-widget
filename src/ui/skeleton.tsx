import { cn } from '@/ui/lib/utils'

/** Pulsing placeholder bar shown while data is fetching. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block animate-pulse rounded bg-uw-surface-alt',
        className
      )}
    />
  )
}
