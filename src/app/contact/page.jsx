import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'

export const metadata = {
  title: 'Contact Airborne Aviation Academy Admissions, Dwarka Delhi',
  description: 'Contact Airborne Aviation Academy in Dwarka, Delhi. Admissions: +91 9953 777 320. E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', background: '#000810', padding: '4rem var(--margin) 6rem var(--margin)' }}>
        
        {/* Title */}
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

        {/* Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          
          {/* Contact Details & Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Contact Vectors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                  Direct Calling Line
                </span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF' }}>
                  +91 9953 777 320
                </span>
              </div>

              <div style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                  Electronic Mail
                </span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF' }}>
                  info@airborneaviation.in
                </span>
              </div>

              <div style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                  Office Timings
                </span>
                <span style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 900, color: '#FFFFFF' }}>
                  Mon – Sat: 9:30 AM – 6:00 PM
                </span>
              </div>

              <div style={{ borderLeft: '3px solid #DB241E', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '0.2rem', fontWeight: 700 }}>
                  Physical Location
                </span>
                <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', margin: 0 }}>
                  E-549, 2nd Floor, Ramphal Chowk, Sector 7, Dwarka.
                </p>
              </div>
            </div>

            {/* Embedded map card representation */}
            <div style={{ width: '100%', height: '300px', background: '#00162e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Dwarka Sector 7 Center
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5', margin: 0 }}>
                  Located approximately 50–100 metres from Ramphal Chowk Metro Station.
                </p>
              </div>
              
              {/* Mock visual map representation or simple Google Maps embed iframe */}
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.827931388656!2d77.06822247630267!3d28.589926875690325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1ad3d9d435cb%3A0xc3cf33887ebf4ef3!2sAirborne%20Aviation%20Academy%20%7C%20DGCA%20CPL%20%26%20ATPL%20Ground%20Classes!5e0!3m2!1sen!2sin!4v1718318000000!5m2!1sen!2sin" 
                width="100%" 
                height="180" 
                style={{ border: 0, borderRadius: '1px', background: '#000f1e' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Airborne Aviation Academy Location Map"
              ></iframe>
            </div>

          </div>

          {/* Lead Capture */}
          <div>
            <LeadForm courseName="DGCA CPL Ground School" source="Contact Page" />
          </div>

        </div>

      </main>
      <Footer />
    </>
  )
}
