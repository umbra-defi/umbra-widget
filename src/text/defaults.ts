import type { WidgetTab } from '@/types'

/**
 * Every user-facing string the widget renders, fully resolved. The host
 * overrides any subset via {@link WidgetTextConfig}; unset fields fall back to
 * these defaults (see {@link mergeText}).
 *
 * Dynamic bits (countdown seconds, tx signature, claim count, addresses) are
 * interpolated by the component — these are the static labels around them.
 */
export interface WidgetText {
  /** Tab row labels, keyed by tab id. */
  tabs: Record<WidgetTab, string>
  registration: {
    title: string
    description: string
    /** Shown when the wallet can't cover registration fees. */
    lowSol: string
    submit: string
    submitPending: string
  }
  home: {
    balanceLabel: string
    assetHeader: string
    balanceHeader: string
    empty: string
    /** aria-label on the refresh button. */
    refresh: string
  }
  shield: {
    amountLabel: string
    feeLabel: string
    feeValue: string
    submit: string
    submitPending: string
    lowSol: string
  }
  transfer: {
    amountLabel: string
    recipientPlaceholder: string
    submit: string
    submitPending: string
    lowSol: string
  }
  unshield: {
    amountLabel: string
    feeLabel: string
    feeValue: string
    submit: string
    submitPending: string
    lowSol: string
  }
  receive: {
    title: string
    empty: string
    claim: string
    claimPending: string
    /** title attr on the refresh button. */
    refresh: string
    /** Prefix for notes you sent yourself: `To <addr>`. */
    toPrefix: string
    /** Prefix for notes someone sent you: `From <addr>`. */
    fromPrefix: string
  }
  amountField: {
    balanceLabel: string
    max: string
    /** title on the token/USD flip control. */
    switchCurrency: string
  }
  status: {
    /** Fallback when an error carries no message. */
    error: string
    /** Success line; tx signature is appended when present. */
    success: string
  }
  successOverlay: {
    /** Button label; the countdown (` · 5s`) is appended. */
    goHome: string
  }
}

/** Built-in English defaults. */
export const DEFAULT_TEXT: WidgetText = {
  tabs: {
    home: 'Home',
    shield: 'Shield',
    transfer: 'Transfer',
    unshield: 'Unshield',
    receive: 'Receive'
  },
  registration: {
    title: 'Register on Umbra Protocol',
    description:
      'Sign once to register your private account on Umbra Protocol. Your shielded keys are derived locally on your device — Umbra never sees them.',
    lowSol: 'Not enough SOL to cover registration fees.',
    submit: 'Get Started',
    submitPending: 'Setting up…'
  },
  home: {
    balanceLabel: 'Private Balance',
    assetHeader: 'Asset',
    balanceHeader: 'Private balance',
    empty: 'No supported tokens',
    refresh: 'Refresh balances'
  },
  shield: {
    amountLabel: "You're Shielding",
    feeLabel: 'Shielding Fee',
    feeValue: 'No Fee · $0.00',
    submit: 'Shield',
    submitPending: 'Shielding…',
    lowSol: 'Not enough SOL'
  },
  transfer: {
    amountLabel: "You're Sending",
    recipientPlaceholder: 'Recipient address',
    submit: 'Send Privately',
    submitPending: 'Sending…',
    lowSol: 'Not enough SOL'
  },
  unshield: {
    amountLabel: "You're Unshielding",
    feeLabel: 'Unshielding Fee',
    feeValue: 'No Fee · $0.00',
    submit: 'Unshield',
    submitPending: 'Unshielding…',
    lowSol: 'Not enough SOL'
  },
  receive: {
    title: 'Claimable Notes',
    empty: 'Nothing to claim',
    claim: 'Claim',
    claimPending: 'Claiming…',
    refresh: 'Refresh',
    toPrefix: 'To',
    fromPrefix: 'From'
  },
  amountField: {
    balanceLabel: 'Balance:',
    max: 'Max',
    switchCurrency: 'Switch input currency'
  },
  status: {
    error: 'Something went wrong',
    success: 'Done'
  },
  successOverlay: {
    goHome: 'Go Home'
  }
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/**
 * Host text overrides. Every field is optional and falls back to
 * {@link DEFAULT_TEXT}, so passing `{ shield: { submit: 'Deposit' } }` swaps
 * just that one label and leaves everything else as the built-in copy.
 */
export type WidgetTextConfig = DeepPartial<WidgetText>

/** Deep-merge a partial override over the defaults into a fully-resolved text. */
export function mergeText(config?: WidgetTextConfig): WidgetText {
  if (!config) return DEFAULT_TEXT
  const section = <K extends keyof WidgetText>(key: K): WidgetText[K] =>
    ({ ...DEFAULT_TEXT[key], ...config[key] }) as WidgetText[K]
  return {
    tabs: section('tabs'),
    registration: section('registration'),
    home: section('home'),
    shield: section('shield'),
    transfer: section('transfer'),
    unshield: section('unshield'),
    receive: section('receive'),
    amountField: section('amountField'),
    status: section('status'),
    successOverlay: section('successOverlay')
  }
}
