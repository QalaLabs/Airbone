import {
  Sparkles,
  Layers,
  BookOpen,
  Image,
  Video,
  Type,
  AlignLeft,
  MousePointerClick,
  Minus,
  Rows,
  Columns2,
  Columns3,
  HelpCircle,
  BarChart3,
  Quote,
  Flame,
  Award,
  Compass,
  Building,
  CreditCard,
  MessageCircle,
  Plane,
} from "lucide-react";

export interface ComponentDefinition {
  type: string;
  category: "basic" | "layout" | "marketing" | "airborne";
  title: string;
  description: string;
  icon: any;
  defaultProps: Record<string, unknown>;
  defaultStyle?: Record<string, unknown>;
  schema?: Record<string, unknown>;
}

export const COMPONENT_CATEGORIES = [
  { id: "all", label: "All Blocks" },
  { id: "basic", label: "Basic" },
  { id: "layout", label: "Layout" },
  { id: "marketing", label: "Marketing" },
  { id: "airborne", label: "Airborne Aviation" },
] as const;

export const COMPONENT_REGISTRY: ComponentDefinition[] = [
  // ─── BASIC ────────────────────────────────────────────────────────────────
  {
    type: "heading",
    category: "basic",
    title: "Heading",
    description: "Configurable heading tag (H1 - H4) with alignment and typography styles.",
    icon: Type,
    defaultProps: {
      content: "Inspiring Aviation Excellence",
      level: 2,
      align: "left",
      subtitle: "",
    },
  },
  {
    type: "text",
    category: "basic",
    title: "Paragraph",
    description: "Standard body text block with clean typography and spacing.",
    icon: AlignLeft,
    defaultProps: {
      content: "Airborne Aviation provides premier ground school and flight training mentorship in New Delhi. Led by veteran commanders with over 37+ years of airline flight experience.",
      align: "left",
      size: "base",
    },
  },
  {
    type: "rich_text",
    category: "basic",
    title: "Rich Text",
    description: "Formatted text with bolding, lists, links, and highlighted notes.",
    icon: BookOpen,
    defaultProps: {
      content: "<p>Start your journey to the flight deck today. Our structured DGCA ground school prepares you for navigation, meteorology, and air regulations with proven first-attempt success.</p>",
    },
  },
  {
    type: "image",
    category: "basic",
    title: "Image",
    description: "Responsive image with aspect ratio control, caption, and media library integration.",
    icon: Image,
    defaultProps: {
      src: "/images/hero-cockpit.jpg",
      alt: "Cockpit flight controls",
      caption: "",
      objectFit: "cover",
      aspectRatio: "16/9",
      rounded: "lg",
    },
  },
  {
    type: "video",
    category: "basic",
    title: "Video Player",
    description: "Embedded YouTube/Vimeo or self-hosted MP4 aviation walkthrough video.",
    icon: Video,
    defaultProps: {
      src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Life at Airborne Aviation Academy",
      aspectRatio: "16/9",
    },
  },
  {
    type: "button",
    category: "basic",
    title: "Button / CTA",
    description: "Primary or outline call-to-action button linking to internal routes or lead forms.",
    icon: MousePointerClick,
    defaultProps: {
      label: "Enrol in Next Batch",
      href: "#contact",
      variant: "primary",
      target: "_self",
      size: "md",
    },
  },
  {
    type: "spacer",
    category: "basic",
    title: "Spacer & Divider",
    description: "Vertical spacing buffer or decorative hairline separator.",
    icon: Minus,
    defaultProps: {
      height: 48,
      showLine: true,
      lineColor: "rgba(0,39,76,0.1)",
    },
  },

  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  {
    type: "two_column",
    category: "layout",
    title: "Two Columns",
    description: "Side-by-side 50/50 or 60/40 responsive column grid.",
    icon: Columns2,
    defaultProps: {
      leftHeading: "World-Class Flight Simulators",
      leftBody: "Practice instrument approaches and emergencies in our state-of-the-art simulator facility.",
      rightHeading: "Airline Veteran Faculty",
      rightBody: "Direct mentorship and ground training from retired airline AGMs and line check captains.",
    },
  },
  {
    type: "three_column",
    category: "layout",
    title: "Three Column Cards",
    description: "Tri-column cards grid for pathways, subjects, or facility highlights.",
    icon: Columns3,
    defaultProps: {
      heading: "Three Strategic Phases",
      cards: [
        { title: "Ground School", desc: "Pass all DGCA theory exams with 95%+ success rates." },
        { title: "Simulator Training", desc: "Master cockpit procedures and CRM before solo flying." },
        { title: "Flight Training", desc: "200 hours of multi-engine glass cockpit flight time." },
      ],
    },
  },

  // ─── MARKETING ────────────────────────────────────────────────────────────
  {
    type: "hero",
    category: "marketing",
    title: "Hero Banner",
    description: "Full-width high-impact hero with badge, headline, subtitle, and primary CTA.",
    icon: Sparkles,
    defaultProps: {
      badge: "✈️ BATCH ENROLMENT OPEN",
      heading: "A DIRECT ROUTE TO THE AIRLINE FLIGHT DECK",
      subheading: "Premier cadet pilot and ground school training engineered by veteran airline captains in New Delhi.",
      ctaText: "Apply For Next Batch",
      ctaLink: "#contact",
      secondaryCtaText: "Download Brochure",
      secondaryCtaLink: "/resources",
      backgroundImage: "",
    },
  },
  {
    type: "features",
    category: "marketing",
    title: "Features Grid",
    description: "Grid of icon-accented feature highlights with custom Airborne red borders.",
    icon: Layers,
    defaultProps: {
      title: "Why Future Airline Pilots Choose Airborne",
      subtitle: "Unmatched ground training standards with guaranteed DGCA syllabus coverage.",
      items: [
        { icon: "🧑‍✈️", title: "Airline Veteran Trainers", description: "Direct mentorship from commanders with 37+ years flight experience." },
        { icon: "🛫", title: "Mock Cabin & Cockpit", description: "Hands-on emergency procedures and full flight instrumentation drills." },
        { icon: "💼", title: "Airline Cadet Prep", description: "Comprehensive GD, psychometric, and Compass pilot aptitude prep." },
      ],
    },
  },
  {
    type: "stats",
    category: "marketing",
    title: "Stats Counter",
    description: "Key numerical achievements with bold styling and gold/red accents.",
    icon: BarChart3,
    defaultProps: {
      items: [
        { value: "2,500+", label: "Pilots & Crew Trained" },
        { value: "95%+", label: "First-Attempt Pass Rate" },
        { value: "37+", label: "Years Aviation Experience" },
        { value: "100%", label: "DGCA Aligned Curriculum" },
      ],
    },
  },
  {
    type: "faq",
    category: "marketing",
    title: "FAQ Accordion",
    description: "Collapsible frequently asked questions accordion with expand/collapse logic.",
    icon: HelpCircle,
    defaultProps: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What is the minimum eligibility for the CPL Ground School?",
          answer: "Candidates must have completed 10+2 with Physics and Mathematics (or equivalent NIOS certification) and be at least 17 years of age.",
        },
        {
          question: "How long does DGCA ground training take?",
          answer: "Our intensive batch spans 4 to 6 months covering all 5 core DGCA subjects: Air Navigation, Meteorology, Air Regulations, Technical General, and Technical Specific.",
        },
        {
          question: "Do you offer cadet pilot interview and simulator preparation?",
          answer: "Yes, our dedicated Cadet Preparation program covers Indigo, Air India, and SpiceJet cadet assessment rounds including Compass/ADAPT, psychometrics, and panel interviews.",
        },
      ],
    },
  },
  {
    type: "cta_banner",
    category: "marketing",
    title: "CTA Callout Banner",
    description: "Deep navy gradient box with headline, description, and prominent action button.",
    icon: Flame,
    defaultProps: {
      title: "Ready to Take to the Skies?",
      description: "Schedule a personalized 1-on-1 counseling session with our Chief Ground Instructor.",
      buttonText: "Book Free Counseling Session",
      buttonLink: "/contact",
    },
  },
  {
    type: "lead_magnet",
    category: "marketing",
    title: "Lead Magnet Box",
    description: "Gated starter kit or syllabus download box with email/phone intake integration.",
    icon: BookOpen,
    defaultProps: {
      heading: "Download: 2026 Airline Pilot Starter Kit",
      description: "Get the complete breakdown of DGCA exam syllabus, medical requirements, and cadet selection stages.",
      buttonText: "Download Free Guide (PDF)",
      downloadFile: "/assets/downloads/cabin-crew-starter-kit.pdf",
    },
  },

  // ─── AIRBORNE SPECIALIST BLOCKS ──────────────────────────────────────────
  {
    type: "airline_logos",
    category: "airborne",
    title: "Airline Partner Logos",
    description: "Logo carousel/strip of airlines where Airborne alumni are currently flying.",
    icon: Plane,
    defaultProps: {
      heading: "Our Alumni Fly For Leading Commercial Airlines",
      airlines: [
        { name: "IndiGo", code: "6E" },
        { name: "Air India", code: "AI" },
        { name: "Akasa Air", code: "QP" },
        { name: "SpiceJet", code: "SG" },
        { name: "Air India Express", code: "IX" },
      ],
    },
  },
  {
    type: "cadet_stages",
    category: "airborne",
    title: "Cadet Selection Stages",
    description: "Step-by-step airline cadet recruitment progression roadmap.",
    icon: Compass,
    defaultProps: {
      heading: "Cadet Pilot Selection Roadmap",
      stages: [
        { stage: "Stage 01", name: "Online Aptitude & ADAPT Test", desc: "Physics, Math, Multitasking & Spatial Reasoning" },
        { stage: "Stage 02", name: "Simulator Assessment", desc: "Flight path tracking, joystick sensitivity & spatial orientation" },
        { stage: "Stage 03", name: "Group Discussion & Psychometrics", desc: "Crew Resource Management (CRM) behavior & teamwork evaluation" },
        { stage: "Stage 04", name: "Personal Airline Interview", desc: "Technical aviation viva with senior airline commanders" },
      ],
    },
  },
  {
    type: "mentor_card",
    category: "airborne",
    title: "Pilot Mentorship Spotlight",
    description: "Veteran instructor biography card with flight hours and command credentials.",
    icon: Award,
    defaultProps: {
      name: "Captain R. Sharma",
      role: "Chief Flight Instructor & Retired Airline AGM",
      flightHours: "18,500+ Hours",
      aircraftTypes: "Airbus A320, Boeing 737, Cessna 172",
      bio: "Over 35 years in commercial aviation leading line checks and type rating ground school for major Indian carriers.",
      image: "/images/instructor-placeholder.jpg",
    },
  },
  {
    type: "campus_walkthrough",
    category: "airborne",
    title: "Campus & Sim Walkthrough",
    description: "Gallery showcase of the Dwarka Sector 9 ground academy and sim bays.",
    icon: Building,
    defaultProps: {
      title: "State-of-the-Art Training Academy in New Delhi",
      subtitle: "Located conveniently at Ramphal Chowk, Dwarka — adjacent to Palam and Sector 9 Metro Stations.",
      features: [
        "Modern air-conditioned theory lecture theatres",
        "A320 procedure trainers and multi-engine sim bays",
        "Comprehensive aviation library with Jeppesen charts",
        "Dedicated counseling and computer-based testing lab",
      ],
    },
  },
  {
    type: "pricing_table",
    category: "airborne",
    title: "Course Fee & Batch Table",
    description: "Clear fee structure with installment plans and upcoming batch start dates.",
    icon: CreditCard,
    defaultProps: {
      courseName: "Commercial Pilot License (CPL) Ground School",
      regularFee: "₹1,85,000",
      scholarshipFee: "₹1,45,000",
      batchStarts: "1st & 15th of Every Month",
      duration: "4 - 5 Months Intensive",
      includes: [
        "All 5 DGCA Subjects (Nav, Met, Regs, Tech Gen, Tech Spec)",
        "Daily Mock Tests & 10-Year Question Bank Access",
        "RTR (A) Wireless Telegraphy Ground Prep Included",
        "Free 1-on-1 Doubt Clearing Sessions",
      ],
    },
  },
  {
    type: "whatsapp_cta",
    category: "airborne",
    title: "WhatsApp Quick Enquire",
    description: "Direct WhatsApp chat widget pre-filled with course enquiry details.",
    icon: MessageCircle,
    defaultProps: {
      headline: "Need Immediate Guidance on Pilot Training?",
      subtext: "Chat directly with our senior aviation admissions counselors on WhatsApp.",
      buttonText: "Chat on WhatsApp Now",
      phone: "+919999123456",
      prefilledText: "Hi Airborne Aviation, I am interested in knowing more about the next batch enrolment.",
    },
  },
];

export const STARTER_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with an empty page and assemble sections from scratch.",
    badge: "Clean Slate",
    sections: [
      {
        name: "Hero Section",
        settings: { background: "navy", padding: "spacious" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ BATCH ENROLMENT OPEN",
              heading: "Launch Your Aviation Career",
              subheading: "Premier ground training and airline cadet mentorship in New Delhi.",
              ctaText: "Enquire Now",
              ctaLink: "#contact",
            },
          },
        ],
      },
    ],
  },
  {
    id: "cadet_page",
    name: "Airline Cadet Program Page",
    description: "Comprehensive landing page for airline cadet pilot prep with stages, stats, and airline logos.",
    badge: "Most Popular",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ DIRECT AIRLINE ROUTE",
              heading: "A DIRECT ROUTE TO THE AIRLINE FLIGHT DECK",
              subheading: "Structured pilot cadet preparation for Indigo, Air India, and SpiceJet entrance assessments.",
              ctaText: "Apply For Cadet Assessment",
              ctaLink: "#contact",
            },
          },
        ],
      },
      {
        name: "Stats",
        settings: { background: "white", padding: "compact" },
        blocks: [
          {
            type: "stats",
            props: {
              items: [
                { value: "2,500+", label: "Pilots & Crew Trained" },
                { value: "95%+", label: "Pass Rate" },
                { value: "37+", label: "Years Experience" },
                { value: "100%", label: "DGCA Aligned" },
              ],
            },
          },
        ],
      },
      {
        name: "Airline Logos",
        settings: { background: "light", padding: "compact" },
        blocks: [
          {
            type: "airline_logos",
            props: {
              heading: "Our Cadets Fly With Top Indian Carriers",
              airlines: [
                { name: "IndiGo", code: "6E" },
                { name: "Air India", code: "AI" },
                { name: "Akasa Air", code: "QP" },
                { name: "SpiceJet", code: "SG" },
              ],
            },
          },
        ],
      },
      {
        name: "Selection Stages",
        settings: { background: "white", padding: "normal" },
        blocks: [
          {
            type: "cadet_stages",
            props: {
              heading: "Four-Stage Airline Cadet Selection Pathway",
              stages: [
                { stage: "Stage 01", name: "ADAPT & Compass Aptitude", desc: "Math, physics, hand-eye coordination & psychometrics" },
                { stage: "Stage 02", name: "Simulator Assessment", desc: "Cockpit flying skills, cross-check drills & spatial sense" },
                { stage: "Stage 03", name: "Group Exercises & CRM", desc: "Team decision making and leadership evaluation" },
                { stage: "Stage 04", name: "Captain's Viva & Interview", desc: "Aviation knowledge and personal interview with airline panel" },
              ],
            },
          },
        ],
      },
      {
        name: "FAQ Section",
        settings: { background: "white", padding: "normal" },
        blocks: [
          {
            type: "faq",
            props: {
              title: "Cadet Program FAQs",
              items: [
                { question: "What is the educational qualification needed?", answer: "10+2 with Physics and Mathematics with at least 50% marks." },
                { question: "How does Airborne prepare students for Compass/ADAPT?", answer: "We provide dedicated software simulation identical to airline assessment hardware." },
              ],
            },
          },
        ],
      },
      {
        name: "Call to Action",
        settings: { background: "navy", padding: "normal" },
        blocks: [
          {
            type: "cta_banner",
            props: {
              title: "Begin Your Cadet Pilot Journey Today",
              description: "Limited seats per batch to maintain 1:1 instructor attention. Book your counseling now.",
              buttonText: "Schedule Free Counseling",
              buttonLink: "#contact",
            },
          },
        ],
      },
    ],
  },
  {
    id: "home_page",
    name: "Airborne Aviation Homepage",
    description: "Complete full-length homepage layout with Hero, Boarding strip, Airline marquee, Advantage grid, Mentor spotlight, Campus walkthrough, FAQs, and CTA.",
    badge: "Master Home",
    sections: [
      {
        name: "Hero Section",
        settings: { background: "navy", padding: "spacious", maxWidth: "full" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "✈️ INDIA'S PREMIER GROUND SCHOOL",
              heading: "From Classroom To Cockpit",
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
        name: "Boarding Strip Stats",
        settings: { background: "white", padding: "compact" },
        blocks: [
          {
            type: "stats",
            props: {
              items: [
                { value: "Since 2009", label: "DGCA-Compliant ground school" },
                { value: "5/5", label: "DGCA papers cleared in 3 months" },
                { value: "2,500+", label: "Students Mentored" },
                { value: "98%", label: "First-Attempt DGCA Pass Rate" },
              ],
            },
          },
        ],
      },
      {
        name: "Airline Partner Marquee",
        settings: { background: "light", padding: "compact" },
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
        settings: { background: "white", padding: "normal" },
        blocks: [
          {
            type: "features",
            props: {
              title: "The Airborne Advantage",
              subtitle: "Why India's future airline commanders choose Airborne Aviation",
              items: [
                { icon: "🧑‍✈️", title: "Founder-Led Instruction", description: "All 5 DGCA papers taught directly by Capt. Navrang - no junior staff on core subjects." },
                { icon: "🛫", title: "A320 Procedure Trainer", description: "Cockpit familiarisation before flight school so you walk in confident." },
                { icon: "🎯", title: "1-on-1 Mentorship", description: "Individual doubt-solving sessions with Capt. Navrang until the concept is clear." },
                { icon: "👨‍👩‍👧", title: "Parent Counseling", description: "Clear roadmap on flight training costs, medicals, and airline hiring timelines." },
              ],
            },
          },
        ],
      },
      {
        name: "Founder & Mentor Spotlight",
        settings: { background: "navy", padding: "normal" },
        blocks: [
          {
            type: "mentor_card",
            props: {
              heading: "Meet Chief Ground Instructor",
              subheading: "Capt. Navrang Singh",
              instructorName: "Capt. Navrang Singh",
              role: "Chief Flying Instructor & Founder",
              experience: "37+ Years Flight Operations",
              bio: "Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR - taught the way you'll actually use them in the cockpit.",
            },
          },
        ],
      },
      {
        name: "Dwarka Campus Walkthrough",
        settings: { background: "white", padding: "normal" },
        blocks: [
          {
            type: "campus_walkthrough",
            props: {
              title: "Modern Ground Training Facility in Dwarka",
              subtitle: "Ramphal Chowk, Sector 9, Dwarka, New Delhi · Less than 1 km from Palam and Sector 9 Metro Stations.",
              features: [
                "Air-conditioned smart lecture rooms",
                "Airbus A320 procedural trainer",
                "Comprehensive DGCA exam question bank",
                "Free 90-minute demo class with Capt. Navrang",
              ],
            },
          },
        ],
      },
      {
        name: "Frequently Asked Questions",
        settings: { background: "light", padding: "normal" },
        blocks: [
          {
            type: "faq",
            props: {
              title: "Frequently Asked Questions",
              items: [
                {
                  question: "What are the eligibility requirements for CPL Ground School?",
                  answer: "Candidates must have cleared 10+2 with Physics and Mathematics (or equivalent NIOS certification) and be at least 17 years old to begin ground training.",
                },
                {
                  question: "Is Airborne Aviation an FTO or a Ground School?",
                  answer: "Airborne is a specialist DGCA ground school and airline cadet preparation academy. We guide flight training placements with top partner flying clubs in India and abroad.",
                },
                {
                  question: "Which medical certificate is required before enrolling?",
                  answer: "You can start ground school with a DGCA Class 2 Medical certificate. Class 1 Medical is required prior to starting flight training.",
                },
              ],
            },
          },
        ],
      },
      {
        name: "Visit Academy CTA",
        settings: { background: "navy", padding: "normal" },
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
  {
    id: "lead_magnet_page",
    name: "Lead Generation & Starter Kit",
    description: "High-converting funnel page with gated PDF download and WhatsApp quick enquiry.",
    badge: "Lead Funnel",
    sections: [
      {
        name: "Hero",
        settings: { background: "navy", padding: "spacious" },
        blocks: [
          {
            type: "hero",
            props: {
              badge: "FREE DOWNLOAD",
              heading: "THE ULTIMATE PILOT TRAINING BLUEPRINT 2026",
              subheading: "Everything you need to know about DGCA exams, medicals, flying hours, and costs.",
              ctaText: "Download Starter Kit",
              ctaLink: "#download",
            },
          },
        ],
      },
      {
        name: "Download Box",
        settings: { background: "white", padding: "normal" },
        blocks: [
          {
            type: "lead_magnet",
            props: {
              heading: "Download: 2026 Airline Pilot Starter Kit",
              description: "Complete guide on DGCA ground training, flight schools in India vs abroad, and airline cadet selections.",
              buttonText: "Download Free PDF Blueprint",
              downloadFile: "/assets/downloads/cabin-crew-starter-kit.pdf",
            },
          },
        ],
      },
      {
        name: "WhatsApp Quick CTA",
        settings: { background: "light", padding: "normal" },
        blocks: [
          {
            type: "whatsapp_cta",
            props: {
              headline: "Have questions about pilot eligibility?",
              subtext: "Connect directly with our Chief Aviation Counselor on WhatsApp.",
              buttonText: "Chat on WhatsApp Now",
              phone: "+919999123456",
            },
          },
        ],
      },
    ],
  },
];
