"use client";

import * as React from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit3,
  Lock,
  Layers,
  Sparkles,
  HelpCircle,
  Type,
  AlignLeft,
  MousePointerClick,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PageModel } from "@/types";

export interface ContentModeProps {
  page: PageModel;
  onUpdateBlockProps: (sectionId: string, blockId: string, patch: Record<string, any>) => void;
  onUpdateSection: (sectionId: string, patch: Record<string, any>) => void;
  onUpdatePageMeta: (patch: Record<string, any>) => void;
  onLocateSection?: (sectionId: string) => void;
  onSelectBlock?: (sectionId: string, blockId: string) => void;
}

interface DiscoveredField {
  id: string;
  sectionId: string;
  sectionName: string;
  blockId: string;
  blockType: string;
  fieldKey: string;
  label: string;
  category: "heading" | "body" | "cta" | "list" | "meta";
  value: any;
  isEditable: boolean;
  readOnlyReason?: string;
  inputType: "text" | "textarea" | "rich_text" | "list_item";
  parentListKey?: string;
  itemIndex?: number;
}

export function ContentMode({
  page,
  onUpdateBlockProps,
  onUpdateSection,
  onUpdatePageMeta,
  onLocateSection,
  onSelectBlock,
}: ContentModeProps) {
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = React.useState(true);

  // Initialize expanded state for all sections on first mount
  React.useEffect(() => {
    if (page.sections && Object.keys(expandedSections).length === 0) {
      const initial: Record<string, boolean> = { meta: true };
      page.sections.forEach((s: any) => {
        initial[s.id] = true;
      });
      setExpandedSections(initial);
    }
  }, [page.sections]);

  const toggleSection = (secId: string) => {
    setExpandedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  const handleToggleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    const updated: Record<string, boolean> = { meta: next };
    (page.sections || []).forEach((s: any) => {
      updated[s.id] = next;
    });
    setExpandedSections(updated);
  };

  // Discover all textual fields across page metadata and every block of every section
  const discoveredFields = React.useMemo(() => {
    const fields: DiscoveredField[] = [];

    // 1. Page-level Metadata fields
    fields.push({
      id: "meta-title",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "title",
      label: "Page Title",
      category: "heading",
      value: page.title || "",
      isEditable: true,
      inputType: "text",
    });

    fields.push({
      id: "meta-desc",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "description",
      label: "Internal Description",
      category: "body",
      value: page.description || "",
      isEditable: true,
      inputType: "textarea",
    });

    fields.push({
      id: "meta-seo-title",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "seoTitle",
      label: "Google SEO Title",
      category: "heading",
      value: page.seoTitle || "",
      isEditable: true,
      inputType: "text",
    });

    fields.push({
      id: "meta-seo-desc",
      sectionId: "meta",
      sectionName: "Page Settings & SEO",
      blockId: "page-meta",
      blockType: "page_meta",
      fieldKey: "seoDesc",
      label: "Google Meta Description",
      category: "body",
      value: page.seoDesc || "",
      isEditable: true,
      inputType: "textarea",
    });

    // 2. Sections and Blocks
    (page.sections || []).forEach((sec: any, sIdx: number) => {
      const secName = sec.name || `Section ${sIdx + 1}`;

      // Section label itself
      fields.push({
        id: `sec-name-${sec.id}`,
        sectionId: sec.id,
        sectionName: secName,
        blockId: sec.id,
        blockType: "section_header",
        fieldKey: "name",
        label: "Section Identifier Name",
        category: "meta",
        value: sec.name || "",
        isEditable: true,
        inputType: "text",
      });

      (sec.blocks || []).forEach((blk: any, bIdx: number) => {
        const bType = blk.blockType?.type || blk.type || "unknown";
        const props = blk.props || {};

        const addField = (
          fieldKey: string,
          label: string,
          category: DiscoveredField["category"],
          inputType: DiscoveredField["inputType"] = "text",
          isEditable = true,
          readOnlyReason?: string,
        ) => {
          fields.push({
            id: `blk-${blk.id}-${fieldKey}`,
            sectionId: sec.id,
            sectionName: secName,
            blockId: blk.id,
            blockType: bType,
            fieldKey,
            label,
            category,
            value: props[fieldKey] ?? "",
            isEditable,
            readOnlyReason,
            inputType,
          });
        };

        switch (bType) {
          case "hero":
            addField("badge", "Hero Badge / Pill", "heading", "text");
            addField("heading", "Main Headline", "heading", "textarea");
            addField("subheading", "Subheading / Support Copy", "body", "textarea");
            addField("ctaText", "Primary Action Button", "cta", "text");
            addField("ctaLink", "Primary Button Target Link", "cta", "text");
            addField("secondaryCtaText", "Secondary Action Button", "cta", "text");
            addField("secondaryCtaLink", "Secondary Button Target Link", "cta", "text");
            break;

          case "heading":
            addField("content", "Heading Text", "heading", "textarea");
            addField("subtitle", "Subheading / Accent Line", "body", "text");
            break;

          case "text":
            addField("content", "Paragraph Body Text", "body", "textarea");
            break;

          case "rich_text":
            addField("content", "Formatted Rich Text Content", "body", "rich_text");
            break;

          case "button":
            addField("label", "Button Label", "cta", "text");
            addField("href", "Destination URL", "cta", "text");
            break;

          case "cta_banner":
            addField("title", "Callout Banner Headline", "heading", "textarea");
            addField("description", "Callout Banner Body", "body", "textarea");
            addField("buttonText", "Callout Action Button", "cta", "text");
            addField("buttonLink", "Callout Button URL", "cta", "text");
            break;

          case "lead_magnet":
            addField("heading", "Lead Magnet Title", "heading", "text");
            addField("description", "Guide / PDF Description", "body", "textarea");
            addField("buttonText", "Download Button Label", "cta", "text");
            break;

          case "mentor_card":
            addField("heading", "Mentorship Eyebrow / Tagline", "heading", "text");
            addField("subheading", "Mentorship Main Headline", "heading", "textarea");
            addField("instructorName", "Instructor Name", "heading", "text");
            addField("role", "Aviation Role / Designation", "body", "text");
            addField("experience", "Flight Hours / Experience", "body", "text");
            addField("bio", "Instructor Biography & Credentials", "body", "textarea");
            break;

          case "whatsapp_cta":
            addField("headline", "WhatsApp Title", "heading", "text");
            addField("subtext", "WhatsApp Help Text", "body", "text");
            addField("buttonText", "Button Label", "cta", "text");
            addField("prefilledText", "Prefilled Chat Message", "body", "textarea");
            break;

          case "features":
            addField("title", "Features Section Title", "heading", "text");
            addField("subtitle", "Features Subtitle", "body", "text");
            if (Array.isArray(props.items)) {
              props.items.forEach((item: any, iIdx: number) => {
                fields.push({
                  id: `blk-${blk.id}-item-${iIdx}-title`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "title",
                  parentListKey: "items",
                  itemIndex: iIdx,
                  label: `Feature ${iIdx + 1} Title`,
                  category: "list",
                  value: item.title || "",
                  isEditable: true,
                  inputType: "text",
                });
                fields.push({
                  id: `blk-${blk.id}-item-${iIdx}-desc`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "description",
                  parentListKey: "items",
                  itemIndex: iIdx,
                  label: `Feature ${iIdx + 1} Description`,
                  category: "list",
                  value: item.description || "",
                  isEditable: true,
                  inputType: "textarea",
                });
              });
            }
            break;

          case "stats":
            if (Array.isArray(props.items)) {
              props.items.forEach((st: any, sIndex: number) => {
                fields.push({
                  id: `blk-${blk.id}-stat-${sIndex}-val`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "value",
                  parentListKey: "items",
                  itemIndex: sIndex,
                  label: `Stat ${sIndex + 1} Value`,
                  category: "list",
                  value: st.value || "",
                  isEditable: true,
                  inputType: "text",
                });
                fields.push({
                  id: `blk-${blk.id}-stat-${sIndex}-lbl`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "label",
                  parentListKey: "items",
                  itemIndex: sIndex,
                  label: `Stat ${sIndex + 1} Label`,
                  category: "list",
                  value: st.label || "",
                  isEditable: true,
                  inputType: "text",
                });
              });
            }
            break;

          case "faq":
            addField("title", "FAQ Section Title", "heading", "text");
            if (Array.isArray(props.items)) {
              props.items.forEach((faq: any, fIndex: number) => {
                fields.push({
                  id: `blk-${blk.id}-faq-${fIndex}-q`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "question",
                  parentListKey: "items",
                  itemIndex: fIndex,
                  label: `FAQ ${fIndex + 1} Question`,
                  category: "list",
                  value: faq.question || "",
                  isEditable: true,
                  inputType: "textarea",
                });
                fields.push({
                  id: `blk-${blk.id}-faq-${fIndex}-a`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "answer",
                  parentListKey: "items",
                  itemIndex: fIndex,
                  label: `FAQ ${fIndex + 1} Answer`,
                  category: "list",
                  value: faq.answer || "",
                  isEditable: true,
                  inputType: "textarea",
                });
              });
            }
            break;

          case "airline_logos":
            addField("heading", "Airline Strip Title", "heading", "text");
            if (Array.isArray(props.airlines)) {
              props.airlines.forEach((al: any, alIdx: number) => {
                fields.push({
                  id: `blk-${blk.id}-airline-${alIdx}-name`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "name",
                  parentListKey: "airlines",
                  itemIndex: alIdx,
                  label: `Airline ${alIdx + 1} Name`,
                  category: "list",
                  value: al.name || "",
                  isEditable: true,
                  inputType: "text",
                });
              });
            }
            break;

          case "cadet_stages":
            addField("heading", "Pathway Heading", "heading", "text");
            if (Array.isArray(props.stages)) {
              props.stages.forEach((st: any, stIdx: number) => {
                fields.push({
                  id: `blk-${blk.id}-stage-${stIdx}-name`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "name",
                  parentListKey: "stages",
                  itemIndex: stIdx,
                  label: `${st.stage || `Stage ${stIdx + 1}`} Name`,
                  category: "list",
                  value: st.name || "",
                  isEditable: true,
                  inputType: "text",
                });
                fields.push({
                  id: `blk-${blk.id}-stage-${stIdx}-desc`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "desc",
                  parentListKey: "stages",
                  itemIndex: stIdx,
                  label: `${st.stage || `Stage ${stIdx + 1}`} Description`,
                  category: "list",
                  value: st.desc || "",
                  isEditable: true,
                  inputType: "textarea",
                });
              });
            }
            break;

          case "campus_walkthrough":
            addField("title", "Campus Facility Title", "heading", "text");
            addField("subtitle", "Campus Location / Metro Details", "body", "textarea");
            break;

          case "pricing_table":
            addField("courseName", "Program Title", "heading", "text");
            addField("regularFee", "Standard Tuition Fee", "body", "text");
            addField("scholarshipFee", "Scholarship / Discounted Fee", "body", "text");
            addField("batchStarts", "Batch Commencement Schedule", "body", "text");
            addField("duration", "Course Duration", "body", "text");
            break;

          case "two_column":
            addField("leftHeading", "Left Column Heading", "heading", "text");
            addField("leftBody", "Left Column Body", "body", "textarea");
            addField("rightHeading", "Right Column Heading", "heading", "text");
            addField("rightBody", "Right Column Body", "body", "textarea");
            break;

          case "three_column":
            addField("heading", "Three Column Heading", "heading", "text");
            if (Array.isArray(props.cards)) {
              props.cards.forEach((cd: any, cdIdx: number) => {
                fields.push({
                  id: `blk-${blk.id}-card-${cdIdx}-title`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "title",
                  parentListKey: "cards",
                  itemIndex: cdIdx,
                  label: `Card ${cdIdx + 1} Title`,
                  category: "list",
                  value: cd.title || "",
                  isEditable: true,
                  inputType: "text",
                });
                fields.push({
                  id: `blk-${blk.id}-card-${cdIdx}-desc`,
                  sectionId: sec.id,
                  sectionName: secName,
                  blockId: blk.id,
                  blockType: bType,
                  fieldKey: "desc",
                  parentListKey: "cards",
                  itemIndex: cdIdx,
                  label: `Card ${cdIdx + 1} Description`,
                  category: "list",
                  value: cd.desc || "",
                  isEditable: true,
                  inputType: "textarea",
                });
              });
            }
            break;

          case "image":
            addField("alt", "Image Accessibility Alt Text", "meta", "text");
            addField("caption", "Image Caption Text", "body", "text");
            break;

          case "video":
            addField("title", "Video Title", "heading", "text");
            break;

          default:
            // Custom or complex system component
            fields.push({
              id: `blk-${blk.id}-custom`,
              sectionId: sec.id,
              sectionName: secName,
              blockId: blk.id,
              blockType: bType,
              fieldKey: "custom",
              label: `${bType.replace(/_/g, " ").toUpperCase()} Component`,
              category: "body",
              value: JSON.stringify(props),
              isEditable: false,
              readOnlyReason: "Complex or third-party integration block. Preserved automatically across drafts and publishes.",
              inputType: "textarea",
            });
            break;
        }
      });
    });

    return fields;
  }, [page]);

  // Filtered fields based on search & category filter
  const filteredFields = React.useMemo(() => {
    return discoveredFields.filter((f) => {
      const matchCat =
        categoryFilter === "all" ||
        (categoryFilter === "read_only" && !f.isEditable) ||
        (categoryFilter === "editable" && f.isEditable) ||
        f.category === categoryFilter;

      if (!matchCat) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        f.label.toLowerCase().includes(q) ||
        f.sectionName.toLowerCase().includes(q) ||
        f.blockType.toLowerCase().includes(q) ||
        String(f.value || "").toLowerCase().includes(q)
      );
    });
  }, [discoveredFields, search, categoryFilter]);

  // Group filtered fields by sectionId
  const fieldsBySection = React.useMemo(() => {
    const map: Record<string, { sectionId: string; sectionName: string; fields: DiscoveredField[] }> = {};
    for (const f of filteredFields) {
      if (!map[f.sectionId]) {
        map[f.sectionId] = {
          sectionId: f.sectionId,
          sectionName: f.sectionName,
          fields: [],
        };
      }
      map[f.sectionId]!.fields.push(f);
    }
    return map;
  }, [filteredFields]);

  // Handle live edit of a field
  const handleFieldChange = (field: DiscoveredField, newValue: string) => {
    if (!field.isEditable) return;

    // 1. Page Metadata
    if (field.sectionId === "meta") {
      onUpdatePageMeta({ [field.fieldKey]: newValue });
      return;
    }

    // 2. Section Name
    if (field.blockType === "section_header") {
      onUpdateSection(field.sectionId, { name: newValue });
      return;
    }

    // 3. Nested Array List Item (e.g. items[0].title, stages[1].name)
    if (field.parentListKey && field.itemIndex !== undefined) {
      const section = (page.sections || []).find((s: any) => s.id === field.sectionId);
      const block = (section?.blocks || []).find((b: any) => b.id === field.blockId);
      if (block) {
        const rawList = block.props?.[field.parentListKey];
        if (Array.isArray(rawList)) {
          const updatedList = [...rawList];
          if (updatedList[field.itemIndex]) {
            updatedList[field.itemIndex] = {
              ...updatedList[field.itemIndex],
              [field.fieldKey]: newValue,
            };
            onUpdateBlockProps(field.sectionId, field.blockId, { [field.parentListKey]: updatedList });
          }
        }
      }
      return;
    }

    // 4. Standard Block Prop
    onUpdateBlockProps(field.sectionId, field.blockId, { [field.fieldKey]: newValue });
  };

  const totalEditable = discoveredFields.filter((f) => f.isEditable).length;
  const totalReadOnly = discoveredFields.filter((f) => !f.isEditable).length;

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-hidden min-h-0 w-full">
      {/* ─── SEARCH & FILTER TOOLBAR ───────────────────────────────────────── */}
      <div className="p-4 border-b border-white/10 bg-slate-900/90 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all page text, headlines, FAQs, buttons, mentor copy..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/40 border-white/10 text-xs text-white h-9 focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
            {[
              { id: "all", label: "All Content" },
              { id: "heading", label: "Headings" },
              { id: "body", label: "Body Copy" },
              { id: "cta", label: "CTAs & Buttons" },
              { id: "list", label: "Lists & FAQs" },
              { id: "read_only", label: "Read-Only" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleExpandAll}
            className="h-8 text-xs font-bold border-white/10 hover:bg-white/5 text-slate-300"
          >
            {expandAll ? "Collapse All" : "Expand All"}
          </Button>
        </div>
      </div>

      {/* ─── STATS BANNER ─────────────────────────────────────────────────── */}
      <div className="px-6 py-2.5 bg-slate-900/50 border-b border-white/5 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold text-white">
            <FileText className="h-3.5 w-3.5 text-primary" />
            {discoveredFields.length} Text Fields Discovered
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            {totalEditable} Editable
          </span>
          {totalReadOnly > 0 && (
            <>
              <span className="text-white/20">|</span>
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <Lock className="h-3 w-3" />
                {totalReadOnly} Read-Only
              </span>
            </>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Showing {filteredFields.length} matching field{filteredFields.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* ─── SCROLLABLE CONTENT OUTLINE ───────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {filteredFields.length === 0 ? (
          <div className="p-16 text-center space-y-3 border-2 border-dashed border-white/10 rounded-2xl max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="text-sm font-bold text-white">No Matching Content Fields</h4>
            <p className="text-xs text-muted-foreground">
              No page copy matched &ldquo;{search}&rdquo;. Try another search term or reset category filters.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setCategoryFilter("all");
              }}
              className="text-xs border-white/10"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          Object.values(fieldsBySection).map((secGroup) => {
            const isExpanded = expandedSections[secGroup.sectionId] !== false;
            const isMeta = secGroup.sectionId === "meta";

            return (
              <div
                key={secGroup.sectionId}
                className="rounded-xl border border-white/10 bg-slate-900/80 shadow-lg overflow-hidden transition-all"
              >
                {/* Section Group Header */}
                <div
                  onClick={() => toggleSection(secGroup.sectionId)}
                  className="flex items-center justify-between px-4 py-3 bg-slate-900 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      className="p-1 rounded text-muted-foreground hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                      {secGroup.sectionName}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-white/10 bg-white/5 text-muted-foreground"
                    >
                      {secGroup.fields.length} field{secGroup.fields.length === 1 ? "" : "s"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isMeta && onLocateSection && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLocateSection(secGroup.sectionId);
                        }}
                        className="h-7 text-[11px] font-semibold text-primary hover:text-white hover:bg-primary/20"
                        title="Locate and scroll to this section in Visual Canvas"
                      >
                        <Eye className="h-3 w-3 mr-1" /> Locate on Canvas
                      </Button>
                    )}
                  </div>
                </div>

                {/* Section Fields Body */}
                {isExpanded && (
                  <div className="p-4 space-y-4 divide-y divide-white/5">
                    {secGroup.fields.map((field) => (
                      <div
                        key={field.id}
                        className="pt-4 first:pt-0 space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">
                              {field.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase bg-white/5 px-1.5 py-0.5 rounded">
                              {field.blockType.replace(/_/g, " ")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {field.isEditable ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0 h-4 font-bold">
                                Editable
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0 h-4 font-bold flex items-center gap-1">
                                <Lock className="h-2.5 w-2.5" /> Read-Only
                              </Badge>
                            )}
                            {field.blockId && onSelectBlock && (
                              <button
                                type="button"
                                onClick={() => onSelectBlock(field.sectionId, field.blockId)}
                                className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground hover:text-white flex items-center gap-1 transition-opacity"
                                title="Inspect block styling & settings"
                              >
                                <Edit3 className="h-3 w-3" /> Inspect Block
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Input Control */}
                        {field.isEditable ? (
                          field.inputType === "textarea" ? (
                            <Textarea
                              rows={Math.max(2, Math.min(6, String(field.value || "").split("\n").length + 1))}
                              value={String(field.value ?? "")}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                              className="bg-secondary/30 border-white/10 text-xs text-white focus:ring-1 focus:ring-primary leading-relaxed font-normal"
                            />
                          ) : field.inputType === "rich_text" ? (
                            <div className="space-y-1">
                              <Textarea
                                rows={4}
                                value={String(field.value ?? "")}
                                onChange={(e) => handleFieldChange(field, e.target.value)}
                                className="font-mono bg-secondary/30 border-white/10 text-xs text-white focus:ring-1 focus:ring-primary leading-relaxed"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                Supports safe HTML tags (&lt;p&gt;, &lt;b&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;)
                              </p>
                            </div>
                          ) : (
                            <Input
                              value={String(field.value ?? "")}
                              onChange={(e) => handleFieldChange(field, e.target.value)}
                              className="bg-secondary/30 border-white/10 text-xs text-white focus:ring-1 focus:ring-primary"
                            />
                          )
                        ) : (
                          <div className="p-3 bg-secondary/15 border border-white/5 rounded-lg space-y-1">
                            <p className="text-xs text-slate-300 font-mono line-clamp-2">
                              {String(field.value ?? "")}
                            </p>
                            {field.readOnlyReason && (
                              <p className="text-[11px] text-amber-400/90 italic flex items-center gap-1 mt-1">
                                <Lock className="h-3 w-3 shrink-0" />
                                {field.readOnlyReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
