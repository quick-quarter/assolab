import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AssoLab — Créez votre site d\'association en quelques secondes',
  description: 'AssoLab génère automatiquement le site web de votre association grâce à l\'IA. Sport, culture, solidarité, éducation — lancez-vous en 30 secondes.',
  keywords: ['association', 'site web', 'IA', 'générateur', 'AssoLab'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
