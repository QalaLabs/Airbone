/**
 * Airborne Aviation — Home Content Adapter
 * Bridges CMS page drafts/published records with the homepage component.
 */

export const DEFAULT_HOME_CONTENT = {
  hero: {
    eyebrow: "Airborne Aviation · Dwarka, Delhi · Est. 2009",
    headlineLine1: "From Classroom",
    headlineLine2: "To Cockpit",
    headlineAccent: "Cockpit",
    tagline: "Ab India Bharega Udaan",
    support: "Founder-led DGCA-compliant ground school since 2009 for CPL & ATPL. Mentor-led training under Capt. Navrang Singh - clearing exams, building careers, restarting dreams.",
    primaryCta: "Enrol Now",
    secondaryCta: "Explore Courses",
  },
  stats: [
    { value: 2009, prefix: "Since ", label: "DGCA-Compliant ground school" },
    { value: 5, suffix: "/5", label: "DGCA papers cleared in 3 months" },
    { value: 2500, suffix: "+", label: "Students sent to the cockpit" },
    { value: 100, suffix: "%", label: "Mentor-led batches" },
  ],
  mentor: {
    heading: "Meet Chief Ground Instructor",
    name: "Capt. Navrang Singh",
    role: "Chief Flying Instructor & Founder",
    experience: "37+ Years Flight Operations",
    bio: "Capt. Navrang Singh strips DGCA syllabi down to first principles. Air Regulations, Technical General, Navigation, Meteorology, RTR - taught the way you'll actually use them in the cockpit.",
  },
  cta: {
    heading: "Visit our Dwarka center, sit in on a class, meet Capt. Navrang. No pressure.",
    subheading: "Capt. Navrang Singh's team · Dwarka, New Delhi",
    demoClassNotice: "A 90-minute introduction with Capt. Navrang Singh. Free, no commitment.",
  },
};

/**
 * Extracts homepage fields from CMS page sections or returns default content.
 */
export function resolveHomeContent(cmsPage) {
  if (!cmsPage || !Array.isArray(cmsPage.sections) || cmsPage.sections.length === 0) {
    return DEFAULT_HOME_CONTENT;
  }

  const sections = cmsPage.sections;
  const heroSec = sections.find((s) => s.blocks?.some((b) => b.type === "hero" || b.blockType?.type === "hero") || s.name?.toLowerCase().includes("hero") || s._template === "hero");
  const heroBlock = heroSec?.blocks?.find((b) => b.type === "hero" || b.blockType?.type === "hero") || heroSec;
  const heroProps = heroBlock?.props || heroBlock || {};

  const statsSec = sections.find((s) => s.blocks?.some((b) => b.type === "stats" || b.blockType?.type === "stats") || s.name?.toLowerCase().includes("stat") || s._template === "stats");
  const statsBlock = statsSec?.blocks?.find((b) => b.type === "stats" || b.blockType?.type === "stats") || statsSec;
  const statsProps = statsBlock?.props || statsBlock || {};

  const mentorSec = sections.find((s) => s.blocks?.some((b) => b.type === "mentor_card" || b.blockType?.type === "mentor_card") || s.name?.toLowerCase().includes("mentor") || s._template === "mentor_card");
  const mentorBlock = mentorSec?.blocks?.find((b) => b.type === "mentor_card" || b.blockType?.type === "mentor_card") || mentorSec;
  const mentorProps = mentorBlock?.props || mentorBlock || {};

  const ctaSec = sections.find((s) => s.blocks?.some((b) => b.type === "cta_banner" || b.blockType?.type === "cta_banner") || s.name?.toLowerCase().includes("cta") || s._template === "cta_banner");
  const ctaBlock = ctaSec?.blocks?.find((b) => b.type === "cta_banner" || b.blockType?.type === "cta_banner") || ctaSec;
  const ctaProps = ctaBlock?.props || ctaBlock || {};

  return {
    hero: {
      eyebrow: heroProps.eyebrow || DEFAULT_HOME_CONTENT.hero.eyebrow,
      headlineLine1: heroProps.headlineLine1 || DEFAULT_HOME_CONTENT.hero.headlineLine1,
      headlineLine2: heroProps.headlineLine2 || DEFAULT_HOME_CONTENT.hero.headlineLine2,
      headlineAccent: heroProps.headlineAccent || DEFAULT_HOME_CONTENT.hero.headlineAccent,
      tagline: heroProps.tagline || DEFAULT_HOME_CONTENT.hero.tagline,
      support: heroProps.subheading || heroProps.support || DEFAULT_HOME_CONTENT.hero.support,
      primaryCta: heroProps.ctaText || DEFAULT_HOME_CONTENT.hero.primaryCta,
      secondaryCta: heroProps.secondaryCtaText || DEFAULT_HOME_CONTENT.hero.secondaryCta,
    },
    stats: Array.isArray(statsProps.items) && statsProps.items.length > 0
      ? statsProps.items.map((it, idx) => ({
          value: it.value ? parseInt(String(it.value).replace(/[^0-9]/g, ""), 10) || it.value : DEFAULT_HOME_CONTENT.stats[idx]?.value || 0,
          prefix: it.label?.includes("Since") ? "Since " : "",
          suffix: String(it.value).includes("+") ? "+" : String(it.value).includes("%") ? "%" : "",
          label: it.label || DEFAULT_HOME_CONTENT.stats[idx]?.label || "",
        }))
      : DEFAULT_HOME_CONTENT.stats,
    mentor: {
      heading: mentorProps.heading || DEFAULT_HOME_CONTENT.mentor.heading,
      name: mentorProps.instructorName || mentorProps.name || DEFAULT_HOME_CONTENT.mentor.name,
      role: mentorProps.role || DEFAULT_HOME_CONTENT.mentor.role,
      experience: mentorProps.experience || DEFAULT_HOME_CONTENT.mentor.experience,
      bio: mentorProps.bio || DEFAULT_HOME_CONTENT.mentor.bio,
    },
    cta: {
      heading: ctaProps.title || DEFAULT_HOME_CONTENT.cta.heading,
      subheading: ctaProps.description || DEFAULT_HOME_CONTENT.cta.subheading,
      demoClassNotice: DEFAULT_HOME_CONTENT.cta.demoClassNotice,
    },
  };
}
