import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModularSectionRenderer } from "../../../components/ModularSectionRenderer";
import { CmsPageContent } from "../../../components/CmsPageContent";
import { safeMediaSrc } from "../../../lib/safeContent";

export const revalidate = 60; // Revalidate cache every 60 seconds (ISR)

const SLUG_RE = /^[a-z0-9-]{1,255}$/;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Loads page data from your backend API or Prisma database
 */
async function loadPage(slug: string) {
  if (!SLUG_RE.test(slug)) return null;

  const adminApiUrl = process.env.ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${adminApiUrl}/api/public/pages?slug=${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: ["pages", `page-${slug}`] },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error(`Failed to load page [${slug}]:`, err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);

  if (!page) {
    return {
      title: "Page Not Found",
      description: "The requested page could not be found.",
    };
  }

  const image = safeMediaSrc(page.ogImage);

  return {
    title: page.seoTitle || page.title,
    description: page.seoDesc || page.description || undefined,
    keywords: Array.isArray(page.seoKeywords) && page.seoKeywords.length ? page.seoKeywords : undefined,
    alternates: {
      canonical: `/pages/${page.slug}`,
    },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDesc || page.description || undefined,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await loadPage(slug);

  if (!page) {
    notFound();
  }

  // Check if page has studio draft sections or relational sections
  const draftSections = (page.metadata as any)?.studioDraft?.sections;
  const hasModularSections = Array.isArray(draftSections) && draftSections.length > 0;
  const sections = hasModularSections ? draftSections : page.sections;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Render Modular Sections or Relational Content */}
        {hasModularSections ? (
          <ModularSectionRenderer sections={sections} />
        ) : (
          <CmsPageContent page={page} />
        )}
      </div>
    </main>
  );
}
