# Airborne Studio — Visual Website Builder (Standalone Extraction)

A production-grade, full-featured visual drag-and-drop website builder engineered with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, and **Prisma ORM**.

This package contains the complete, self-contained extraction of Airborne Studio, ready to be added into:
1. **Another Admin Panel**: To design, configure, manage, and publish pages visually with live responsive device previews, multi-tab property inspection, undo/redo state history, template pickers, and version history/rollback.
2. **Another Public/Consumer Website**: To render published pages server-side or client-side with full SEO metadata, OpenGraph tags, and responsive component styling.

---

## 📑 Table of Contents
1. [Core Features](#-core-features)
2. [Package Architecture & Directory Map](#-package-architecture--directory-map)
3. [Prerequisites & Dependencies](#-prerequisites--dependencies)
4. [Database Setup (Prisma)](#-database-setup-prisma)
5. [Admin Panel Integration Guide](#-admin-panel-integration-guide)
6. [Consumer Website Integration Guide](#-consumer-website-integration-guide)
7. [Component Registry: 16+ Included Blocks](#-component-registry-16-included-blocks)
8. [Adding Custom Blocks & Templates](#-adding-custom-blocks--templates)
9. [Verification & Test Suite](#-verification--test-suite)

---

## 🚀 Core Features

- **WYSIWYG Visual Canvas**: Drag-and-drop & click-to-edit canvas with live hover actions, inline section insertion, block moving up/down, duplicating, and deletion.
- **Embedded Pages Navigator**: Built-in `[ Pages | Widgets | Layers | Content ]` sidebar navigation allowing editors to browse, search, filter, and switch between all website pages in 1 click without leaving the studio.
- **Searchable Page Dropdown Switcher**: Top toolbar fast switcher with real-time fuzzy search across all registered and canonical website pages.
- **Canonical Pages Auto-Hydration**: Out-of-the-box catalog of 13+ pre-populated, fully editable website pages (Home, Cadet Program, CPL, Cabin Crew, Ground School, Simulator, Aptitude, Flight Training, About, Contact, Terms, Privacy, Refund Policy).
- **Multi-Device Responsive Frame Switcher**: One-click preview toggle between **Desktop (100%)**, **Tablet (768px frame)**, and **Mobile (375px phone frame)**.
- **Undo / Redo History State Machine**: Deep-cloned immutable history stack (up to 40 steps) with keyboard shortcuts (`Cmd+Z`, `Cmd+Shift+Z` / `Ctrl+Y`).
- **4-Tab Inspector (Right Panel)**:
  - **Content Tab**: Form fields tailored to each block type (text, links, numbers, arrays, items).
  - **Style Tab**: Padding, margins, typography sizes, colors, border-radii, backgrounds.
  - **Responsive Tab**: Granular device visibility triggers (`hideOnMobile`, `hideOnTablet`, `hideOnDesktop`).
  - **Advanced Tab**: Custom class names, element IDs / anchor tags, and raw interactive JSON props editor.
- **Starter Template Selector**: Blank Canvas, Cadet Program Landing Page, and High-Conversion Lead Magnet Funnel.
- **Media Asset Picker**: Built-in modal supporting media library browsing, direct file upload, or external CDN/Unsplash URL inputs.
- **Security & XSS Protection**: Allow-listed HTML element parser and URL scheme validator (`safe-content.ts`), automatically stripping script injections and malicious links.
- **Version History & Rollback**: Every publish creates an immutable JSON snapshot. Roll back to any prior version in 1 click.
- **SEO & Social Metadata Engine**: Edit page title, URL slug, meta description, keywords array, and OpenGraph share image.

---

## 📂 Package Architecture & Directory Map

```text
extracted-airborne-studio/
├── README.md                                    # This integration handbook
├── package.json                                 # Reference dependencies
├── prisma/
│   └── schema.prisma                            # Complete DB models (Page, Section, Block, Version)
├── admin/                                       # ─── ADMIN PANEL CODE ───
│   ├── app/
│   │   ├── (dashboard)/cms/builder/
│   │   │   ├── page.tsx                         # Visual Builder Hub (List, Filter, Create Dialog)
│   │   │   └── [id]/page.tsx                    # Visual Studio Editor Page Route
│   │   └── api/
│   │       ├── v1/pages/
│   │       │   ├── route.ts                     # GET list & POST new page
│   │       │   └── [id]/
│   │       │       ├── route.ts                 # GET page details & PATCH metadata/draft
│   │       │       ├── layout/route.ts          # PUT reorder sections and blocks
│   │       │       ├── publish/route.ts         # POST publish live & record immutable snapshot
│   │       │       └── versions/
│   │       │           ├── route.ts             # GET version history
│   │       │           └── [vid]/rollback/route.ts # POST rollback to past version
│   │       └── public/pages/route.ts            # GET public published pages (consumed by website)
│   ├── components/
│   │   ├── builder/
│   │   │   ├── airborne-studio.tsx              # Main Visual Studio Workspace
│   │   │   ├── visual-canvas.tsx                # WYSIWYG Canvas with Device Viewports
│   │   │   ├── right-inspector.tsx              # 4-Tab Inspector (Content, Style, Responsive, JSON)
│   │   │   ├── content-mode.tsx                 # Structured Content Outline Editor
│   │   │   ├── component-registry.ts            # 16+ Component Definitions, Categories, Starter Templates
│   │   │   ├── media-picker-modal.tsx           # Media Library & Upload Modal
│   │   │   └── airborne-studio.test.ts          # 11 Lifecycle Scenario Tests
│   │   ├── shared/page-header.tsx               # Header title & action bar
│   │   └── ui/                                  # Button, Dialog, Dropdown, Input, Tabs, Switch, Toast
│   ├── lib/
│   │   ├── api.ts                               # Unified apiFetch client
│   │   ├── utils.ts                             # cn() utility helper
│   │   ├── cms/safe-content.ts                  # Safe HTML & Rich Text parser
│   │   ├── cms/canonical-pages.ts               # Pre-configured 13+ Website Pages Catalog
│   │   ├── middleware/context.ts                # RequestContext & Session resolver
│   │   ├── middleware/permissions.ts            # RBAC guard helper
│   │   ├── services/page.service.ts             # Full business logic & lifecycle hooks
│   │   ├── repositories/page.repository.ts      # Prisma query layer & transactional snapshot sync
│   │   ├── validations/page.schema.ts           # Zod schemas
│   │   └── utils/response.ts & errors.ts        # Typed API responses & error classes
│   └── types/cms.ts & index.ts                  # TypeScript models
└── website/                                     # ─── CONSUMER WEBSITE CODE ───
    ├── app/pages/[slug]/page.tsx                # Dynamic SSR/ISR Page with SEO Metadata
    ├── components/
    │   ├── ModularSectionRenderer.tsx           # Responsive Renderer for all 16+ Blocks
    │   └── CmsPageContent.tsx                   # Relational & Legacy Content Bridge
    ├── lib/safeContent.ts                       # Public site sanitization & embed helpers
    └── styles/builder-blocks.css                # CSS variables and typography styles
```

---

## 📦 Prerequisites & Dependencies

In your target project, ensure the following npm dependencies are installed:

```bash
npm install lucide-react @tanstack/react-query zod clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-slot
npm install @prisma/client
npm install -D prisma
```

---

## 🗄️ Database Setup (Prisma)

1. Open your project's `prisma/schema.prisma`.
2. Append the models from `extracted-airborne-studio/prisma/schema.prisma`:
   - `ContentStatus` (Enum: `DRAFT`, `PUBLISHED`, `SCHEDULED`, `ARCHIVED`)
   - `Page` (Page metadata, slug, SEO tags, draft JSON)
   - `PageSection` (Sections belonging to a page, order, background settings)
   - `PageBlock` (Blocks within sections, order, props JSON)
   - `PageVersion` (Immutable audit snapshots created on publish)
   - `ContentBlock` (Registry types)
3. Push changes to your database:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev --name add_visual_builder_models
   ```
4. Regenerate Prisma Client:
   ```bash
   npx prisma generate
   ```

---

## 🛠️ Admin Panel Integration Guide

### Step 1: Copy Builder Components
Copy the builder directory into your admin app:
```bash
cp -r extracted-airborne-studio/admin/components/builder src/components/
```

### Step 2: Copy Library & Validation Code
Copy the supporting libraries:
```bash
cp -r extracted-airborne-studio/admin/lib/cms src/lib/
cp -r extracted-airborne-studio/admin/lib/services/page.service.ts src/lib/services/
cp -r extracted-airborne-studio/admin/lib/repositories/page.repository.ts src/lib/repositories/
cp -r extracted-airborne-studio/admin/lib/validations/page.schema.ts src/lib/validations/
cp -r extracted-airborne-studio/admin/types/cms.ts src/types/
```

### Step 3: Mount the Next.js App Router Pages
Copy the pages into your dashboard:
```bash
cp -r extracted-airborne-studio/admin/app/(dashboard)/cms/builder src/app/(dashboard)/cms/
```
This sets up:
- `/cms/builder` — The Page Management Hub (list existing pages, filter by status, search, and click "New Page" to launch starter templates).
- `/cms/builder/[id]` — The live visual editor for page `[id]`.

### Step 4: Mount the API Routes
Copy the API routes:
```bash
cp -r extracted-airborne-studio/admin/app/api/v1/pages src/app/api/v1/
cp -r extracted-airborne-studio/admin/app/api/public/pages src/app/api/public/
```

### Step 5: Configure Auth Context (Optional)
In `src/lib/middleware/context.ts`, replace the default session resolver with your existing authentication provider (NextAuth, Supabase, Clerk, etc.):
```typescript
import { auth } from "@/auth"; // or your auth provider
import { setSessionResolver } from "@/lib/middleware/context";

setSessionResolver(async () => {
  const session = await auth();
  return {
    id: session?.user?.id ?? "usr-admin",
    orgId: session?.user?.orgId ?? "default-org",
    name: session?.user?.name ?? "Admin User",
    email: session?.user?.email ?? "admin@example.com",
    role: session?.user?.role ?? "ADMIN",
  };
});
```

---

## 🌐 Consumer Website Integration Guide

To render the visual pages created by Airborne Studio on another public website:

### Step 1: Copy Website Renderer
Copy the renderer and utilities:
```bash
cp extracted-airborne-studio/website/components/ModularSectionRenderer.tsx <website-app>/src/components/
cp extracted-airborne-studio/website/lib/safeContent.ts <website-app>/src/lib/
```

### Step 2: Create Dynamic Route
Create `<website-app>/src/app/pages/[slug]/page.tsx` using the code from `extracted-airborne-studio/website/app/pages/[slug]/page.tsx`.

### Step 3: Configure Environment Variables
In your website's `.env.local`:
```env
# Points to your Admin Panel or Backend API
ADMIN_API_URL=https://admin.yourdomain.com
# Or if on same server:
# ADMIN_API_URL=http://localhost:3000
```

When a user visits `https://yourdomain.com/pages/about-us`, Next.js will:
1. Fetch the published page via `GET /api/public/pages?slug=about-us`.
2. Generate all SEO `<title>`, `<meta name="description">`, and OpenGraph tags.
3. Automatically render all modular blocks with responsive styling.
4. Cache the page via ISR (`revalidate = 60`).

---

## 🧩 Component Registry: 16+ Included Blocks

The builder includes 16 production-ready blocks out of the box:

| Category | Block Type | Description |
|---|---|---|
| **Basic** | `heading` | Configurable H1–H4 typography with alignments and subtitles |
| **Basic** | `text` | Formatted body paragraph with line-height and sizing options |
| **Basic** | `rich_text` | Safe HTML rich text parser (bold, italic, lists, safe links) |
| **Basic** | `image` | Aspect-ratio controlled image with caption & alt text |
| **Basic** | `video` | Embedded YouTube, Vimeo, or self-hosted video player |
| **Basic** | `button` | Primary / Outline Call-To-Action button with target control |
| **Basic** | `spacer` | Vertical spacing buffer with optional divider rule |
| **Layout** | `two_column` | Side-by-side 50/50 or 60/40 responsive column grid |
| **Layout** | `three_column`| Tri-column cards grid for features or steps |
| **Marketing**| `hero` | High-impact hero banner with badge, heading, subtitle & CTAs |
| **Marketing**| `features` | 3-column feature grid with icon badges |
| **Marketing**| `stats` | Numerical milestone achievement counters |
| **Marketing**| `faq` | Interactive expandable/collapsible FAQ accordion |
| **Marketing**| `cta_banner`| Full-width gradient callout banner with CTA button |
| **Marketing**| `lead_magnet`| Gated PDF/starter kit download intake box |
| **Specialist**| `airline_logos`| Client/partner logo carousel or badge row |
| **Specialist**| `cadet_stages` | Multi-stage roadmap / progression pathway |
| **Specialist**| `mentor_card` | Instructor / team bio spotlight card with credentials |
| **Specialist**| `campus_walkthrough`| Facility feature checklist with checkmarks |
| **Specialist**| `pricing_table`| Tiered pricing table with inclusions list & discount tag |
| **Specialist**| `whatsapp_cta` | 1-click WhatsApp chat enquiry box with prefilled text |

---

## 🎨 Adding Custom Blocks & Templates

Adding a new block to Airborne Studio requires just 3 steps:

### 1. Register the Block
In `component-registry.ts`:
```typescript
{
  type: "testimonial_slider",
  category: "marketing",
  title: "Testimonial Card",
  description: "Customer quote with avatar, author name, and company.",
  icon: Quote,
  defaultProps: {
    quote: "This platform transformed our operations completely.",
    author: "Jane Doe",
    role: "VP of Engineering",
  },
}
```

### 2. Add WYSIWYG Preview in Studio
In `visual-canvas.tsx`:
```tsx
case "testimonial_slider":
  return (
    <div className="p-6 bg-slate-50 border rounded-xl">
      <p className="italic">"{props.quote}"</p>
      <div className="font-bold mt-2">{props.author} — {props.role}</div>
    </div>
  );
```

### 3. Add to Website Renderer
In `ModularSectionRenderer.tsx`:
```tsx
case "testimonial_slider":
  return <TestimonialBlock key={key} data={section} />;
```

---

## 🧪 Verification & Test Suite

The test file `admin/components/builder/airborne-studio.test.ts` validates:
- **Registry Invariants**: Verifies 15+ blocks, categories, and starter templates.
- **Undo / Redo Engine**: Verifies deep-cloned immutable history, undoing multiple mutations, and redoing without state corruption.
- **11 Lifecycle Audit Scenarios**:
  1. Open existing page & initialize from draft or relational sections
  2. Edit heading immutably
  3. Replace image URL with safe protocol checks
  4. Add new section at beginning or end
  5. Reorder blocks within a section
  6. Reorder sections
  7. Delete block
  8. Duplicate section with newly generated unique IDs
  9. Duplicate block
  10. Filter XSS injection and malicious protocols (`javascript:`)
  11. Publish synchronization & version rollback

Run the test suite in your target project using Node's native test runner:
```bash
npx tsx src/components/builder/airborne-studio.test.ts
```
