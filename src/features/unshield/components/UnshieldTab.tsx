import { AmountField } from '@/ui/amount-field'
import { Button } from '@/ui/button'
import { useReportFlowStatus } from '@/providers/flow-status'
import { useUnshield } from '../hooks/use-unshield'

export function UnshieldTab() {
  const u = useUnshield()
  useReportFlowStatus(u.status)
  return (
    <div className='flex flex-col gap-3'>
      <AmountField
        label="You're Unshielding"
        amount={u.amount}
        onAmountChange={u.setAmount}
        token={u.token}
        tokens={u.tokens}
        onTokenChange={u.onTokenChange}
        balanceLabel={u.balanceLabel}
        onMax={u.onMax}
      />
      <div className='flex items-center justify-between rounded-uw-md border border-uw-border px-4 py-3 text-sm'>
        <span className='text-uw-text-secondary'>Unshielding Fee</span>
        <span className='text-uw-text'>No Fee · $0.00</span>
      </div>
      <Button disabled={!u.canSubmit} onClick={u.submit}>
        {u.status === 'pending'
          ? 'Unshielding…'
          : u.lowSol
            ? 'Not enough SOL'
            : 'Unshield'}
      </Button>
    </div>
  )
}
