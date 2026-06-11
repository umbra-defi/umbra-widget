import type { ReactNode } from 'react'
// Required: ships the widget's scoped styles.
import '@umbra-privacy/widget/styles.css'
import './globals.css'

export const metadata = {
  title: 'Umbra Widget — Next.js example',
  description: 'Embeds @umbra-privacy/widget in a Next.js App Router app.'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
