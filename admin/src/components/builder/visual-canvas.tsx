"use client";

import * as React from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Settings,
  EyeOff,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualCanvasProps {
  page: any;
  device: "desktop" | "tablet" | "mobile";
  selection:
    | { type: "block"; sectionId: string; blockId: string }
    | { type: "section"; sectionId: string }
    | { type: "page" }
    | null;
  onSelectBlock: (sectionId: string, blockId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onAddSection: (atIndex?: number) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddBlock: (sectionId: string, blockType: string) => void;
  onMoveBlock: (sectionId: string, blockId: string, direction: "up" | "down") => void;
  onDuplicateBlock: (sectionId: string, blockId: string) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  previewMode?: boolean;
}

const BG_CLASSES: Record<string, string> = {
  white: "bg-white text-slate-900",
  paper: "bg-[#F8F9FA] text-slate-900",
  light: "bg-slate-50 text-slate-900 border-y border-slate-200",
  navy: "bg-[#00274C] text-white",
};

const PADDING_CLASSES: Record<string, string> = {
  compact: "py-8 px-4 sm:px-8",
  normal: "py-14 px-4 sm:px-8",
  spacious: "py-20 px-4 sm:px-12",
};

const CONTAINER_CLASSES: Record<string, string> = {
  narrow: "max-w-3xl mx-auto",
  standard: "max-w-6xl mx-auto",
  full: "w-full",
};

const ALIGN_CLASSES: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function VisualCanvas({
  page,
  device,
  selection,
  onSelectBlock,
  onSelectSection,
  onAddSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onAddBlock,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  previewMode = false,
}: VisualCanvasProps) {
  const sections = (page.sections || []).filter((s: any) => previewMode ? s.isVisible !== false : true);

  // Device frame styles
  const frameWidthClass = {
    desktop: "w-full",
    tablet: "w-[768px] mx-auto shadow-2xl rounded-2xl border-4 border-slate-700/80 my-6 bg-white overflow-hidden",
    mobile: "w-[375px] mx-auto shadow-2xl rounded-3xl border-8 border-slate-800 my-6 bg-white overflow-hidden",
  }[device];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950/90 p-4 md:p-8 flex flex-col items-center min-h-full">
      <div className={`transition-all duration-300 bg-white text-slate-900 shadow-xl ${frameWidthClass}`}>
        {/* Canvas Header / Page Title Banner (optional preview banner) */}
        {!previewMode && (
          <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-slate-800">{page.title || "Untitled Page"}</span>
              <span className="text-slate-400">/pages/{page.slug || ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {device} Mode
              </span>
            </div>
          </div>
        )}

        {/* Empty Canvas State */}
        {sections.length === 0 && (
          <div className="p-16 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Your Canvas is Empty</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Add your first section to start building with Airborne design components.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => onAddSection()}
              className="bg-primary text-white hover:bg-primary/90 text-xs font-bold px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add First Section
            </Button>
          </div>
        )}

        {/* Sections List */}
        {sections.map((section: any, sIdx: number) => {
          const isSectionSelected = selection?.type === "section" && selection.sectionId === section.id;
          const settings = section.settings || {};
          const blocks = section.blocks || [];

          // Section theme background
          const bgKey = String(settings.background || "white");
          const bgClass = BG_CLASSES[bgKey] || "bg-white text-slate-900";

          // Section padding
          const padKey = String(settings.padding || "normal");
          const paddingClass = PADDING_CLASSES[padKey] || "py-14 px-4 sm:px-8";

          // Container max width
          const widthKey = String(settings.maxWidth || "standard");
          const containerClass = CONTAINER_CLASSES[widthKey] || "max-w-6xl mx-auto";

          return (
            <div key={section.id} className="relative group/section">
              {/* Insert Section Zone Before */}
              {!previewMode && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover/section:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onAddSection(sIdx)}
                    className="flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow hover:bg-primary/90 transition-transform hover:scale-105"
                  >
                    <Plus className="h-3 w-3" /> Add Section
                  </button>
                </div>
              )}

              {/* Section Outline Container */}
              <section
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection(section.id);
                }}
                className={`relative transition-all ${bgClass} ${paddingClass} ${
                  !previewMode
                    ? isSectionSelected
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "hover:ring-1 hover:ring-blue-300"
                    : ""
                }`}
              >
                {/* Section Floating Action Bar */}
                {!previewMode && isSectionSelected && (
                  <div className="absolute -top-8 left-4 z-30 flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-t text-[11px] font-bold shadow-md">
                    <span>{section.name || `Section ${sIdx + 1}`}</span>
                    <button
                      type="button"
                      disabled={sIdx === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(section.id, "up");
                      }}
                      className="p-0.5 hover:bg-blue-700 rounded disabled:opacity-40"
                      title="Move section up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={sIdx === sections.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(section.id, "down");
                      }}
                      className="p-0.5 hover:bg-blue-700 rounded disabled:opacity-40"
                      title="Move section down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateSection(section.id);
                      }}
                      className="p-0.5 hover:bg-blue-700 rounded"
                      title="Duplicate section"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(section.id);
                      }}
                      className="p-0.5 hover:bg-rose-600 rounded text-rose-200"
                      title="Delete section"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className={containerClass}>
                  {/* Empty Section Dropzone */}
                  {blocks.length === 0 && !previewMode && (
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-3">
                      <p className="text-xs font-semibold text-slate-500">This section is empty</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["hero", "features", "stats", "faq", "cta_banner"].map((bType) => (
                          <button
                            key={bType}
                            type="button"
                            onClick={() => onAddBlock(section.id, bType)}
                            className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-primary hover:text-primary transition-colors text-slate-700"
                          >
                            + {bType.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blocks List */}
                  <div className="space-y-6">
                    {blocks.map((block: any, bIdx: number) => {
                      const isBlockSelected =
                        selection?.type === "block" &&
                        selection.sectionId === section.id &&
                        selection.blockId === block.id;

                      const bType = block.blockType?.type || block.type || "text";
                      const props = block.props || {};

                      return (
                        <div
                          key={block.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBlock(section.id, block.id);
                          }}
                          className={`relative group/block transition-all ${
                            !previewMode
                              ? isBlockSelected
                                ? "ring-2 ring-primary ring-offset-2 rounded-lg"
                                : "hover:ring-1 hover:ring-primary/40 rounded-lg"
                              : ""
                          }`}
                        >
                          {/* Block Floating Action Bar */}
                          {!previewMode && isBlockSelected && (
                            <div className="absolute -top-7 right-2 z-30 flex items-center gap-1 bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-lg border border-white/10">
                              <span className="text-primary uppercase tracking-wider">{bType.replace(/_/g, " ")}</span>
                              <button
                                type="button"
                                disabled={bIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveBlock(section.id, block.id, "up");
                                }}
                                className="p-0.5 hover:bg-white/10 rounded disabled:opacity-40"
                                title="Move up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                disabled={bIdx === blocks.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveBlock(section.id, block.id, "down");
                                }}
                                className="p-0.5 hover:bg-white/10 rounded disabled:opacity-40"
                                title="Move down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDuplicateBlock(section.id, block.id);
                                }}
                                className="p-0.5 hover:bg-white/10 rounded"
                                title="Duplicate"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteBlock(section.id, block.id);
                                }}
                                className="p-0.5 hover:bg-rose-500 rounded text-rose-300"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}

                          {/* Block Content Render */}
                          <CanvasBlockRender type={bType} props={props} />
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Block at Bottom of Section */}
                  {!previewMode && (
                    <div className="mt-4 pt-4 border-t border-slate-200/40 flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onAddBlock(section.id, "heading")}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-primary transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Element to Section
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          );
        })}

        {/* Add Section at Canvas End */}
        {!previewMode && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => onAddSection()}
              className="border-dashed border-slate-300 hover:border-primary text-slate-700 hover:text-primary text-xs font-bold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Section
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * High-fidelity WYSIWYG block renderer with Airborne Aviation design system
 */
function CanvasBlockRender({ type, props }: { type: string; props: any }) {
  switch (type) {
    case "hero":
      return (
        <div className="text-center space-y-4 py-6">
          {props.badge && (
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#D8A027] bg-[#D8A027]/15 border border-[#D8A027]/30 px-3 py-1 rounded">
              {props.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-inherit max-w-4xl mx-auto leading-tight">
            {props.heading || "Hero Heading"}
          </h1>
          {props.subheading && (
            <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
              {props.subheading}
            </p>
          )}
          {props.ctaText && (
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider px-6 py-3 rounded bg-[#DB241E] text-white shadow-lg shadow-red-500/20">
                {props.ctaText}
              </span>
              {props.secondaryCtaText && (
                <span className="inline-flex items-center justify-center font-bold text-xs uppercase tracking-wider px-6 py-3 rounded border border-current opacity-80">
                  {props.secondaryCtaText}
                </span>
              )}
            </div>
          )}
        </div>
      );

    case "heading": {
      const level = Number(props.level || 2);
      const alignClass = ALIGN_CLASSES[String(props.align || "left")] || "text-left";
      const sizeClass = { 1: "text-3xl sm:text-4xl", 2: "text-2xl sm:text-3xl", 3: "text-xl sm:text-2xl", 4: "text-lg" }[level] || "text-2xl";
      return (
        <div className={`${alignClass} py-1`}>
          <h2 className={`${sizeClass} font-black uppercase tracking-tight text-inherit`}>
            {props.content || "Heading Text"}
          </h2>
        </div>
      );
    }

    case "text": {
      const alignClass = ALIGN_CLASSES[String(props.align || "left")] || "text-left";
      return (
        <p className={`${alignClass} text-sm sm:text-base opacity-80 leading-relaxed py-1`}>
          {props.content || "Paragraph content text."}
        </p>
      );
    }

    case "rich_text":
      return (
        <div
          className="prose prose-slate max-w-none text-sm leading-relaxed py-1"
          dangerouslySetInnerHTML={{ __html: props.content || "<p>Rich text block...</p>" }}
        />
      );

    case "image":
      return (
        <figure className="py-2">
          <img
            src={props.src || "/images/hero-cockpit.jpg"}
            alt={props.alt || "Image"}
            className="w-full max-h-[440px] object-cover rounded-xl shadow-md border border-black/5"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23eee'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23aaa' font-family='sans-serif'%3EImage Placeholder%3C/text%3E%3C/svg%3E";
            }}
          />
          {props.caption && (
            <figcaption className="text-center text-xs opacity-60 mt-2 font-medium">
              {props.caption}
            </figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <div className="py-2">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
            <iframe
              src={props.src ? props.src.replace("watch?v=", "embed/") : "https://www.youtube.com/embed/dQw4w9WgXcQ"}
              title={props.title || "Video"}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          </div>
          {props.title && <p className="text-xs opacity-70 mt-2 font-semibold text-center">{props.title}</p>}
        </div>
      );

    case "button": {
      const isPrimary = (props.variant || "primary") === "primary";
      return (
        <div className="py-2">
          <span
            className={`inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded shadow ${
              isPrimary ? "bg-[#DB241E] text-white" : "border-2 border-[#00274C] text-[#00274C]"
            }`}
          >
            {props.label || "Click Here"}
          </span>
        </div>
      );
    }

    case "spacer":
      return (
        <div style={{ height: `${props.height || 48}px` }} className="flex items-center">
          {props.showLine && <div className="w-full h-px bg-current opacity-15" />}
        </div>
      );

    case "features": {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <div className="py-4 space-y-6">
          {props.title && (
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black uppercase tracking-tight text-inherit">{props.title}</h3>
              {props.subtitle && <p className="text-xs opacity-70">{props.subtitle}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {items.map((it: any, i: number) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-black/10 bg-white/50 backdrop-blur border-t-4 border-t-[#DB241E] shadow-sm space-y-2"
              >
                <div className="text-2xl">{it.icon || "✈️"}</div>
                <h4 className="text-sm font-bold uppercase text-inherit">{it.title}</h4>
                <p className="text-xs opacity-75 leading-relaxed">{it.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "stats": {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <div className="py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {items.map((st: any, i: number) => (
            <div key={i} className="p-4 rounded-xl border border-black/10 bg-white/40 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-[#DB241E]">{st.value}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "faq": {
      const items = Array.isArray(props.items) ? props.items : [];
      return (
        <div className="py-4 space-y-4">
          {props.title && (
            <h3 className="text-xl sm:text-2xl font-black uppercase text-inherit text-center">{props.title}</h3>
          )}
          <div className="space-y-2 max-w-3xl mx-auto">
            {items.map((fq: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-black/10 bg-white/70 shadow-sm space-y-2">
                <div className="text-sm font-bold text-inherit flex items-center justify-between">
                  <span>{fq.question}</span>
                  <span className="text-[#DB241E] font-bold">+</span>
                </div>
                <p className="text-xs opacity-75 leading-relaxed">{fq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "cta_banner":
      return (
        <div className="py-6">
          <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#00274C] to-[#001A33] text-white text-center space-y-4 shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {props.title || "Ready to Take to the Skies?"}
            </h3>
            {props.description && (
              <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
                {props.description}
              </p>
            )}
            {props.buttonText && (
              <div className="pt-2">
                <span className="inline-flex font-bold text-xs uppercase tracking-wider px-8 py-3 rounded bg-[#DB241E] text-white shadow-lg">
                  {props.buttonText}
                </span>
              </div>
            )}
          </div>
        </div>
      );

    case "lead_magnet":
      return (
        <div className="py-4">
          <div className="p-6 rounded-xl border-2 border-red-200 bg-red-50/50 border-l-8 border-l-[#DB241E] space-y-2">
            <h4 className="text-base font-black uppercase text-slate-900">{props.heading}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{props.description}</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded border border-[#DB241E] text-[#DB241E] bg-white shadow-sm">
                📥 {props.buttonText || "Download Free PDF"}
              </span>
            </div>
          </div>
        </div>
      );

    case "airline_logos": {
      const airlines = Array.isArray(props.airlines) ? props.airlines : [];
      return (
        <div className="py-4 space-y-3 text-center">
          {props.heading && (
            <p className="text-xs font-bold uppercase tracking-widest opacity-60">{props.heading}</p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
            {airlines.map((al: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10 bg-white/60 shadow-sm"
              >
                <span className="font-mono text-xs font-black text-[#DB241E] bg-red-50 px-1.5 py-0.5 rounded">
                  {al.code}
                </span>
                <span className="text-xs font-bold uppercase text-slate-800">{al.name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "cadet_stages": {
      const stages = Array.isArray(props.stages) ? props.stages : [];
      return (
        <div className="py-4 space-y-4">
          {props.heading && (
            <h3 className="text-xl sm:text-2xl font-black uppercase text-inherit text-center">{props.heading}</h3>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stages.map((st: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-black/10 bg-white/60 shadow-sm space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#DB241E] bg-red-50 px-2 py-0.5 rounded">
                  {st.stage}
                </span>
                <h4 className="text-sm font-bold uppercase text-inherit mt-1">{st.name}</h4>
                <p className="text-xs opacity-75 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "whatsapp_cta":
      return (
        <div className="py-4">
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-800 font-black text-sm uppercase">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                {props.headline || "Chat on WhatsApp"}
              </div>
              <p className="text-xs text-emerald-700">{props.subtext || "Get instant guidance from our counselors."}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow hover:bg-emerald-600 transition-colors shrink-0">
              <Phone className="h-3.5 w-3.5" />
              {props.buttonText || "Chat on WhatsApp"}
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 border border-dashed border-slate-300 rounded-lg text-xs opacity-60">
          Block: {type}
        </div>
      );
  }
}
