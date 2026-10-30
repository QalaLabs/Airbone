/**
 * Canonical Site Pages Catalog for Airborne Studio Visual Website Builder
 * Ensures all website pages exist in the CMS database with rich, editable sections.
 */

export interface CanonicalPageDef {
  title: string;
  slug: string;
  description: string;
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string[];
  ogImage?: string;
  sections: Array<{
    name: string;
    settings?: Record<string, any>;
    blocks: Array<{
      type: string;
      props: Record<string, any>;
    }>;
  }>;
}

export const CANONICAL_PAGES: CanonicalPageDef[] = [
  // ─── 1. HOMEPAGE ──────────────────────────────────────────────────────────
  {
    title: "Airborne Aviation Academy Homepage",
    slug: "home",
    description: "DGCA-compliant aviation training academy in Dwarka, New Delhi. Offers CPL and ATPL ground school, cadet preparation, and A320 simulator familiarisation.",
    seoTitle: "DGCA-Compliant Pilot Training in Delhi | Airborne Aviation",
    seoDesc: "DGCA-compliant CPL & ATPL ground school in Dwarka, New Delhi, since 2009. CPL ground classes, airline cadet preparation, A320 simulator familiarisation.",
    seoKeywords: ["pilot training delhi", "dgca ground school", "cpl classes dwarka", "cadet pilot preparation"],
    ogImage: "/images/hero-cockpit.jpg",
    sections: [
      {
        name: "Hero Banner",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ INDIA'S PREMIER GROUND SCHOOL",
              heading: "FROM CLASSROOM TO COCKPIT",
              subheading: "Founder-led DGCA-compliant ground school since 2009 for CPL & ATPL. Mentor-led training under Capt. Navrang Singh - clearing exams, building careers, restarting dreams.",
              ctaText: "Enrol Now",
              ctaLink: "#contact",
              secondaryCtaText: "Explore Courses",
              secondaryCtaLink: "/courses",
            },
          },
        ],
      },
      {
        name: "Stats & Achievements",
        settings: { background: "white", padding: "compact", maxWidth: "standard" },
        blocks: [
          {
            type: "stats",
            props: {
              items: [
                { value: "Since 2009", label: "DGCA Ground School" },
                { value: "5/5", label: "Papers Cleared in 3 Months" },
                { value: "2,500+", label: "Pilots & Crew Mentored" },
                { value: "98%", label: "First-Attempt Pass Rate" },
              ],
            },
          },
        ],
      },
      {
        name: "Airline Placement Logos",
        settings: { background: "light", padding: "compact", maxWidth: "standard" },
        blocks: [
          {
            type: "airline_logos",
            props: {
              heading: "Airlines Flying With Airborne Cadets & Alumni",
              airlines: [
                { name: "IndiGo", code: "6E" },
                { name: "Air India", code: "AI" },
                { name: "Akasa Air", code: "QP" },
                { name: "SpiceJet", code: "SG" },
                { name: "Air India Express", code: "IX" },
              ],
            },
          },
        ],
      },
      {
        name: "The Airborne Advantage",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "features",
            props: {
              title: "The Airborne Advantage",
              subtitle: "Why India's future airline commanders choose Airborne Aviation",
              items: [
                { icon: "🧑‍✈️", title: "Founder-Led Instruction", description: "All 5 DGCA papers taught directly by Capt. Navrang - no junior staff on core subjects." },
                { icon: "🛫", title: "A320 Procedure Trainer", description: "Cockpit familiarisation before flight school so you walk in confident." },
                { icon: "🎯", title: "1-on-1 Mentorship", description: "Individual doubt-solving sessions with veteran airline check captains." },
              ],
            },
          },
        ],
      },
      {
        name: "Chief Instructor Spotlight",
        settings: { background: "light", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "mentor_card",
            props: {
              name: "Capt. Navrang Singh",
              role: "Chief Flying Instructor & Founder",
              flightHours: "18,500+ Hours",
              aircraftTypes: "Airbus A320, Boeing 737, Cessna 172",
              bio: "Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR - taught the way you'll actually use them in the cockpit.",
            },
          },
        ],
      },
      {
        name: "Campus Walkthrough",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "campus_walkthrough",
            props: {
              title: "Modern Ground Training Facility in Dwarka",
              subtitle: "Ramphal Chowk, Sector 9, Dwarka, New Delhi · Less than 1 km from Palam and Sector 9 Metro Stations.",
              features: [
                "Air-conditioned smart lecture rooms",
                "Airbus A320 procedural trainer bay",
                "Comprehensive DGCA exam question bank",
                "Free 90-minute demo class with Capt. Navrang",
              ],
            },
          },
        ],
      },
      {
        name: "Frequently Asked Questions",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "faq",
            props: {
              title: "Frequently Asked Questions",
              items: [
                { question: "What are the eligibility requirements for CPL Ground School?", answer: "Candidates must have cleared 10+2 with Physics and Mathematics (or equivalent NIOS certification) and be at least 17 years old to begin ground training." },
                { question: "Is Airborne Aviation an FTO or a Ground School?", answer: "Airborne is a specialist DGCA ground school and airline cadet preparation academy. We guide flight training placements with top partner flying clubs in India and abroad." },
                { question: "Which medical certificate is required before enrolling?", answer: "You can start ground school with a DGCA Class 2 Medical certificate. Class 1 Medical is required prior to starting flight training." },
              ],
            },
          },
        ],
      },
      {
        name: "Call to Action",
        settings: { background: "navy", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "cta_banner",
            props: {
              title: "Visit Our Dwarka Center & Sit In On A Class",
              description: "Meet Capt. Navrang Singh in person. Free 90-minute demo class with zero commitment.",
              buttonText: "Book Free Counseling Session",
              buttonLink: "#contact",
            },
          },
        ],
      },
    ],
  },

  // ─── 2. AIRLINE CADET PREPARATION ──────────────────────────────────────────
  {
    title: "Cadet Pilot Program Preparation",
    slug: "cadet-preparation",
    description: "Prepare for IndiGo, Air India & Akasa cadet pilot programs at Airborne, Dwarka. Aptitude tests, GD-PI & simulator prep since 2009.",
    seoTitle: "Airline Cadet Pilot Program Preparation | Airborne Aviation",
    seoDesc: "IndiGo, Air India and Akasa Air cadet pilot assessment prep. Psychometrics, Compass/ADAPT aptitude, simulator flying and interview panel training.",
    seoKeywords: ["cadet pilot program", "indigo cadet prep", "air india cadet", "adapt aptitude test"],
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ DIRECT AIRLINE ROUTE",
              heading: "A DIRECT ROUTE TO THE AIRLINE COCKPIT",
              subheading: "Structured pilot cadet preparation for IndiGo, Air India, and Akasa Air entrance assessments.",
              ctaText: "Apply For Cadet Assessment",
              ctaLink: "#contact",
            },
          },
        ],
      },
      {
        name: "Cadet Selection Stages",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "cadet_stages",
            props: {
              heading: "Six-Stage Airline Cadet Selection Pathway",
              stages: [
                { stage: "Stage 01", name: "Online Application", desc: "Resume crafting and document preparation" },
                { stage: "Stage 02", name: "Aptitude Test", desc: "Full mock test battery (ADAPT/Compass) with performance analysis" },
                { stage: "Stage 03", name: "Psychometric Evaluation", desc: "Psychometric familiarisation sessions" },
                { stage: "Stage 04", name: "Simulator Assessment", desc: "A320 simulator preparation at Airborne" },
                { stage: "Stage 05", name: "GD + PI Round", desc: "Mock GD/PI with feedback from airline pilots" },
                { stage: "Stage 06", name: "Medical", desc: "DGCA Class 1 Medical briefing and guidance" },
              ],
            },
          },
        ],
      },
      {
        name: "Cadet FAQs",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "faq",
            props: {
              title: "Cadet Program FAQs",
              items: [
                { question: "What is the eligibility for airline cadet pilot programmes?", answer: "10+2 with Physics, Mathematics and English, a minimum age of 18, and clearing a DGCA Class 1 medical before training." },
                { question: "Does Airborne guarantee cadet selection?", answer: "No. Selection is entirely the airline's decision. Airborne prepares candidates to perform at their best at each round to clear in the first attempt." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── 3. COMMERCIAL PILOT LICENSE (CPL) ────────────────────────────────────
  {
    title: "Commercial Pilot License (CPL) Ground School",
    slug: "commercial-pilot-license-cpl",
    description: "Master all 5 DGCA ground theory exams with guaranteed first-attempt preparation led by veteran airline check captains.",
    seoTitle: "CPL Ground School Delhi | DGCA Commercial Pilot Training",
    seoDesc: "Pass DGCA CPL exams in 4-5 months. Air Navigation, Meteorology, Air Regs, Technical General and Technical Specific.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ DGCA CPL GROUND SCHOOL",
              heading: "COMMERCIAL PILOT LICENSE GROUND CLASSES",
              subheading: "Intensive 4-5 month syllabus covering Air Navigation, Meteorology, Air Regulations, and Technical subjects.",
              ctaText: "Enrol in Next Batch",
              ctaLink: "#contact",
            },
          },
        ],
      },
      {
        name: "Fee & Pricing",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "pricing_table",
            props: {
              courseName: "CPL Ground School (All 5 DGCA Subjects)",
              regularFee: "₹1,85,000",
              scholarshipFee: "₹1,45,000",
              batchStarts: "1st & 15th of Every Month",
              duration: "4 - 5 Months Intensive",
              includes: [
                "Air Navigation, Meteorology, Air Regulations, Technical General & Specific",
                "Daily Mock Exams & 10-Year Question Bank Access",
                "RTR (A) Wireless Telegraphy Prep Included",
                "Free 1-on-1 Doubt Solving Sessions",
              ],
            },
          },
        ],
      },
      {
        name: "WhatsApp Quick Enquire",
        settings: { background: "light", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "whatsapp_cta",
            props: {
              headline: "Need Guidance on CPL Pilot Eligibility?",
              subtext: "Chat directly with our senior Chief Aviation Counselor on WhatsApp.",
              buttonText: "Chat on WhatsApp Now",
              phone: "+919999123456",
            },
          },
        ],
      },
    ],
  },

  // ─── 4. CABIN CREW TRAINING ───────────────────────────────────────────────
  {
    title: "Cabin Crew & In-Flight Services Training",
    slug: "cabin-crew-training",
    description: "Comprehensive 3-month cabin crew certification program covering emergency drills, in-flight service, and airline interview skills.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ AIRLINE CABIN CREW",
              heading: "SOAR THE SKIES AS AIRLINE CABIN CREW",
              subheading: "Hands-on grooming, mock cabin drills, aviation first aid, and interview mastery for domestic and international carriers.",
              ctaText: "Apply For Next Batch",
              ctaLink: "#contact",
            },
          },
        ],
      },
      {
        name: "Features",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "features",
            props: {
              title: "Comprehensive Flight Attendant Curriculum",
              items: [
                { icon: "💄", title: "Grooming & In-Flight Protocol", description: "Personal styling, etiquette, and premium hospitality standards." },
                { icon: "🦺", title: "Safety & Emergency Drills", description: "Evacuation slides, ditching, fire fighting, and aviation medicine." },
                { icon: "🎤", title: "Airline Interview Prep", description: "Group discussion, role-play scenarios, and English fluency training." },
              ],
            },
          },
        ],
      },
    ],
  },

  // ─── 5. DGCA GROUND SCHOOL ────────────────────────────────────────────────
  {
    title: "DGCA Ground School Theory Classes",
    slug: "ground-school",
    description: "Master all core aviation theory subjects required by the Directorate General of Civil Aviation for pilot licensing in India.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ DGCA GROUND THEORY",
              heading: "MASTER DGCA GROUND EXAMS WITH CONFIDENCE",
              subheading: "Structured conceptual training with proven first-attempt success since 2009.",
              ctaText: "Book Free Demo Class",
              ctaLink: "#contact",
            },
          },
        ],
      },
    ],
  },

  // ─── 6. A320 SIMULATOR ────────────────────────────────────────────────────
  {
    title: "Airbus A320 Simulator Familiarisation",
    slug: "a320-simulator",
    description: "Hands-on cockpit instrumentation and procedure training on our state-of-the-art Airbus A320 flight trainer in Dwarka.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ A320 SIMULATOR",
              heading: "STEP INSIDE THE AIRBUS A320 COCKPIT",
              subheading: "Procedure trainer familiarisation before flying school so you transition to the jet flight deck seamlessly.",
              ctaText: "Schedule Sim Session",
              ctaLink: "#contact",
            },
          },
        ],
      },
    ],
  },

  // ─── 7. PILOT APTITUDE COMPASS & ADAPT ─────────────────────────────────────
  {
    title: "Airline Pilot Aptitude Compass & ADAPT Prep",
    slug: "cas-compass-adapt",
    description: "Prepare for airline cadet pilot aptitude software assessments including Compass and ADAPT with real software simulation.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ PILOT APTITUDE",
              heading: "CRACK AIRLINE COMPASS & ADAPT TESTS",
              subheading: "Multitasking, spatial reasoning, eye-hand joystick tracking, and aviation math drills.",
              ctaText: "Start Aptitude Practice",
              ctaLink: "#contact",
            },
          },
        ],
      },
    ],
  },

  // ─── 8. FLYING TRAINING INDIA & ABROAD ────────────────────────────────────
  {
    title: "Flying Training (India & Abroad 200 Hours)",
    slug: "flying-training-india-abroad",
    description: "Strategic mentorship on choosing the right flight training academy in India, USA, South Africa, or New Zealand for your 200 flying hours.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ 200 FLIGHT HOURS",
              heading: "200 HOURS FLYING TRAINING — INDIA VS ABROAD",
              subheading: "Complete comparison of flight academy costs, aircraft fleet, weather delays, and DGCA license conversion.",
              ctaText: "Get Flight Training Roadmap",
              ctaLink: "#contact",
            },
          },
        ],
      },
    ],
  },

  // ─── 9. ABOUT US ──────────────────────────────────────────────────────────
  {
    title: "About Airborne Aviation Academy",
    slug: "about",
    description: "Founded in 2009 by Capt. Navrang Singh, Airborne Aviation is North India's premier ground school and airline cadet mentor academy.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ ESTABLISHED 2009",
              heading: "ABOUT AIRBORNE AVIATION ACADEMY",
              subheading: "Over 15 years of flight training excellence, inspiring the next generation of airline commanders in New Delhi.",
              ctaText: "Contact Admissions",
              ctaLink: "#contact",
            },
          },
        ],
      },
      {
        name: "Mentor Spotlight",
        settings: { background: "white", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "mentor_card",
            props: {
              name: "Capt. Navrang Singh",
              role: "Chief Flying Instructor & Founder",
              flightHours: "18,500+ Hours",
              bio: "Dedicated to transparent, high-standard aviation education with no shortcuts. Mentor to over 2,500 airline pilots and cabin crew.",
            },
          },
        ],
      },
    ],
  },

  // ─── 10. CONTACT US ───────────────────────────────────────────────────────
  {
    title: "Contact & Admissions Center",
    slug: "contact",
    description: "Visit our campus at Ramphal Chowk, Dwarka Sector 9, New Delhi or schedule a 1-on-1 counseling session with our Chief Ground Instructor.",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious", maxWidth: "standard" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ CAMPUS VISITS OPEN",
              heading: "VISIT OUR NEW DELHI CAMPUS",
              subheading: "Located at Ramphal Chowk, Dwarka Sector 9 — less than 1 km from Palam and Dwarka Sector 9 Metro Stations.",
              ctaText: "Schedule Visit",
              ctaLink: "#visit",
            },
          },
        ],
      },
      {
        name: "WhatsApp Quick Contact",
        settings: { background: "light", padding: "normal", maxWidth: "standard" },
        blocks: [
          {
            type: "whatsapp_cta",
            props: {
              headline: "Speak Directly With Admissions on WhatsApp",
              subtext: "Instant guidance on batch start dates, fees, and eligibility.",
              buttonText: "Chat on WhatsApp Now",
              phone: "+919999123456",
            },
          },
        ],
      },
    ],
  },

  // ─── 11. TERMS OF SERVICE ─────────────────────────────────────────────────
  {
    title: "Terms of Service",
    slug: "terms",
    description: "Terms and conditions governing enrolment, attendance, examinations, and code of conduct at Airborne Aviation Academy.",
    sections: [
      {
        name: "Terms Content",
        settings: { background: "white", padding: "normal", maxWidth: "narrow" },
        blocks: [
          {
            type: "heading",
            props: { content: "Terms of Service & Enrolment Guidelines", level: 1 },
          },
          {
            type: "rich_text",
            props: {
              content: "<p>Welcome to Airborne Aviation Academy. By enrolling in our courses or using our website, you agree to comply with our academic guidelines, attendance criteria, and payment policies.</p><p>All course materials, mock test question banks, and procedure manuals remain the intellectual property of Airborne Aviation.</p>",
            },
          },
        ],
      },
    ],
  },

  // ─── 12. PRIVACY POLICY ───────────────────────────────────────────────────
  {
    title: "Privacy Policy",
    slug: "privacy",
    description: "Privacy policy detailing how student and applicant data is handled and protected at Airborne Aviation.",
    sections: [
      {
        name: "Privacy Content",
        settings: { background: "white", padding: "normal", maxWidth: "narrow" },
        blocks: [
          {
            type: "heading",
            props: { content: "Privacy Policy & Student Data Protection", level: 1 },
          },
          {
            type: "rich_text",
            props: {
              content: "<p>Airborne Aviation respects your privacy. Information submitted through our enquiry forms, WhatsApp integrations, or admission applications is used exclusively for counseling and educational communications.</p><p>We never sell or disclose candidate information to third-party commercial marketing entities.</p>",
            },
          },
        ],
      },
    ],
  },

  // ─── 13. REFUND POLICY ────────────────────────────────────────────────────
  {
    title: "Fee Structure & Refund Policy",
    slug: "refund-policy",
    description: "Fee payment terms, installment schedules, and refund policies for Airborne Aviation ground school batches.",
    sections: [
      {
        name: "Refund Content",
        settings: { background: "white", padding: "normal", maxWidth: "narrow" },
        blocks: [
          {
            type: "heading",
            props: { content: "Tuition Fees & Refund Policy", level: 1 },
          },
          {
            type: "rich_text",
            props: {
              content: "<p>Course fees must be deposited as per the agreed installment schedule prior to batch commencement. In the event of an unavoidable emergency, students may request batch rescheduling to a subsequent cohort with prior written approval from the Chief Flying Instructor.</p>",
            },
          },
        ],
      },
    ],
  },
];
