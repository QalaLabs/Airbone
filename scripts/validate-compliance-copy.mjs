#!/usr/bin/env node
/**
 * FE-01 / FE-11 — compliance copy gate.
 *
 * Fails the build when marketing copy reintroduces:
 *   1. Non-hyphenated or unsubstantiated DGCA claims:
 *        "DGCA Complied", "DGCA approved", "DGCA certified", "DGCA recognised",
 *        "DGCA Ground Standards Complied", standalone "Complied".
 *      The compliant phrasing is "DGCA-compliant" (hyphenated).
 *      Only DGCA-scoped wording is gated: legitimate uses of "approved",
 *      "certified" or "recognised" elsewhere (a trainer credential, an approved
 *      JAR syllabus, refund policy wording) are not compliance claims and must
 *      not be rewritten into false statements.
 *   2. Legacy experience claims ("15+ years", "fifteen years", "over 15 years",
 *      "15+ Years Experience", "Years of Legacy"). The approved phrasing is
 *      "since 2009" (the academy was established in 2009).
 *
 * Webinar pages are excluded from this repository-wide pass by project policy;
 * they are counted and reported as skipped, never modified.
 *
 * Run: npm run validate:compliance
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".mdx"]);

const RULES = [
  {
    id: "dgca-complied",
    label: 'non-hyphenated "DGCA Complied"',
    re: /\bDGCA[\s-]*complied\b/gi,
  },
  {
    id: "dgca-claim",
    label: "unsubstantiated DGCA approval/certification",
    re: /\bDGCA[\s-]*(?:approved|approval|certified|certification|recognised|recognized|accredited)\b/gi,
  },
  {
    id: "dgca-ground-standards",
    label: '"DGCA Ground Standards" claim',
    re: /\bDGCA\s+Ground\s+Standards\b/gi,
  },
  {
    id: "standalone-complied",
    label: 'standalone "Complied"',
    re: /\bcomplied\b/gi,
  },
  {
    id: "legacy-years",
    label: "legacy 15+ years experience claim",
    re: /\b15\+[\s\S]{0,80}?(?:years?|yrs?)\b/gi,
  },
  {
    id: "fifteen-years",
    label: '"fifteen years" experience claim',
    re: /\bfifteen\s+years\b/gi,
  },
  {
    id: "over-15-years",
    label: '"over 15 years" experience claim',
    re: /\bover\s+15\s+years\b/gi,
  },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "dist", "coverage"].includes(entry.name)) return [];
      return walk(full);
    }
    return EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
  });
}

const violations = [];
let scanned = 0;
const skippedWebinar = [];

for (const file of walk(SRC_DIR)) {
  const relative = path.relative(ROOT, file);
  if (/webinar/i.test(relative)) {
    skippedWebinar.push(relative);
    continue;
  }
  scanned += 1;
  const source = fs.readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  for (const rule of RULES) {
    lines.forEach((line, index) => {
      rule.re.lastIndex = 0;
      const match = rule.re.exec(line);
      if (!match) return;
      violations.push({
        file: relative,
        line: index + 1,
        rule: rule.label,
        text: line.trim().slice(0, 160),
      });
    });
  }
}

if (skippedWebinar.length > 0) {
  console.log(`Compliance gate: skipped ${skippedWebinar.length} webinar file(s) by policy.`);
}

if (violations.length > 0) {
  console.error(`Compliance copy gate failed (${violations.length} violation(s)):`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.text}`);
  }
  console.error('Use "DGCA-compliant" and "since 2009" instead.');
  process.exit(1);
}

console.log(
  `Compliance copy gate passed: ${scanned} file(s) contain no banned DGCA or legacy experience claims.`,
);
