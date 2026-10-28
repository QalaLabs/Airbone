/**
 * Canonical course catalog and normalization for CRM leads and Course Manager.
 * CRM-09: Replaces free-text courseInterest inputs with standardized catalog options
 * and maps 15+ legacy variants into canonical course names.
 */

export const CANONICAL_COURSES = [
  "Commercial Pilot License (CPL)",
  "Cadet Pilot Program Preparation",
  "Cabin Crew & Aviation Hospitality Training",
  "CAS / COMPASS / ADAPT Cadet Assessment",
  "ATPL Ground School",
  "A320 Simulator Training",
  "Airline Interview Preparation",
  "Flying Training (India & Abroad)",
  "Private Pilot License (PPL)",
  "Flight Dispatcher",
  "Multi-Engine Rating",
  "Instrument Rating",
  "Aviation English (ICAO)",
  "General Inquiry",
] as const;

export type CanonicalCourse = (typeof CANONICAL_COURSES)[number];

export function isCanonicalCourse(value: unknown): value is CanonicalCourse {
  return typeof value === "string" && (CANONICAL_COURSES as readonly string[]).includes(value);
}

/**
 * Normalizes any free-text course interest input or legacy database value
 * into its canonical course title.
 */
export function normalizeCourseInterest(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (
    lower === "not sure yet" ||
    lower === "general inquiry" ||
    lower === "general enquiry" ||
    lower === "unknown"
  ) {
    return "General Inquiry";
  }

  // Cabin crew
  if (/\b(cabin|hostess|steward)\b/i.test(trimmed)) {
    return "Cabin Crew & Aviation Hospitality Training";
  }

  // Cadet pilot
  if (/\b(cadet|إعداد الطيارين)\b/i.test(trimmed)) {
    return "Cadet Pilot Program Preparation";
  }

  // CAS / Compass / Adapt
  if (/\b(compass|adapt|cass)\b/i.test(trimmed) || trimmed === "30000") {
    return "CAS / COMPASS / ADAPT Cadet Assessment";
  }

  // Simulator
  if (/\b(simulator|sim)\b/i.test(trimmed)) {
    return "A320 Simulator Training";
  }

  // ATPL
  if (/\batpl\b/i.test(trimmed)) {
    return "ATPL Ground School";
  }

  // Airline Prep / Interview / GD PI / Type rating
  if (/\b(airline\s*prep|interview|gd\s*&\s*pi|type\s*rating)\b/i.test(trimmed)) {
    return "Airline Interview Preparation";
  }

  // PPL
  if (/\b(ppl|private\s*pilot)\b/i.test(trimmed)) {
    return "Private Pilot License (PPL)";
  }

  // Flying training
  if (/\b(flying\s*training|abroad)\b/i.test(trimmed)) {
    return "Flying Training (India & Abroad)";
  }

  // Flight dispatcher
  if (/\b(dispatcher)\b/i.test(trimmed)) {
    return "Flight Dispatcher";
  }

  // Multi-engine / Instrument rating / ICAO English
  if (/\bmulti[- ]engine\b/i.test(trimmed)) {
    return "Multi-Engine Rating";
  }
  if (/\binstrument\s*rating\b/i.test(trimmed)) {
    return "Instrument Rating";
  }
  if (/\b(icao|aviation\s*english)\b/i.test(trimmed)) {
    return "Aviation English (ICAO)";
  }

  // CPL / Commercial pilot / Ground school / Pilot course / 270000 / Tech General
  if (
    /\b(cpl|commercial\s*pilot|ground\s*school|ground\s*classes|pilot\s*course|pilot\s*training|nav\s*class|tech\s*gen\w*)\b/i.test(
      trimmed,
    ) ||
    trimmed === "270000"
  ) {
    return "Commercial Pilot License (CPL)";
  }

  // If already matches canonical case-insensitively, return canonical casing
  const match = CANONICAL_COURSES.find((c) => c.toLowerCase() === lower);
  if (match) return match;

  return trimmed;
}
