import { UmbraWidgetInline } from '@/index'
import { useState } from 'react'
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react'
import {
  SOLANA_MAINNET,
  WalletAccountBadge,
  WalletConnectButton
} from './wallet/wallet-connect'
import { useWidgetSigner } from './wallet/use-widget-signer'

// Hardcoded mainnet RPC (from mobile-wallet's EXPO_PUBLIC_HELIUS_SOL_URL).
const RPC_URL = 'https://jacklin-n6jvhy-fast-mainnet.helius-rpc.com'

// ── Dummy host-page content so the widget reads as a real embed overlay ──
const HOLDINGS = [
  { sym: 'SOL', name: 'Solana', amt: '12.48', usd: '$2,140.16' },
  { sym: 'USDC', name: 'USD Coin', amt: '24,983.21', usd: '$24,983.21' },
  { sym: 'JUP', name: 'Jupiter', amt: '5,120.00', usd: '$3,891.20' },
  { sym: 'BONK', name: 'Bonk', amt: '12,400,000', usd: '$310.00' }
]

const ACTIVITY = [
  { t: 'Received', d: 'from 7xKf…9aQ2', v: '+2.5 SOL' },
  { t: 'Swapped', d: 'USDC → JUP', v: '−500 USDC' },
  { t: 'Sent', d: 'to 3mРa…4bL1', v: '−120 USDC' }
]

export function App() {
  const [connected, setConnected] = useState<{
    wallet: UiWallet
    account: UiWalletAccount
  } | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#0b0d12',
        color: '#eef1f6',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        padding: '0'
      }}
    >
      {/* fake app nav */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: '1px solid #1c2129'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#3b9dff,#9b5cff)'
            }}
          />
          <strong style={{ fontSize: 18 }}>Acme Wallet</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {connected ? (
            <>
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
            </>
          ) : (
            <WalletConnectButton
              onConnect={(wallet, account) => setConnected({ wallet, account })}
            />
          )}
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <p style={{ color: '#9aa1ad', fontSize: 14, margin: 0 }}>
          Total balance
        </p>
        <h1 style={{ fontSize: 44, fontWeight: 300, margin: '4px 0 28px' }}>
          $31,324.57
        </h1>

        <section
          style={{
            background: '#11141b',
            border: '1px solid #1c2129',
            borderRadius: 20,
            padding: 8,
            marginBottom: 24
          }}
        >
          {HOLDINGS.map((h) => (
            <div
              key={h.sym}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: '#1a1f2b',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 13,
                  fontWeight: 700
                }}
              >
                {h.sym.slice(0, 2)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ fontSize: 15 }}>{h.sym}</strong>
                <span style={{ color: '#9aa1ad', fontSize: 12 }}>{h.name}</span>
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <strong style={{ fontSize: 15 }}>{h.amt}</strong>
                <span style={{ color: '#9aa1ad', fontSize: 12 }}>{h.usd}</span>
              </div>
            </div>
          ))}
        </section>

        {connected && (
          <WidgetMount
            account={connected.account}
            open={open}
            onOpenChange={setOpen}
          />
        )}
        <p
          style={{
            color: '#9aa1ad',
            fontSize: 13,
            fontWeight: 600,
            margin: '0 0 8px 4px'
          }}
        >
          Recent activity
        </p>
        <section
          style={{
            background: '#11141b',
            border: '1px solid #1c2129',
            borderRadius: 20,
            padding: 8
          }}
        >
          {ACTIVITY.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px'
              }}
            >
              <strong style={{ fontSize: 14 }}>{a.t}</strong>
              <span style={{ color: '#9aa1ad', fontSize: 13 }}>{a.d}</span>
              <span style={{ marginLeft: 'auto', fontSize: 14 }}>{a.v}</span>
            </div>
          ))}
        </section>

        <p style={{ color: '#5b6370', fontSize: 12, marginTop: 32 }}>
          Click “Go Private” to open the Umbra widget. Click the dimmed backdrop
          or press Esc to close it.
        </p>
      </main>
    </div>
  )
}

/** Builds the kit signer from the connected account (hooks) and mounts the widget. */
function WidgetMount({
  account,
  open,
  onOpenChange
}: {
  account: UiWalletAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const signer = useWidgetSigner(account, SOLANA_MAINNET)
  return (
    <UmbraWidgetInline
      signer={signer}
      rpcUrl={RPC_URL}
      network='mainnet'
      // ui={umbraThemeDark}
      tabs={['home', 'shield', 'transfer', 'unshield', 'receive']}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
