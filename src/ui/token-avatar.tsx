import { cn } from '@/ui/lib/utils'

const COLORS = [
  '#3b9dff',
  '#9b5cff',
  '#2bbf73',
  '#ff8a3b',
  '#ff4d6d',
  '#33c9d6'
]

function colorFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return COLORS[Math.abs(h) % COLORS.length]
}

/** Token icon — uses `iconUrl` when present, else a colored initial fallback. */
export function TokenAvatar({
  symbol = '',
  iconUrl,
  size = 20,
  className
}: {
  symbol?: string
  iconUrl?: string
  size?: number
  className?: string
}) {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=''
        className={cn('rounded-full object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold text-white',
        className
      )}
      style={{
        width: size,
        height: size,
        background: colorFor(symbol || '?'),
        fontSize: size * 0.45
      }}
    >
      {(symbol || '?').slice(0, 1)}
    </span>
  )
}
