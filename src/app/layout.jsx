import { Montserrat, Roboto } from 'next/font/google'
import Script from 'next/script'
import '@/index.css'
import ToastContainer from '@/components/Toast'
import GlobalCursor from '@/components/GlobalCursor'
import WhatsAppFloat from '@/components/WhatsAppFloat'
import StickyMobileCTA from '@/components/StickyMobileCTA'
import ClarityInit from '@/components/ClarityInit'

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
  themeColor: '#F9FAFB',
}

export const metadata = {
  title: 'Pilot Training in Delhi DGCA Complied | Airborne Aviation',
  description: "India's DGCA Complied pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School. 2,500+ graduates in top airlines. Enrol today.",
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
    title: 'Pilot Training in Delhi DGCA Complied | Airborne Aviation',
    description: "India's DGCA Complied pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School. 2,500+ graduates in top airlines. Enrol today.",
    url: 'https://www.airborneaviation.in',
    siteName: 'Airborne Aviation Academy',
    images: [
      {
        url: 'https://www.airborneaviation.in/campus/og_image.jpg',
        width: 945,
        height: 630,
        alt: 'Airborne Aviation Academy - DGCA CPL Ground School, Dwarka Delhi',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pilot Training in Delhi DGCA Complied | Airborne Aviation',
    description: "India's DGCA Complied pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School. 2,500+ graduates in top airlines. Enrol today.",
    images: ['https://www.airborneaviation.in/campus/og_image.jpg'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KCM9CDK9');`,
          }}
        />
        {/* End Google Tag Manager */}
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KCM9CDK9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ClarityInit />
        <GlobalCursor />
        <ToastContainer />
        {children}
        <WhatsAppFloat />
        <StickyMobileCTA />
      </body>
    </html>
  )
}
