import { Montserrat, Roboto } from 'next/font/google'
import '@/index.css'
import ToastContainer from '@/components/Toast'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-h',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-b',
  display: 'swap',
})

export const metadata = {
  title: 'Pilot Training in Delhi — DGCA Approved | Airborne Aviation',
  description: "India's DGCA-approved pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School. 200+ graduates in top airlines. Enrol today.",
  metadataBase: new URL('https://airborneaviation.in'),
  alternates: {
    canonical: 'https://airborneaviation.in/',
  },
  openGraph: {
    title: 'Pilot Training in Delhi — DGCA Approved | Airborne Aviation',
    description: "India's DGCA-approved pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School. 200+ graduates in top airlines.",
    url: 'https://airborneaviation.in',
    siteName: 'Airborne Aviation Academy',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://airborneaviation.in/footage/hero-cockpit.jpg',
        width: 1200,
        height: 630,
        alt: 'Airborne Aviation Academy — DGCA Approved Pilot Training, Dwarka Delhi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pilot Training in Delhi — DGCA Approved | Airborne Aviation',
    description: "India's DGCA-approved pilot training academy in Dwarka, Delhi. CPL, ATPL, Cabin Crew & Ground School.",
    images: ['https://airborneaviation.in/footage/hero-cockpit.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        <ToastContainer />
        {children}
      </body>
    </html>
  )
}
