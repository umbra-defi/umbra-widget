import { AmountField } from '@/ui/amount-field'
import { Button } from '@/ui/button'
import { useReportFlowStatus } from '@/providers/flow-status'
import { useText } from '@/text/text-context'
import { useUnshield } from '../hooks/use-unshield'

export function UnshieldTab() {
  const u = useUnshield()
  const t = useText().unshield
  useReportFlowStatus(u.status)
  return (
    <div className='flex flex-col gap-3'>
      <AmountField
        label={t.amountLabel}
        amount={u.amount}
        onAmountChange={u.setAmount}
        token={u.token}
        tokens={u.tokens}
        onTokenChange={u.onTokenChange}
        balanceLabel={u.balanceLabel}
        onMax={u.onMax}
      />
      <div className='flex items-center justify-between rounded-uw-md border border-uw-border px-4 py-3 text-sm'>
        <span className='text-uw-text-secondary'>{t.feeLabel}</span>
        <span className='text-uw-text'>{t.feeValue}</span>
      </div>
      <Button
        loading={u.status === 'pending'}
        disabled={!u.canSubmit}
        onClick={u.submit}
      >
        {u.status === 'pending'
          ? t.submitPending
          : u.lowSol
            ? t.lowSol
            : t.submit}
      </Button>
    </div>
  )
}
