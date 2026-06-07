import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'League 247 Command Center — The Breakroom 247',
  description: 'AI Agency Control Room · Built for Content. Wired for Growth.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="cmd-grid-bg min-h-screen">
        {children}
      </body>
    </html>
  )
}
