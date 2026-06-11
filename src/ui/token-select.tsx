import { useState } from 'react'
import type { Token } from '@umbra-privacy/client/token'
import { fromBaseUnits } from '@/lib/amount'
import { ChevronUpDownIcon } from '@/ui/icons'
import { TokenAvatar } from '@/ui/token-avatar'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/ui/dialog'

interface TokenSelectProps {
  token: Token | null
  tokens: Token[]
  onChange: (token: Token) => void
}

/** Pill trigger + full token-picker modal (icon · name · ticker · balance). */
export function TokenSelect({ token, tokens, onChange }: TokenSelectProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type='button'
          className='flex shrink-0 items-center gap-1.5 rounded-full bg-uw-surface-alt py-2 pl-2 pr-2.5 text-sm font-semibold transition-opacity hover:opacity-80'
        >
          {token ? (
            <>
              <TokenAvatar
                symbol={token.symbol}
                iconUrl={token.iconUrl}
                size={22}
              />
              <span className='text-uw-text'>{token.symbol}</span>
            </>
          ) : (
            <span className='pl-1 text-uw-text-tertiary'>Select Token</span>
          )}
          <ChevronUpDownIcon className='text-uw-text-tertiary' />
        </button>
      </DialogTrigger>

      <DialogContent className='!w-[min(420px,92vw)] !p-0'>
        <div className='px-6 pb-4 pt-6'>
          <DialogTitle className='text-xl font-bold text-uw-text'>
            Select token
          </DialogTitle>
          <DialogDescription className='mt-1 text-sm text-uw-text-secondary'>
            Choose the asset you'd like to use.
          </DialogDescription>
        </div>
        <div className='max-h-[60vh] overflow-auto px-3 pb-3 gap-1 flex flex-col'>
          {tokens.map((t) => (
            <button
              key={t.mintAddress}
              type='button'
              onClick={() => {
                onChange(t)
                setOpen(false)
              }}
              className='flex w-full items-center gap-3 rounded-uw-md px-3 py-3 text-left transition-colors hover:bg-uw-surface aria-[current=true]:bg-uw-surface'
              aria-current={t.mintAddress === token?.mintAddress}
            >
              <TokenAvatar symbol={t.symbol} iconUrl={t.iconUrl} size={40} />
              <div className='flex min-w-0 flex-col'>
                <span className='text-[15px] font-bold text-uw-text'>
                  {t.name || t.symbol}
                </span>
                <span className='text-sm text-uw-text-tertiary'>
                  {t.symbol}
                </span>
              </div>
              <span className='ml-auto text-sm font-semibold text-uw-text'>
                {fromBaseUnits(t.amount, t.decimals)}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
