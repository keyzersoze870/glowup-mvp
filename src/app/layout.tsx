import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlowApp — Ton Glow Up Score',
  description: 'Ton Glow Up Score personnalisé. Corps, peau, mindset.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GlowApp',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'GlowApp',
    description: 'Ton score de transformation holistique',
  }
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preload" href="/selfie1.png" as="image" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
