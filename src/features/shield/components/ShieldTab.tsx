import { AmountField } from '@/ui/amount-field'
import { Button } from '@/ui/button'
import { useReportFlowStatus } from '@/providers/flow-status'
import { useShield } from '../hooks/use-shield'

export function ShieldTab() {
  const s = useShield()
  useReportFlowStatus(s.status)
  return (
    <div className='flex flex-col gap-3'>
      <AmountField
        label="You're Shielding"
        amount={s.amount}
        onAmountChange={s.setAmount}
        token={s.token}
        tokens={s.tokens}
        onTokenChange={s.onTokenChange}
        balanceLabel={s.balanceLabel}
        balanceLoading={s.balanceLoading}
        onMax={s.onMax}
      />
      <div className='flex items-center justify-between rounded-uw-md border border-uw-border px-4 py-3 text-sm'>
        <span className='text-uw-text-secondary'>Shielding Fee</span>
        <span className='text-uw-text'>No Fee · $0.00</span>
      </div>
      <Button disabled={!s.canSubmit} onClick={s.submit}>
        {s.status === 'pending'
          ? 'Shielding…'
          : s.lowSol
            ? 'Not enough SOL'
            : 'Shield'}
      </Button>
    </div>
  )
}
