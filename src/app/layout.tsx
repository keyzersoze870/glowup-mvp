import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlowUp — Ta transformation commence ici',
  description: 'Ton Glow Up Score personnalisé. Corps, peau, mindset.',
  openGraph: {
    title: 'GlowUp',
    description: 'Ton score de transformation holistique',
  }
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
