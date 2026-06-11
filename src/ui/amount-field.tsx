import { useState } from 'react'
import { formatUsdValue } from '@umbra-privacy/client/lib'
import type { Token } from '@umbra-privacy/client/token'
import { cn } from '@/ui/lib/utils'
import { fromBaseUnits } from '@/lib/amount'
import { TransferVerticalIcon } from '@/ui/icons'
import { TokenSelect } from '@/ui/token-select'
import { Skeleton } from '@/ui/skeleton'

interface AmountFieldProps {
  label: string
  /** Token amount (human units) — the source of truth. */
  amount: string
  onAmountChange: (value: string) => void
  token: Token | null
  tokens: Token[]
  onTokenChange: (token: Token) => void
  balanceLabel?: string
  balanceLoading?: boolean
  onMax?: () => void
  className?: string
}

/**
 * "You're Shielding …" card. The ↓↑ control flips the big input between token
 * and USD entry; the token amount is always what flows back via
 * `onAmountChange`. USD ⇄ token uses the token's live `price`.
 */
export function AmountField({
  label,
  amount,
  onAmountChange,
  token,
  tokens,
  onTokenChange,
  balanceLabel = '—',
  balanceLoading = false,
  onMax,
  className
}: AmountFieldProps) {
  const [usdMode, setUsdMode] = useState(false)
  const [usdDraft, setUsdDraft] = useState('')
  const price = token?.price
  const canUsd = !!price && price > 0

  const tokenNum = Number(amount) || 0
  const usdEquiv = canUsd ? tokenNum * price! : 0

  const flip = () => {
    if (!canUsd) return
    if (!usdMode) setUsdDraft(tokenNum ? (tokenNum * price!).toFixed(2) : '')
    setUsdMode((v) => !v)
  }

  const onUsdInput = (raw: string) => {
    const v = sanitize(raw, 2) // USD → 2 decimals
    setUsdDraft(v)
    onAmountChange(price ? String((Number(v) || 0) / price) : '0')
  }

  // Max sets the token amount via `onMax`; in USD mode the visible field is the
  // USD draft, so mirror the max into it too (else the click looks like a no-op).
  const handleMax = () => {
    if (!onMax) return
    onMax()
    if (usdMode && token) {
      const maxTokens = Number(fromBaseUnits(token.amount, token.decimals)) || 0
      setUsdDraft(canUsd ? (maxTokens * price!).toFixed(2) : '')
    }
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-1 rounded-uw-lg border border-uw-border bg-uw-surface px-5 pb-3 pt-5',
        className
      )}
    >
      <span className='text-sm font-semibold text-uw-primary'>{label}</span>

      <div className='flex items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-center'>
          {usdMode && (
            <span className='text-5xl font-light text-uw-text-tertiary'>$</span>
          )}
          <input
            inputMode='decimal'
            placeholder='0'
            value={usdMode ? usdDraft : amount}
            onChange={(e) =>
              usdMode
                ? onUsdInput(e.target.value)
                : onAmountChange(sanitize(e.target.value, token?.decimals))
            }
            className='min-w-0 flex-1 bg-transparent text-5xl font-light text-uw-text outline-none placeholder:text-uw-text-tertiary'
          />
        </div>
        <TokenSelect token={token} tokens={tokens} onChange={onTokenChange} />
      </div>

      <div className='flex items-center justify-between py-2 text-sm font-semibold text-uw-text-tertiary'>
        <button
          type='button'
          onClick={flip}
          disabled={!canUsd}
          className={cn('flex items-center gap-1', canUsd && 'text-uw-primary')}
          title={canUsd ? 'Switch input currency' : undefined}
        >
          <TransferVerticalIcon />
          {usdMode
            ? `${formatUnits(tokenNum)} ${token?.symbol ?? ''}`
            : formatUsdValue(usdEquiv)}
        </button>
        <span className='flex min-w-0 items-center gap-1'>
          Balance:{' '}
          {balanceLoading ? (
            <Skeleton className='h-3.5 w-12' />
          ) : (
            balanceLabel
          )}
          {onMax && (
            <>
              <span className='h-0.5 w-0.5 rounded-full bg-uw-text-tertiary' />
              <button
                type='button'
                className='text-uw-primary'
                onClick={handleMax}
              >
                Max
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  )
}

function sanitize(value: string, maxDecimals?: number): string {
  let v = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  if (maxDecimals != null && v.includes('.')) {
    const [whole, frac] = v.split('.')
    v = maxDecimals === 0 ? whole : `${whole}.${frac.slice(0, maxDecimals)}`
  }
  return v
}

function formatUnits(n: number): string {
  if (!n) return '0.00'
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}
