'use client'

import { useState } from 'react'
import { useConnect, useDisconnect, useWallets } from '@wallet-standard/react'
import type { UiWallet, UiWalletAccount } from '@wallet-standard/react'

export const SOLANA_MAINNET = 'solana:mainnet'

const btn: React.CSSProperties = {
  background: '#3b9dff',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '10px 20px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer'
}

function isSolanaWallet(w: UiWallet) {
  return (
    w.features.includes('standard:connect') &&
    w.chains.some((c) => c.startsWith('solana:'))
  )
}

function WalletRow({
  wallet,
  onConnect
}: {
  wallet: UiWallet
  onConnect: (wallet: UiWallet, account: UiWalletAccount) => void
}) {
  const [isConnecting, connect] = useConnect(wallet)
  return (
    <button
      type="button"
      disabled={isConnecting}
      onClick={async () => {
        const accounts = await connect()
        const account =
          accounts.find((a) => a.chains.includes(SOLANA_MAINNET)) ?? accounts[0]
        if (account) onConnect(wallet, account)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        background: 'transparent',
        color: '#eef1f6',
        border: 'none',
        padding: '10px 14px',
        fontSize: 14,
        cursor: isConnecting ? 'default' : 'pointer',
        opacity: isConnecting ? 0.6 : 1
      }}
    >
      {wallet.icon && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wallet.icon}
          alt=""
          width={20}
          height={20}
          style={{ borderRadius: 6 }}
        />
      )}
      {isConnecting ? 'Connecting…' : wallet.name}
    </button>
  )
}

/** Dropdown listing installed Solana wallets; calls `onConnect` once authorized. */
export function WalletConnectButton({
  onConnect
}: {
  onConnect: (wallet: UiWallet, account: UiWalletAccount) => void
}) {
  const wallets = useWallets().filter(isSolanaWallet)
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={btn}>
        Connect Wallet
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 8px)',
            minWidth: 220,
            background: '#11141b',
            border: '1px solid #1c2129',
            borderRadius: 14,
            padding: 6,
            zIndex: 10
          }}
        >
          {wallets.length === 0 ? (
            <div
              style={{ padding: '12px 14px', color: '#9aa1ad', fontSize: 13 }}
            >
              No Solana wallets detected.
            </div>
          ) : (
            wallets.map((w) => (
              <WalletRow
                key={w.name}
                wallet={w}
                onConnect={(wallet, account) => {
                  setOpen(false)
                  onConnect(wallet, account)
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/** Shows the connected address with a disconnect control. */
export function WalletAccountBadge({
  wallet,
  account,
  onDisconnect
}: {
  wallet: UiWallet
  account: UiWalletAccount
  onDisconnect: () => void
}) {
  const [isDisconnecting, disconnect] = useDisconnect(wallet)
  const short = `${account.address.slice(0, 4)}…${account.address.slice(-4)}`
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 13,
          color: '#9aa1ad',
          fontFamily: 'ui-monospace, monospace'
        }}
      >
        {short}
      </span>
      <button
        type="button"
        disabled={isDisconnecting}
        onClick={async () => {
          await disconnect()
          onDisconnect()
        }}
        style={{
          background: '#1a1f2b',
          color: '#eef1f6',
          border: '1px solid #1c2129',
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 13,
          cursor: 'pointer'
        }}
      >
        Disconnect
      </button>
    </div>
  )
}
