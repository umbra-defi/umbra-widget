import { cn } from '@/ui/lib/utils'

/** Inline spinner in `currentColor`. Sizes to `1em` by default. */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-uw-spin h-[1em] w-[1em]', className)}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden
    >
      <circle
        cx='12'
        cy='12'
        r='9'
        stroke='currentColor'
        strokeWidth='3'
        opacity='0.25'
      />
      <path
        d='M21 12a9 9 0 0 0-9-9'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  )
}
