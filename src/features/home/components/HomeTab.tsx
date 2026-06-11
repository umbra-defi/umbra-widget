import { TokenAvatar } from '@/ui/token-avatar'
import { Skeleton } from '@/ui/skeleton'
import { useHome } from '../hooks/use-home'

export function HomeTab() {
  const { rows, metaLoading } = useHome()
  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between px-2 pb-1'>
        <span className='text-[11px] font-semibold uppercase tracking-wider text-uw-text-tertiary'>
          Asset
        </span>
        <span className='text-[11px] font-semibold uppercase tracking-wider text-uw-text-tertiary'>
          Private balance
        </span>
      </div>

      {metaLoading
        ? Array.from({ length: 6 }).map((_, i) => <TokenRowSkeleton key={i} />)
        : rows.map((row) => <TokenRow key={row.mintAddress} {...row} />)}

      {!metaLoading && rows.length === 0 && (
        <div className='py-8 text-center text-sm text-uw-text-secondary'>
          No supported tokens
        </div>
      )}
    </div>
  )
}

interface TokenRowProps {
  symbol: string
  name: string
  iconUrl?: string
  balance: string | null
  usd: string | null
}

function TokenRow({ symbol, name, iconUrl, balance, usd }: TokenRowProps) {
  return (
    <div className='flex items-center gap-3 rounded-uw-md px-2 py-3 transition-colors hover:bg-uw-surface'>
      <TokenAvatar symbol={symbol} iconUrl={iconUrl} size={40} />
      <div className='flex min-w-0 flex-col'>
        <span className='truncate text-[15px] font-semibold leading-tight text-uw-text'>
          {name || symbol}
        </span>
        <span className='text-xs text-uw-text-tertiary'>{symbol}</span>
      </div>
      <div className='ml-auto flex flex-col items-end gap-1'>
        {balance === null ? (
          <>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-3 w-12' />
          </>
        ) : (
          <>
            <span className='text-[15px] font-semibold leading-tight text-uw-text'>
              {balance} {symbol}
            </span>
            <span className='text-xs text-uw-text-tertiary'>{usd}</span>
          </>
        )}
      </div>
    </div>
  )
}

function TokenRowSkeleton() {
  return (
    <div className='flex items-center gap-3 px-2 py-3'>
      <Skeleton className='h-10 w-10 rounded-full' />
      <div className='flex flex-col gap-1.5'>
        <Skeleton className='h-3.5 w-20' />
        <Skeleton className='h-3 w-12' />
      </div>
      <div className='ml-auto flex flex-col items-end gap-1.5'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-12' />
      </div>
    </div>
  )
}
