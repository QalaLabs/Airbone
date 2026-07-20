import { Montserrat, Roboto } from 'next/font/google'
import Script from 'next/script'
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
  title: 'Pilot Training in Delhi | DGCA Approved | Airborne Aviation',
  description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. Capt. Navrang Singh. 2,500+ pilots placed in top airlines. Mentor-led batches of 25. Book free demo.",
  metadataBase: new URL('https://www.airborneaviation.in'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pilot Training in Delhi | DGCA Approved | Airborne Aviation',
    description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. 2,500+ pilots placed. Mentor-led batches of 25. Book free demo.",
    url: 'https://www.airborneaviation.in',
    siteName: 'Airborne Aviation Academy',
    images: [
      {
        url: 'https://www.airborneaviation.in/campus/og_image.jpg',
        width: 945,
        height: 630,
        alt: 'Airborne Aviation Academy — DGCA CPL Ground School, Dwarka Delhi',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pilot Training in Delhi | DGCA Approved | Airborne Aviation',
    description: "India's top DGCA CPL & ATPL ground school in Dwarka, Delhi. 2,500+ pilots placed. Mentor-led batches of 25.",
    images: ['https://www.airborneaviation.in/campus/og_image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KB3Y1MSLR6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-KB3Y1MSLR6');
          `}
        </Script>
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
