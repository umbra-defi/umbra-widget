import { WalletSection } from './wallet-section'

// Server component (the host page). The wallet + widget live in a client island.
export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg,#3b9dff,#9b5cff)'
          }}
        />
        <strong style={{ fontSize: 18 }}>Acme Wallet</strong>
      </header>

      <p style={{ color: '#9aa1ad', fontSize: 14, marginTop: 40 }}>
        Next.js App Router · <code>@umbra-privacy/widget</code>
      </p>
      <h1 style={{ fontSize: 40, fontWeight: 300, margin: '4px 0 28px' }}>
        Go Private
      </h1>

      <WalletSection />

      <p style={{ color: '#5b6370', fontSize: 12, marginTop: 32 }}>
        Connect a Solana wallet, then open the Umbra widget. The widget is loaded
        client-side only (<code>ssr: false</code>) — it uses Web Workers,
        WebCrypto and IndexedDB.
      </p>
    </main>
  )
}
