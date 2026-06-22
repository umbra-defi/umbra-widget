import { Button } from '@/ui/button'
import { StatusRow } from '@/ui/status-row'
import { useRegistration } from '../hooks/use-registration'
import { BrandIcon } from '@/ui/brand-icon'
import { useText } from '@/text/text-context'

/**
 * Shown when the connected account has no private account yet. Registering
 * signs a message (to derive the master seed), then submits the on-chain
 * registration. On success the registration query invalidates and the shell
 * swaps to the tabs automatically.
 */
export function RegistrationScreen() {
  const r = useRegistration()
  const t = useText().registration

  const pending = r.status === 'pending'

  return (
    <div className='flex flex-col items-center gap-8 py-8 text-center'>
      <BrandIcon
        className={`h-24 w-24 ${pending ? 'animate-pulse-scale' : ''}`}
      />
      <div>
        <h2 className='text-2xl font-bold leading-tight text-uw-text'>
          {t.title}
        </h2>
        <p className='mt-3 text-base leading-relaxed text-uw-text-secondary'>
          {t.description}
        </p>
      </div>
      <div className='w-full'>
        {r.lowSol && (
          <p className='mb-2 text-sm font-medium text-uw-danger'>{t.lowSol}</p>
        )}
        <StatusRow status={r.status} error={r.error} />
        <Button
          className='mt-3'
          disabled={pending || r.isChecking || r.lowSol}
          onClick={r.register}
        >
          {pending ? t.submitPending : t.submit}
        </Button>
      </div>
    </div>
  )
}
