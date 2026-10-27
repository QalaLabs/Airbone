"use client";

import * as React from "react";
import {
  X,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  Palette,
  Smartphone,
  Code,
  Plus,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPickerModal } from "./media-picker-modal";

interface RightInspectorProps {
  selection:
    | { type: "block"; sectionId: string; blockId: string }
    | { type: "section"; sectionId: string }
    | { type: "page" }
    | null;
  page: any;
  onUpdateBlockProps: (sectionId: string, blockId: string, patch: Record<string, any>) => void;
  onUpdateBlockStyle: (sectionId: string, blockId: string, patch: Record<string, any>) => void;
  onUpdateBlockResponsive: (sectionId: string, blockId: string, patch: Record<string, any>) => void;
  onUpdateSection: (sectionId: string, patch: Record<string, any>) => void;
  onUpdatePageMeta: (patch: Record<string, any>) => void;
  onDuplicateBlock: (sectionId: string, blockId: string) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onClose: () => void;
}

export function RightInspector({
  selection,
  page,
  onUpdateBlockProps,
  onUpdateBlockStyle,
  onUpdateBlockResponsive,
  onUpdateSection,
  onUpdatePageMeta,
  onDuplicateBlock,
  onDeleteBlock,
  onDuplicateSection,
  onDeleteSection,
  onClose,
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<"content" | "style" | "responsive" | "advanced">("content");
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = React.useState<{ propKey: string; allowed?: "image" | "video" | "all" } | null>(null);

  if (!selection || selection.type === "page") {
    // Page Settings Inspector
    return (
      <aside className="w-80 shrink-0 border-l border-white/10 bg-slate-900/95 flex flex-col h-full overflow-hidden text-white">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold">Page Settings</h3>
            <p className="text-[11px] text-muted-foreground">SEO & metadata configuration</p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Page Title</label>
            <Input
              value={page.title || ""}
              onChange={(e) => onUpdatePageMeta({ title: e.target.value })}
              className="bg-secondary/40 border-white/10 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">URL Slug</label>
            <div className="flex items-center rounded-md border border-white/10 bg-secondary/40 px-2 py-1 text-xs">
              <span className="text-muted-foreground">/pages/</span>
              <input
                type="text"
                value={page.slug || ""}
                onChange={(e) => onUpdatePageMeta({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                className="bg-transparent text-white focus:outline-none flex-1 ml-1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Internal Description</label>
            <Textarea
              rows={2}
              value={page.description || ""}
              onChange={(e) => onUpdatePageMeta({ description: e.target.value })}
              placeholder="Short description for admin reference..."
              className="bg-secondary/40 border-white/10 text-xs text-white"
            />
          </div>

          <div className="border-t border-white/10 pt-4 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Search Engine Optimization (SEO)</h4>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">SEO Title (Browser & Google)</label>
              <Input
                value={page.seoTitle || ""}
                onChange={(e) => onUpdatePageMeta({ seoTitle: e.target.value })}
                placeholder="e.g. Airline Cadet Pilot Program | Airborne Aviation"
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
              <p className="text-[10px] text-muted-foreground">{page.seoTitle?.length || 0}/60 characters recommended</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Meta Description</label>
              <Textarea
                rows={3}
                value={page.seoDesc || ""}
                onChange={(e) => onUpdatePageMeta({ seoDesc: e.target.value })}
                placeholder="Search snippet text for search results..."
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
              <p className="text-[10px] text-muted-foreground">{page.seoDesc?.length || 0}/160 characters recommended</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">SEO Keywords (Comma-separated)</label>
              <Input
                value={(page.seoKeywords || []).join(", ")}
                onChange={(e) =>
                  onUpdatePageMeta({
                    seoKeywords: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="pilot training, DGCA ground classes, cadet airline"
                className="bg-secondary/40 border-white/10 text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Social Share Image (OG Image)</label>
              <div className="flex gap-2">
                <Input
                  value={page.ogImage || ""}
                  onChange={(e) => onUpdatePageMeta({ ogImage: e.target.value })}
                  placeholder="https://... or /images/..."
                  className="bg-secondary/40 border-white/10 text-xs text-white flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-xs px-2.5"
                  onClick={() => {
                    setMediaPickerTarget({ propKey: "ogImage", allowed: "image" });
                    setMediaPickerOpen(true);
                  }}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {mediaPickerOpen && mediaPickerTarget && (
          <MediaPickerModal
            open={mediaPickerOpen}
            onOpenChange={setMediaPickerOpen}
            allowedTypes={mediaPickerTarget.allowed}
            value={page[mediaPickerTarget.propKey] || ""}
            onSelect={(url) => {
              onUpdatePageMeta({ [mediaPickerTarget.propKey]: url });
            }}
          />
        )}
      </aside>
    );
  }

  if (selection.type === "section") {
    const section = page.sections.find((s: any) => s.id === selection.sectionId);
    if (!section) return null;

    const settings = section.settings || {};

    return (
      <aside className="w-80 shrink-0 border-l border-white/10 bg-slate-900/95 flex flex-col h-full overflow-hidden text-white">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              Section Settings
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">{section.name || "Untitled Section"}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-white"
              title="Duplicate section"
              onClick={() => onDuplicateSection(section.id)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              title="Delete section"
              onClick={() => onDeleteSection(section.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Section Label</label>
            <Input
              value={section.name || ""}
              onChange={(e) => onUpdateSection(section.id, { name: e.target.value })}
              placeholder="e.g. Hero Section, Curriculum Overview"
              className="bg-secondary/40 border-white/10 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Background Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "white", label: "Pure White", bg: "bg-white text-slate-900" },
                { id: "paper", label: "Paper Off-White", bg: "bg-stone-100 text-slate-900" },
                { id: "light", label: "Light Navy Tint", bg: "bg-slate-800 text-white" },
                { id: "navy", label: "Deep Navy Blue", bg: "bg-[#00274C] text-white border-blue-400" },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdateSection(section.id, { settings: { ...settings, background: b.id } })}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-left flex items-center justify-between ${
                    (settings.background || "white") === b.id ? "ring-2 ring-primary border-primary" : "border-white/10"
                  } ${b.bg}`}
                >
                  <span>{b.label}</span>
                  {(settings.background || "white") === b.id && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Padding Spacing</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "compact", label: "Compact" },
                { id: "normal", label: "Normal" },
                { id: "spacious", label: "Spacious" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onUpdateSection(section.id, { settings: { ...settings, padding: p.id } })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    (settings.padding || "normal") === p.id
                      ? "border-primary bg-primary/20 text-white"
                      : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Max Width Container</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "narrow", label: "860px" },
                { id: "standard", label: "1200px" },
                { id: "full", label: "Full Width" },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onUpdateSection(section.id, { settings: { ...settings, maxWidth: w.id } })}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                    (settings.maxWidth || "standard") === w.id
                      ? "border-primary bg-primary/20 text-white"
                      : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <p className="text-xs font-bold text-white">Section Visibility</p>
              <p className="text-[10px] text-muted-foreground">Visible on public published page</p>
            </div>
            <Switch
              checked={section.isVisible !== false}
              onCheckedChange={(checked) => onUpdateSection(section.id, { isVisible: checked })}
            />
          </div>
        </div>
      </aside>
    );
  }

  // Block Inspector
  const section = page.sections.find((s: any) => s.id === selection.sectionId);
  const block = section?.blocks?.find((b: any) => b.id === selection.blockId);
  if (!block) return null;

  const props = block.props || {};
  const blockType = block.blockType?.type || block.type || "unknown";

  const handlePropChange = (key: string, val: any) => {
    onUpdateBlockProps(selection.sectionId, selection.blockId, { [key]: val });
  };

  const handleListItemChange = (listKey: string, index: number, field: string, val: any) => {
    const list = Array.isArray(props[listKey]) ? [...props[listKey]] : [];
    if (list[index]) {
      list[index] = { ...list[index], [field]: val };
      handlePropChange(listKey, list);
    }
  };

  const handleAddListItem = (listKey: string, defaultItem: any) => {
    const list = Array.isArray(props[listKey]) ? [...props[listKey]] : [];
    list.push(defaultItem);
    handlePropChange(listKey, list);
  };

  const handleRemoveListItem = (listKey: string, index: number) => {
    const list = Array.isArray(props[listKey]) ? [...props[listKey]] : [];
    list.splice(index, 1);
    handlePropChange(listKey, list);
  };

  return (
    <aside className="w-80 shrink-0 border-l border-white/10 bg-slate-900/95 flex flex-col h-full overflow-hidden text-white">
      {/* Top Inspector Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-slate-950/40">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {block.blockType?.name || blockType.replace(/_/g, " ")}
          </h3>
          <p className="text-[10px] text-muted-foreground">Customise content and appearance</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-white"
            title="Duplicate block"
            onClick={() => onDuplicateBlock(selection.sectionId, selection.blockId)}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            title="Delete block"
            onClick={() => onDeleteBlock(selection.sectionId, selection.blockId)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-4 bg-slate-950/80 border-b border-white/10 rounded-none h-9 p-0">
          <TabsTrigger value="content" className="text-[11px] font-bold data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
            Content
          </TabsTrigger>
          <TabsTrigger value="style" className="text-[11px] font-bold data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
            Style
          </TabsTrigger>
          <TabsTrigger value="responsive" className="text-[11px] font-bold data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
            Device
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-[11px] font-bold data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
            CSS
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: CONTENT */}
          <TabsContent value="content" className="m-0 space-y-4">
            {/* HERO BLOCK */}
            {blockType === "hero" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Badge Text</label>
                  <Input
                    value={String(props.badge ?? "")}
                    onChange={(e) => handlePropChange("badge", e.target.value)}
                    placeholder="✈️ BATCH ENROLMENT OPEN"
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Main Heading</label>
                  <Textarea
                    rows={2}
                    value={String(props.heading ?? "")}
                    onChange={(e) => handlePropChange("heading", e.target.value)}
                    placeholder="A DIRECT ROUTE TO THE AIRLINE FLIGHT DECK"
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subheading</label>
                  <Textarea
                    rows={3}
                    value={String(props.subheading ?? "")}
                    onChange={(e) => handlePropChange("subheading", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Primary CTA Button</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={String(props.ctaText ?? "")}
                      onChange={(e) => handlePropChange("ctaText", e.target.value)}
                      placeholder="Button Label"
                      className="bg-secondary/40 border-white/10 text-xs text-white"
                    />
                    <Input
                      value={String(props.ctaLink ?? "")}
                      onChange={(e) => handlePropChange("ctaLink", e.target.value)}
                      placeholder="#contact or /url"
                      className="bg-secondary/40 border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Hero Background Image</label>
                  <div className="flex gap-2">
                    <Input
                      value={String(props.backgroundImage ?? "")}
                      onChange={(e) => handlePropChange("backgroundImage", e.target.value)}
                      placeholder="Optional image URL"
                      className="bg-secondary/40 border-white/10 text-xs text-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/10 px-2.5"
                      onClick={() => {
                        setMediaPickerTarget({ propKey: "backgroundImage", allowed: "image" });
                        setMediaPickerOpen(true);
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* HEADING BLOCK */}
            {blockType === "heading" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Heading Text</label>
                  <Textarea
                    rows={2}
                    value={String(props.content ?? "")}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Heading Tag Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => handlePropChange("level", lvl)}
                        className={`p-1.5 rounded border text-xs font-bold ${
                          Number(props.level || 2) === lvl
                            ? "bg-primary border-primary text-white"
                            : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                        }`}
                      >
                        H{lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Alignment</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handlePropChange("align", align)}
                        className={`p-1.5 rounded border text-xs font-semibold capitalize ${
                          (props.align || "left") === align
                            ? "bg-primary border-primary text-white"
                            : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* PARAGRAPH BLOCK */}
            {blockType === "text" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Body Text</label>
                  <Textarea
                    rows={5}
                    value={String(props.content ?? "")}
                    onChange={(e) => handlePropChange("content", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white leading-relaxed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Alignment</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => handlePropChange("align", align)}
                        className={`p-1.5 rounded border text-xs font-semibold capitalize ${
                          (props.align || "left") === align
                            ? "bg-primary border-primary text-white"
                            : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* RICH TEXT */}
            {blockType === "rich_text" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">HTML / Formatted Content</label>
                <Textarea
                  rows={8}
                  value={String(props.content ?? "")}
                  onChange={(e) => handlePropChange("content", e.target.value)}
                  className="bg-secondary/40 border-white/10 text-xs text-white font-mono"
                />
              </div>
            )}

            {/* IMAGE */}
            {blockType === "image" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Image Source</label>
                  <div className="flex gap-2">
                    <Input
                      value={String(props.src ?? "")}
                      onChange={(e) => handlePropChange("src", e.target.value)}
                      className="bg-secondary/40 border-white/10 text-xs text-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-white/10 px-2.5"
                      onClick={() => {
                        setMediaPickerTarget({ propKey: "src", allowed: "image" });
                        setMediaPickerOpen(true);
                      }}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Alt Text (Accessibility)</label>
                  <Input
                    value={String(props.alt ?? "")}
                    onChange={(e) => handlePropChange("alt", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Caption</label>
                  <Input
                    value={String(props.caption ?? "")}
                    onChange={(e) => handlePropChange("caption", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
              </>
            )}

            {/* VIDEO */}
            {blockType === "video" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Video URL (YouTube/Vimeo/MP4)</label>
                  <Input
                    value={String(props.src ?? "")}
                    onChange={(e) => handlePropChange("src", e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Video Title</label>
                  <Input
                    value={String(props.title ?? "")}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
              </>
            )}

            {/* BUTTON */}
            {blockType === "button" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Button Label</label>
                  <Input
                    value={String(props.label ?? "")}
                    onChange={(e) => handlePropChange("label", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Destination URL</label>
                  <Input
                    value={String(props.href ?? "")}
                    onChange={(e) => handlePropChange("href", e.target.value)}
                    placeholder="#contact or /courses/cadet-preparation"
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Button Style Variant</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "primary", label: "Primary Red" },
                      { id: "outline", label: "Navy Outline" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handlePropChange("variant", v.id)}
                        className={`p-2 rounded border text-xs font-semibold ${
                          (props.variant || "primary") === v.id
                            ? "bg-primary border-primary text-white"
                            : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* SPACER */}
            {blockType === "spacer" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Height (px): {props.height || 48}px</label>
                <input
                  type="range"
                  min="16"
                  max="160"
                  step="8"
                  value={Number(props.height || 48)}
                  onChange={(e) => handlePropChange("height", Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {/* FEATURES GRID */}
            {blockType === "features" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                  <Input
                    value={String(props.title ?? "")}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Features List ({((props.items as any[]) || []).length})</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] border-white/10 px-2"
                      onClick={() => handleAddListItem("items", { icon: "✈️", title: "New Feature", description: "Details..." })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Card
                    </Button>
                  </div>
                  {((props.items as any[]) || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-white/10 bg-secondary/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          value={item.icon || ""}
                          onChange={(e) => handleListItemChange("items", idx, "icon", e.target.value)}
                          placeholder="Icon/Emoji"
                          className="h-7 w-16 bg-slate-900 border-white/10 text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-400"
                          onClick={() => handleRemoveListItem("items", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={item.title || ""}
                        onChange={(e) => handleListItemChange("items", idx, "title", e.target.value)}
                        placeholder="Feature Title"
                        className="h-7 bg-slate-900 border-white/10 text-xs text-white"
                      />
                      <Textarea
                        rows={2}
                        value={item.description || ""}
                        onChange={(e) => handleListItemChange("items", idx, "description", e.target.value)}
                        placeholder="Feature Description"
                        className="bg-slate-900 border-white/10 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* STATS COUNTER */}
            {blockType === "stats" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Stat Counters</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-6 text-[11px] border-white/10 px-2"
                    onClick={() => handleAddListItem("items", { value: "100+", label: "Metric Name" })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Stat
                  </Button>
                </div>
                {((props.items as any[]) || []).map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg border border-white/10 bg-secondary/30 flex items-center gap-2">
                    <Input
                      value={item.value || ""}
                      onChange={(e) => handleListItemChange("items", idx, "value", e.target.value)}
                      placeholder="e.g. 2,500+"
                      className="h-7 w-24 bg-slate-900 border-white/10 text-xs font-bold text-primary"
                    />
                    <Input
                      value={item.label || ""}
                      onChange={(e) => handleListItemChange("items", idx, "label", e.target.value)}
                      placeholder="Label"
                      className="h-7 flex-1 bg-slate-900 border-white/10 text-xs text-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-rose-400"
                      onClick={() => handleRemoveListItem("items", idx)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* FAQ ACCORDION */}
            {blockType === "faq" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">FAQ Heading</label>
                  <Input
                    value={String(props.title ?? "")}
                    onChange={(e) => handlePropChange("title", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Questions ({((props.items as any[]) || []).length})</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] border-white/10 px-2"
                      onClick={() => handleAddListItem("items", { question: "New Question?", answer: "Answer here..." })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Question
                    </Button>
                  </div>
                  {((props.items as any[]) || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-white/10 bg-secondary/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-primary">Q{idx + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-rose-400"
                          onClick={() => handleRemoveListItem("items", idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Input
                        value={item.question || ""}
                        onChange={(e) => handleListItemChange("items", idx, "question", e.target.value)}
                        placeholder="Question"
                        className="h-7 bg-slate-900 border-white/10 text-xs text-white font-semibold"
                      />
                      <Textarea
                        rows={3}
                        value={item.answer || ""}
                        onChange={(e) => handleListItemChange("items", idx, "answer", e.target.value)}
                        placeholder="Answer"
                        className="bg-slate-900 border-white/10 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AIRLINE LOGOS */}
            {blockType === "airline_logos" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                  <Input
                    value={String(props.heading ?? "")}
                    onChange={(e) => handlePropChange("heading", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white">Airlines</label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] border-white/10 px-2"
                      onClick={() => handleAddListItem("airlines", { name: "Airline Name", code: "XX" })}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Airline
                    </Button>
                  </div>
                  {((props.airlines as any[]) || []).map((al, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        value={al.name || ""}
                        onChange={(e) => handleListItemChange("airlines", idx, "name", e.target.value)}
                        className="h-7 flex-1 bg-slate-900 border-white/10 text-xs text-white"
                      />
                      <Input
                        value={al.code || ""}
                        onChange={(e) => handleListItemChange("airlines", idx, "code", e.target.value)}
                        className="h-7 w-16 bg-slate-900 border-white/10 text-xs text-white font-mono uppercase"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-rose-400"
                        onClick={() => handleRemoveListItem("airlines", idx)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CADET SELECTION STAGES */}
            {blockType === "cadet_stages" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Section Title</label>
                  <Input
                    value={String(props.heading ?? "")}
                    onChange={(e) => handlePropChange("heading", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-2 border-t border-white/10 pt-3">
                  <label className="text-xs font-bold text-white">Stages List</label>
                  {((props.stages as any[]) || []).map((st, idx) => (
                    <div key={idx} className="p-2 rounded border border-white/10 bg-slate-950/60 space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          value={st.stage || ""}
                          onChange={(e) => handleListItemChange("stages", idx, "stage", e.target.value)}
                          placeholder="Stage 01"
                          className="h-7 w-24 bg-slate-900 border-white/10 text-xs font-bold text-primary"
                        />
                        <Input
                          value={st.name || ""}
                          onChange={(e) => handleListItemChange("stages", idx, "name", e.target.value)}
                          placeholder="Stage Name"
                          className="h-7 flex-1 bg-slate-900 border-white/10 text-xs text-white"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={st.desc || ""}
                        onChange={(e) => handleListItemChange("stages", idx, "desc", e.target.value)}
                        placeholder="Description"
                        className="bg-slate-900 border-white/10 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* WHATSAPP CTA */}
            {blockType === "whatsapp_cta" && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Headline</label>
                  <Input
                    value={String(props.headline ?? "")}
                    onChange={(e) => handlePropChange("headline", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">WhatsApp Number</label>
                  <Input
                    value={String(props.phone ?? "")}
                    onChange={(e) => handlePropChange("phone", e.target.value)}
                    placeholder="+919999123456"
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Button Text</label>
                  <Input
                    value={String(props.buttonText ?? "")}
                    onChange={(e) => handlePropChange("buttonText", e.target.value)}
                    className="bg-secondary/40 border-white/10 text-xs text-white"
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* TAB 2: STYLE */}
          <TabsContent value="style" className="m-0 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Component Alignment</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => handlePropChange("align", align)}
                    className={`p-1.5 rounded border text-xs font-semibold capitalize ${
                      (props.align || "left") === align
                        ? "bg-primary border-primary text-white"
                        : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Box Shadow</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["none", "subtle", "elevated"].map((shadow) => (
                  <button
                    key={shadow}
                    type="button"
                    onClick={() => onUpdateBlockStyle(selection.sectionId, selection.blockId, { shadow })}
                    className={`p-1.5 rounded border text-xs font-semibold capitalize ${
                      (props.shadow || "none") === shadow
                        ? "bg-primary border-primary text-white"
                        : "border-white/10 bg-secondary/30 text-muted-foreground hover:text-white"
                    }`}
                  >
                    {shadow}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: RESPONSIVE */}
          <TabsContent value="responsive" className="m-0 space-y-4">
            <div className="p-3 bg-secondary/30 rounded-lg border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Hide on Desktop</p>
                  <p className="text-[10px] text-muted-foreground">Hidden on screens &gt; 1024px</p>
                </div>
                <Switch
                  checked={Boolean(props.hideDesktop)}
                  onCheckedChange={(checked) => onUpdateBlockResponsive(selection.sectionId, selection.blockId, { hideDesktop: checked })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div>
                  <p className="text-xs font-semibold text-white">Hide on Tablet</p>
                  <p className="text-[10px] text-muted-foreground">Hidden on 768px - 1024px</p>
                </div>
                <Switch
                  checked={Boolean(props.hideTablet)}
                  onCheckedChange={(checked) => onUpdateBlockResponsive(selection.sectionId, selection.blockId, { hideTablet: checked })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <div>
                  <p className="text-xs font-semibold text-white">Hide on Mobile</p>
                  <p className="text-[10px] text-muted-foreground">Hidden on screens &lt; 768px</p>
                </div>
                <Switch
                  checked={Boolean(props.hideMobile)}
                  onCheckedChange={(checked) => onUpdateBlockResponsive(selection.sectionId, selection.blockId, { hideMobile: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: ADVANCED / CSS */}
          <TabsContent value="advanced" className="m-0 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Custom CSS Class Names</label>
              <Input
                value={String(props.className ?? "")}
                onChange={(e) => handlePropChange("className", e.target.value)}
                placeholder="e.g. shadow-lg rounded-2xl"
                className="bg-secondary/40 border-white/10 text-xs text-white font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">HTML Anchor ID</label>
              <Input
                value={String(props.id ?? "")}
                onChange={(e) => handlePropChange("id", e.target.value)}
                placeholder="e.g. contact or syllabus"
                className="bg-secondary/40 border-white/10 text-xs text-white font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Used for in-page link navigation (e.g. #contact)</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {mediaPickerOpen && mediaPickerTarget && (
        <MediaPickerModal
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          allowedTypes={mediaPickerTarget.allowed}
          value={String(props[mediaPickerTarget.propKey] ?? "")}
          onSelect={(url) => {
            handlePropChange(mediaPickerTarget.propKey, url);
          }}
        />
      )}
    </aside>
  );
}
