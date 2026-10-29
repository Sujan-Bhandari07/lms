import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Sprite } from '@/src/components/Icon'
import Providers from '@/src/services/Providers'

export const metadata: Metadata = {
  title: { default: 'Ujyalo — Learn Skills That Move You Forward', template: '%s — Ujyalo' },
  description: 'Sign in to Ujyalo or create a learner or tutor account.',
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Sprite />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
