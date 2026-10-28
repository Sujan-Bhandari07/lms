import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from "@/src/components/Header"
import Footer from '@/src/components/Footer'
import { Sprite } from '@/src/components/Icon'

export const metadata: Metadata = {
  title: { default: 'Ujyalo — Learn Skills That Move You Forward', template: '%s — Ujyalo' },
  description: 'Structured online courses, recorded video lessons, certificates and AI-powered learning support.',
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
