// ==============================================================================
// Safe Content Utilities for Website Rendering
// ==============================================================================

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.replace(/[\t\n\r]/g, "").replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "");
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) return null;
  if (url.startsWith("#")) return url;
  if (url.startsWith("/")) return url.startsWith("//") || url.startsWith("/\\") ? null : url;
  try {
    const parsed = new URL(url);
    return SAFE_SCHEMES.has(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
}

export function safeMediaSrc(value: unknown): string | null {
  const href = safeHref(value);
  if (!href || href.startsWith("#") || /^(mailto|tel):/i.test(href)) return null;
  return href;
}

export function videoEmbedUrl(src: unknown): string | null {
  try {
    const url = new URL(String(src ?? "").trim());
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2]?.split("?")[0] ?? null;
      else if (url.pathname === "/playlist") {
        const list = url.searchParams.get("list");
        if (list && /^[\w-]{10,50}$/.test(list)) {
          return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}`;
        }
      }
    } else if (host === "youtu.be") {
      id = url.pathname.slice(1).split("?")[0] ?? null;
    }
    if (id && /^[\w-]{6,20}$/.test(id)) {
      return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;
    }
    if (host === "vimeo.com") {
      const v = url.pathname.slice(1).split("/")[0];
      if (v && /^\d{3,15}$/.test(v)) return `https://player.vimeo.com/video/${v}`;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

export type RichNode =
  | { t: "text"; v: string }
  | { t: "el"; tag: string; children: RichNode[]; href?: string; newTab?: boolean };

const ALLOWED = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "code", "pre", "a", "hr", "span", "div"
]);
const RENAME: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4" };
const VOID = new Set(["br", "hr", "img", "input", "meta", "link", "source", "wbr", "area", "base", "col", "embed", "param", "track"]);
const DROP_WITH_CONTENT = new Set(["script", "style", "iframe", "object", "embed", "noscript", "template", "svg", "math", "textarea", "title", "select", "frameset", "frame", "applet", "head"]);
const MAX_DEPTH = 32;
const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0" };

export function decodeEntities(text: unknown): string {
  return String(text ?? "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (m, body) => {
    if (body[0] === "#") {
      const cp = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(cp) || cp <= 0 || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return "\ufffd";
      return String.fromCodePoint(cp);
    }
    return NAMED[body.toLowerCase()] ?? m;
  });
}

function readAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) attrs[m[1]!.toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  return attrs;
}

export function parseRichText(html: unknown): RichNode[] {
  const root: Extract<RichNode, { t: "el" }> = { t: "el", tag: "root", children: [] };
  const stack: Extract<RichNode, { t: "el" }>[] = [root];
  const tokens = /<!--[\s\S]*?(?:-->|$)|<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|</g;
  const src = String(html ?? "");
  let dropping: string | null = null;
  let dropDepth = 0;
  let m: RegExpExecArray | null;
  while ((m = tokens.exec(src))) {
    const [whole, closing, rawName, rawAttrs, text] = m;
    const top = stack[stack.length - 1]!;
    if (whole.startsWith("<!--")) continue;
    if (dropping) {
      if (rawName && rawName.toLowerCase() === dropping) dropDepth += closing ? -1 : whole.endsWith("/>") ? 0 : 1;
      if (dropDepth === 0) dropping = null;
      continue;
    }
    if (text !== undefined || !rawName) {
      top.children.push({ t: "text", v: decodeEntities(text ?? whole) });
      continue;
    }
    const name = rawName.toLowerCase();
    if (DROP_WITH_CONTENT.has(name)) {
      if (!closing && !whole.endsWith("/>") && !VOID.has(name)) {
        dropping = name;
        dropDepth = 1;
      }
      continue;
    }
    if (closing) {
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i]!.tag === (RENAME[name] ?? name)) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (stack.length >= MAX_DEPTH) continue;
    const mapped = RENAME[name] ?? name;
    if (!ALLOWED.has(mapped)) continue;
    const attrs = rawAttrs ? readAttrs(rawAttrs) : {};
    const href = mapped === "a" ? safeHref(attrs.href) : undefined;
    if (mapped === "a" && !href) continue;
    const node: Extract<RichNode, { t: "el" }> = {
      t: "el",
      tag: mapped,
      children: [],
      ...(href ? { href, newTab: attrs.target === "_blank" } : {}),
    };
    top.children.push(node);
    if (!VOID.has(name) && !whole.endsWith("/>")) stack.push(node);
  }
  return root.children;
}
