import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

export const metadata = {
  title: 'Contact Airborne Aviation Academy — Dwarka, Delhi | Capt. Navrang Singh',
  description: 'Contact Airborne Aviation Academy, Dwarka Delhi. Led by Capt. Navrang Singh. E-549, Ramphal Chowk, Sector 7. CPL, ATPL, DGCA ground classes. +91 9953 777 320.',
  alternates: { canonical: 'https://www.airborneaviation.in/contact/' },
  openGraph: {
    title: 'Contact Airborne Aviation Academy — Dwarka, Delhi | Capt. Navrang Singh',
    description: 'Contact Airborne Aviation Academy, Dwarka Delhi. Led by Capt. Navrang Singh. E-549, Ramphal Chowk, Sector 7.',
    url: 'https://www.airborneaviation.in/contact/',
    type: 'website',
    images: [{ url: 'https://www.airborneaviation.in/footage/hero-cockpit.jpg', width: 1200, height: 630, alt: 'Contact Airborne Aviation Academy' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Airborne Aviation Academy — Dwarka, Delhi | Capt. Navrang Singh',
    description: 'Contact Airborne Aviation Academy, Dwarka Delhi. Led by Capt. Navrang Singh.',
    images: ['https://www.airborneaviation.in/footage/hero-cockpit.jpg'],
  },
}

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.827!2d77.0716207!3d28.5845678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1b3d46bcd1c7%3A0x53f77b8485d61bbe!2sAirborne+Aviation+Led+by+Capt+Navrang+Singh!5e0!3m2!1sen!2sin!4v1!5m2!1sen!2sin'

const MAPS_URL = 'https://maps.app.goo.gl/1CrvhRumCLtog8VL8'

const MAPS_DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&destination=28.5845678,77.0716207&destination_place_id=0x390d1b3d46bcd1c7:0x53f77b8485d61bbe'

const CONTACT = [
  { label: 'Direct Calling Line', value: '+91 9953 777 320', href: 'tel:+919953777320', secondary: '+91 9818 282 209', secondaryHref: 'tel:+919818282209' },
  { label: 'WhatsApp Support', value: '+91 9953 777 320', href: 'https://wa.me/919953777320' },
  { label: 'Electronic Mail', value: 'info@airborneaviation.in', href: 'mailto:info@airborneaviation.in' },
  { label: 'Office Timings', value: 'Mon – Sat: 9:30 AM – 6:00 PM', sub: '(Closed on Sundays)' },
  { label: 'Head Office', value: 'E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka, New Delhi — 110075', href: MAPS_URL },
  { label: 'Registered Office', value: 'B-104, Himachal Apartment, Sector 5, Dwarka, New Delhi — 110078' },
]

export default function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        <div className="container-xl">

        <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <p className="ov-eyebrow" style={{ margin: 0, justifyContent: 'flex-start' }}>Admissions Desk</p>
          <h1 className="ov-h1" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Get In Touch &amp;
            <em style={{ color: '#D8A027', fontStyle: 'normal' }}> Visit Dwarka.</em>
          </h1>
          <p className="ov-body" style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '100%' }}>
            Book a 90-minute demo class with Capt. Navrang Singh or visit our center for career counseling.
          </p>
        </div>

        <div className="grid-2col" style={{ gap: '4rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {CONTACT.map((item) => (
                <div key={item.label} style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                  <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                    {item.label}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') && !item.href.startsWith('tel:') && !item.href.startsWith('mailto:') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') && !item.href.startsWith('tel:') && !item.href.startsWith('mailto:') ? 'noopener noreferrer' : undefined}
                      className="contact-link"
                      style={{ fontFamily: 'var(--font-h)', fontSize: item.label === 'Direct Calling Line' ? '1.5rem' : '1.2rem', fontWeight: 900, textDecoration: 'none', display: 'block' }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF', display: 'block' }}>
                      {item.value}
                    </span>
                  )}
                  {item.secondary && (
                    <a
                      href={item.secondaryHref}
                      className="contact-link"
                      style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 900, textDecoration: 'none', display: 'block', marginTop: '0.25rem' }}
                    >
                      {item.secondary}
                    </a>
                  )}
                  {item.sub && (
                    <span style={{ fontFamily: 'var(--font-b)', fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', display: 'block', marginTop: '0.15rem' }}>
                      {item.sub}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              width: '100%', borderRadius: '24px', overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              background: '#00162e', position: 'relative', isolation: 'isolate',
            }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', minHeight: '280px' }}>
                <iframe
                  src={MAP_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0, position: 'absolute', inset: 0, }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Airborne Aviation Academy — Official Google Maps Location"
                />
              </div>
            </div>

            <div style={{
              background: '#00162e', border: '1px solid rgba(216,160,39,0.2)',
              borderRadius: '24px', padding: '2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Airborne Aviation Academy
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', margin: 0 }}>
                  Led by Capt. Navrang Singh
                </p>
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'block', marginBottom: '0.5rem', opacity: 1, transition: 'opacity 0.2s' }}
              >
                <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', margin: 0 }}>
                  E-549, 2nd Floor, Ramphal Chowk,<br />
                  Sector 7, Dwarka, New Delhi — 110075
                </p>
              </a>
              <p style={{ fontSize: '0.78rem', color: '#D8A027', lineHeight: '1.5', margin: '0 0 1.25rem', fontStyle: 'italic' }}>
                Located just a short walk (approximately 10 metres) from Ramphal Chowk, or less than 1 km from Palam Metro Station and Dwarka Sector 9 Metro Station.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a
                  href={MAPS_DIRECTIONS}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.78rem' }}
                >
                  Get Directions
                </a>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                  style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.78rem' }}
                >
                  Open in Google Maps
                </a>
              </div>
            </div>

          </div>

          <div>
            <LeadForm courseName="DGCA CPL Ground School" source="Contact Page" />
          </div>

        </div>
        </div>

      </main>
      <Footer />
    </>
  )
}
