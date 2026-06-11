import { Button } from '@/ui/button'
import { StatusRow } from '@/ui/status-row'
import { TokenAvatar } from '@/ui/token-avatar'
import { Skeleton } from '@/ui/skeleton'
import { RefreshIcon } from '@/ui/icons'
import { fromBaseUnits } from '@/lib/amount'
import { useReceive } from '../hooks/use-receive'

function truncate(addr: string): string {
  return addr.length > 10 ? `${addr.slice(0, 4)}…${addr.slice(-4)}` : addr
}

function NoteRowSkeleton() {
  return (
    <div className='flex items-center gap-3 rounded-uw-md px-2 py-3'>
      <Skeleton className='h-10 w-10 shrink-0 rounded-full' />
      <div className='flex min-w-0 flex-col gap-1.5'>
        <Skeleton className='h-[15px] w-20' />
        <Skeleton className='h-3 w-16' />
      </div>
      <Skeleton className='ml-auto h-9 w-[68px] shrink-0 rounded-full' />
    </div>
  )
}

export function ReceiveTab() {
  const r = useReceive()
  const count = r.utxos.length
  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between px-1'>
        <span className='text-sm font-semibold text-uw-text'>
          Claimable Notes
        </span>
        <div className='flex items-center gap-2'>
          <span className='text-xs font-medium text-uw-text-tertiary'>
            {r.isFetching ? '…' : count}
          </span>
          <button
            type='button'
            onClick={r.refetch}
            disabled={r.isFetching}
            title='Refresh'
            className='text-uw-text-tertiary transition-colors hover:text-uw-text disabled:opacity-50'
          >
            <RefreshIcon className={r.isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {r.isFetching && (
        <div className='flex flex-col'>
          {Array.from({ length: 5 }).map((_, i) => (
            <NoteRowSkeleton key={i} />
          ))}
        </div>
      )}

      {!r.isFetching && count === 0 && (
        <div className='rounded-uw-md border border-uw-border py-8 text-center text-sm text-uw-text-secondary'>
          Nothing to claim
        </div>
      )}

      {!r.isFetching && count > 0 && (
        <div className='flex max-h-72 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
          {r.utxos.map((u) => {
            const claiming = r.claimingIds.has(u.id)
            const meta = r.metadataMap[String(u.mintAddress)]
            const symbol = meta?.symbol ?? u.symbol
            const iconUrl = meta?.iconUrl ?? u.iconUrl
            const decimals = meta?.decimals ?? u.decimals
            return (
              <div
                key={u.id}
                className='flex items-center gap-3 rounded-uw-md px-2 py-3 transition-colors hover:bg-uw-surface'
              >
                <TokenAvatar symbol={symbol} iconUrl={iconUrl} size={40} />
                <div className='flex min-w-0 flex-col'>
                  <span className='truncate text-[15px] font-semibold leading-tight text-uw-text'>
                    {fromBaseUnits(u.amount as bigint, decimals)} {symbol}
                  </span>
                  <span className='truncate text-xs text-uw-text-tertiary'>
                    From {truncate(String(u.senderAddress))}
                  </span>
                </div>
                <Button
                  size='sm'
                  className='ml-auto shrink-0'
                  disabled={claiming}
                  onClick={() => r.claimOne(u)}
                >
                  {claiming ? 'Claiming…' : 'Claim'}
                </Button>
              </div>
            )
          })}
        </div>
      )}

      <StatusRow status={r.claimAllStatus} error={r.claimError} />
      {/* <Button disabled={count === 0 || r.busy} onClick={r.claimAll}>
        {r.claimAllStatus === 'pending'
          ? 'Claiming…'
          : count > 0
            ? `Claim all (${count})`
            : 'Nothing to claim'}
      </Button> */}
    </div>
  )
}
