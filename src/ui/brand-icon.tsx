import iconUrl from '@/assets/icon.png'
import { cn } from '@/ui/lib/utils'

/**
 * Brand mark, tinted via CSS mask so it tracks `--uw-icon-tint` (black on a
 * light bg, white on a dark one — see apply-theme). Size with `className`.
 */
export function BrandIcon({ className }: { className?: string }) {
  return (
    <span
      role='img'
      aria-label='Umbra'
      className={cn('inline-block bg-[var(--uw-icon-tint)]', className)}
      style={{
        WebkitMaskImage: `url(${iconUrl})`,
        maskImage: `url(${iconUrl})`,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
      }}
    />
  )
}
