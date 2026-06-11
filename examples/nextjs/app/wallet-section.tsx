'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react'
import {
  SOLANA_MAINNET,
  WalletAccountBadge,
  WalletConnectButton
} from './wallet-ui'

// The widget touches browser-only APIs at import time, so load it client-side
// only. Everything else in this file SSRs fine (wallet hooks return empty on
// the server).
const PrivateWidget = dynamic(
  () => import('./private-widget').then((m) => m.PrivateWidget),
  { ssr: false, loading: () => <p style={{ color: '#9aa1ad' }}>Loading…</p> }
)

export function WalletSection() {
  const [connected, setConnected] = useState<{
    wallet: UiWallet
    account: UiWalletAccount
  } | null>(null)
  const [open, setOpen] = useState(false)

  if (!connected) {
    return (
      <WalletConnectButton
        onConnect={(wallet, account) => setConnected({ wallet, account })}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#3b9dff',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          🛡 Go Private
        </button>
        <WalletAccountBadge
          wallet={connected.wallet}
          account={connected.account}
          onDisconnect={() => {
            setConnected(null)
            setOpen(false)
          }}
        />
      </div>

      <PrivateWidget
        account={connected.account}
        chain={SOLANA_MAINNET}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
