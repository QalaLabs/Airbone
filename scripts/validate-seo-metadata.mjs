#!/usr/bin/env node
/**
 * FE-22 — repeatable SEO metadata length gate.
 *
 * Scans every App Router page for its `metadata` export / `generateMetadata`
 * return object and fails when a title exceeds 60 characters or a description
 * exceeds 160 characters. Static fallbacks inside `x ?? 'fallback'` expressions
 * are measured too, because that is what crawlers receive when the admin API is
 * unavailable.
 *
 * Run: npm run validate:seo
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "src", "app");
const LIMITS = { title: 60, description: 160 };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : entry.name === "page.jsx" ? [p] : [];
  });
}

function matchBrace(source, openIndex) {
  let depth = 0;
  let quote = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex, i + 1);
    }
  }
  return source.slice(openIndex);
}

function metadataBlocks(source) {
  const blocks = [];
  const constMatch = source.match(/export\s+const\s+metadata\s*=\s*\{/);
  if (constMatch) blocks.push(matchBrace(source, constMatch.index + constMatch[0].length - 1));

  const fnMatch = source.match(/export\s+async\s+function\s+generateMetadata\s*\([^)]*\)\s*\{/);
  if (fnMatch) {
    const body = matchBrace(source, fnMatch.index + fnMatch[0].length - 1);
    const returnMatch = body.match(/return\s*\{/);
    if (returnMatch) blocks.push(matchBrace(body, returnMatch.index + returnMatch[0].length - 1));
  }
  return blocks;
}

function stringLiterals(expression) {
  const out = [];
  const re = /(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let m;
  while ((m = re.exec(expression))) out.push(m[2]);
  return out;
}

const violations = [];
for (const file of walk(APP_DIR)) {
  const source = fs.readFileSync(file, "utf8");
  for (const block of metadataBlocks(source)) {
    for (const key of Object.keys(LIMITS)) {
      const re = new RegExp(`(?:^|\\n)\\s*${key}:\\s*([^\\n]+)`, "g");
      let match;
      while ((match = re.exec(block))) {
        for (const literal of stringLiterals(match[1])) {
          if (literal.startsWith("http")) continue;
          if (literal.length > LIMITS[key]) {
            violations.push({
              file: path.relative(ROOT, file),
              key,
              length: literal.length,
              text: literal,
            });
          }
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`SEO metadata gate failed (${violations.length} overlong value(s)):`);
  for (const v of violations) {
    console.error(`  ${v.file} [${v.key}] ${v.length}/${LIMITS[v.key]} — ${v.text}`);
  }
  process.exit(1);
}

console.log("SEO metadata gate passed: all titles <= 60 and descriptions <= 160 characters.");
