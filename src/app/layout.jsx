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
  title: 'Airborne Aviation Academy | DGCA CPL Ground School Delhi',
  description: 'India\'s most trusted DGCA CPL ground school in Dwarka, Delhi. Led by Capt. Navrang Singh with 15+ years of teaching excellence. Concept clarity, simulator training, and proven success.',
  metadataBase: new URL('https://airborneaviation.in'),
  alternates: {
    canonical: '/',
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
