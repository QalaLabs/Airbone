import { Montserrat, Roboto } from 'next/font/google'
import '@/index.css'
import ToastContainer from '@/components/Toast'
import GlobalCursor from '@/components/GlobalCursor'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import StickyMobileCTA from '@/components/StickyMobileCTA'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-h',
  display: 'swap',
  adjustFontFallback: true,
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-b',
  display: 'swap',
  adjustFontFallback: true,
})

export const viewport = {
  themeColor: '#000810',
}

export const metadata = {
  title: 'DGCA CPL & ATPL Ground School Delhi | Airborne Aviation',
  description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. Capt. Navrang Singh. 2,500+ pilots placed in top airlines. Mentor-led batches of 25. Book free demo.",
  themeColor: '#000810',
  metadataBase: new URL('https://airborneaviation.academy'),
  icons: {
    icon: '/favicon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DGCA CPL & ATPL Ground School Delhi | Airborne Aviation',
    description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. 2,500+ pilots placed. Mentor-led batches of 25. Book free demo.",
    url: 'https://airborneaviation.academy',
    siteName: 'Airborne Aviation Academy',
    images: [
      {
        url: 'https://airborneaviation.academy/footage/cockpit_throttle_hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Airborne Aviation Academy — DGCA CPL Ground School, Dwarka Delhi',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DGCA CPL & ATPL Ground School Delhi | Airborne Aviation',
    description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. 2,500+ pilots placed. Mentor-led batches of 25.",
    images: ['https://airborneaviation.academy/footage/cockpit_throttle_hero.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </head>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <GlobalCursor />
        <ToastContainer />
        {children}
        <WhatsAppFloat />
        <StickyMobileCTA />
      </body>
    </html>
  )
}
