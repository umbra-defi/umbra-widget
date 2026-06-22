import { AmountField } from '@/ui/amount-field'
import { Button } from '@/ui/button'
import { useReportFlowStatus } from '@/providers/flow-status'
import { useText } from '@/text/text-context'
import { useShield } from '../hooks/use-shield'

export function ShieldTab() {
  const s = useShield()
  const t = useText().shield
  useReportFlowStatus(s.status)
  return (
    <div className='flex flex-col gap-3'>
      <AmountField
        label={t.amountLabel}
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
        <span className='text-uw-text-secondary'>{t.feeLabel}</span>
        <span className='text-uw-text'>{t.feeValue}</span>
      </div>
      <Button
        loading={s.status === 'pending'}
        disabled={!s.canSubmit}
        onClick={s.submit}
      >
        {s.status === 'pending'
          ? t.submitPending
          : s.lowSol
            ? t.lowSol
            : t.submit}
      </Button>
    </div>
  )
}
