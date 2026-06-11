import { Button } from '@/ui/button'
import { StatusRow } from '@/ui/status-row'
import { useRegistration } from '../hooks/use-registration'
import iconUrl from '@/assets/icon.png'

/**
 * Shown when the connected account has no private account yet. Registering
 * signs a message (to derive the master seed), then submits the on-chain
 * registration. On success the registration query invalidates and the shell
 * swaps to the tabs automatically.
 */
export function RegistrationScreen() {
  const r = useRegistration()

  const pending = r.status === 'pending'

  return (
    <div className='flex flex-col items-center gap-8 py-8 text-center'>
      <img
        src={iconUrl}
        alt=''
        className={`h-24 w-24 rounded-2xl ${
          pending ? 'animate-pulse-scale' : ''
        }`}
      />
      <div>
        <h2 className='text-2xl font-bold leading-tight text-uw-text'>
          Register on Umbra Protocol
        </h2>
        <p className='mt-3 text-base leading-relaxed text-uw-text-secondary'>
          Sign once to register your private account on Umbra Protocol. Your
          shielded keys are derived locally on your device — Umbra never sees
          them.
        </p>
      </div>
      <div className='w-full'>
        {r.lowSol && (
          <p className='mb-2 text-sm font-medium text-uw-danger'>
            Not enough SOL to cover registration fees.
          </p>
        )}
        <StatusRow status={r.status} error={r.error} />
        <Button
          className='mt-3'
          disabled={pending || r.isChecking || r.lowSol}
          onClick={r.register}
        >
          {pending ? 'Setting up…' : 'Get Started'}
        </Button>
      </div>
    </div>
  )
}
