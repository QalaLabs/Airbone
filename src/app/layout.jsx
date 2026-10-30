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
  themeColor: '#F9FAFB',
}

export const metadata = {
  title: 'DGCA-Compliant Pilot Training in Delhi | Airborne Aviation',
  description: 'DGCA-compliant CPL & ATPL ground school in Dwarka, New Delhi, since 2009.',
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
    title: 'DGCA-Compliant Pilot Training in Delhi | Airborne Aviation',
    description: 'DGCA-compliant CPL & ATPL ground school in Dwarka, New Delhi, since 2009.',
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
    title: 'DGCA-Compliant Pilot Training in Delhi | Airborne Aviation',
    description: 'DGCA-compliant CPL & ATPL ground school in Dwarka, New Delhi, since 2009.',
    images: ['https://www.airborneaviation.in/campus/og_image.jpg'],
  },
}

// L-06: env-driven integration IDs (current values are production defaults)
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-KCM9CDK9'
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-KB3Y1MSLR6'
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '974236902284876'
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || 'xv0yvv94yd'

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
})(window,document,'script','dataLayer','${GTM_ID}');`,
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
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA4_ID}');
          `}
        </Script>
        {/* Tracking Stubs - prevent errors if tracking calls happen before deferred scripts load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.fbq = window.fbq || function() {
                if (window.fbq.callMethod) {
                  window.fbq.callMethod.apply(window.fbq, arguments);
                } else {
                  (window.fbq.queue = window.fbq.queue || []).push(arguments);
                }
              };
              if (!window._fbq) window._fbq = window.fbq;
              window.fbq.push = window.fbq;
              window.fbq.loaded = false;
              window.fbq.version = '2.0';
              window.fbq.queue = window.fbq.queue || [];

              window.clarity = window.clarity || function() {
                (window.clarity.q = window.clarity.q || []).push(arguments);
              };
            `,
          }}
        />
        {/* Meta Pixel Code - deferred until after window.onload and browser idle */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            function initMetaPixel() {
              if (window.__metaPixelInitialized) return;
              window.__metaPixelInitialized = true;
              !function(f,b,e,v,n,t,s)
              {if(f.fbq && f.fbq.loaded)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=n.queue||[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            }
            if (typeof window !== 'undefined') {
              if (document.readyState === 'complete') {
                (window.requestIdleCallback || window.setTimeout)(initMetaPixel, 200);
              } else {
                window.addEventListener('load', function() {
                  (window.requestIdleCallback || window.setTimeout)(initMetaPixel, 200);
                }, { once: true });
              }
            }
          `}
        </Script>
        {/* End Meta Pixel Code */}
        {/* Microsoft Clarity - deferred until after window.onload and browser idle */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            function initClarity() {
              if (window.__clarityInitialized) return;
              window.__clarityInitialized = true;
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            }
            if (typeof window !== 'undefined') {
              if (document.readyState === 'complete') {
                (window.requestIdleCallback || window.setTimeout)(initClarity, 250);
              } else {
                window.addEventListener('load', function() {
                  (window.requestIdleCallback || window.setTimeout)(initClarity, 250);
                }, { once: true });
              }
            }
          `}
        </Script>
        {/* End Microsoft Clarity */}
      </head>
      <body className={`${montserrat.variable} ${roboto.variable}`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Meta Pixel (noscript) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {/* End Meta Pixel (noscript) */}
        <GlobalCursor />
        <ToastContainer />
        {children}
        <WhatsAppFloat />
        <StickyMobileCTA />
      </body>
    </html>
  )
}
