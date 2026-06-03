import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: { default: 'MaxiZoo Luxury — Premium Sklep Zoologiczny', template: '%s | MaxiZoo Luxury' },
  description: 'Ekskluzywny sklep zoologiczny z produktami premium dla Twojego pupila.',
  keywords: ['sklep zoologiczny', 'karma dla psów', 'karma dla kotów', 'maxizoo'],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    title: 'MaxiZoo Luxury — Premium Sklep Zoologiczny',
    description: 'Ekskluzywny sklep zoologiczny z produktami premium dla Twojego pupila.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(59,7,100,0.95)',
              color: '#f3e8ff',
              border: '1px solid rgba(147,51,234,0.4)',
              backdropFilter: 'blur(12px)',
            },
          }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
