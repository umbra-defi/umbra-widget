import { AmountField } from '@/ui/amount-field'
import { Button } from '@/ui/button'
import { useReportFlowStatus } from '@/providers/flow-status'
import { useTransfer } from '../hooks/use-transfer'

export function TransferTab() {
  const t = useTransfer()
  useReportFlowStatus(t.error ? 'error' : t.status)
  return (
    <div className='flex flex-col gap-3'>
      <AmountField
        label="You're Sending"
        amount={t.amount}
        onAmountChange={t.setAmount}
        token={t.token}
        tokens={t.tokens}
        onTokenChange={t.onTokenChange}
        balanceLabel={t.balanceLabel}
        onMax={t.onMax}
      />
      <input
        placeholder='Recipient address'
        value={t.recipient}
        onChange={(e) => t.setRecipient(e.target.value)}
        className='w-full rounded-uw-md border border-uw-border bg-uw-surface px-4 py-3 text-sm text-uw-text outline-none placeholder:text-uw-text-tertiary'
      />
      <Button disabled={!t.canSubmit} onClick={t.submit}>
        {t.status === 'pending'
          ? 'Sending…'
          : t.lowSol
            ? 'Not enough SOL'
            : 'Send Privately'}
      </Button>
    </div>
  )
}
