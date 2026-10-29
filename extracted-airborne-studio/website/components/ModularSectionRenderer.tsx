"use client";

import React, { useState } from "react";
import { safeMediaSrc, safeHref, videoEmbedUrl, parseRichText, type RichNode } from "../lib/safeContent";

export interface ModularBlockData {
  id?: string;
  type?: string;
  _template?: string;
  [key: string]: any;
}

export interface ModularSectionRendererProps {
  sections: ModularBlockData[];
}

export function ModularSectionRenderer({ sections }: ModularSectionRendererProps) {
  if (!Array.isArray(sections) || sections.length === 0) return null;

  return (
    <div className="builder-page-flow flex flex-col gap-12 my-8 w-full">
      {sections.map((section, idx) => {
        const type = section._template || section.type || "unknown";
        const key = section.id || `section-${type}-${idx}`;

        switch (type) {
          case "hero":
            return <HeroBlock key={key} data={section} />;
          case "features":
            return <FeaturesBlock key={key} data={section} />;
          case "faq":
            return <FaqBlock key={key} data={section} />;
          case "stats":
            return <StatsBlock key={key} data={section} />;
          case "cta_banner":
            return <CtaBannerBlock key={key} data={section} />;
          case "lead_magnet":
            return <LeadMagnetBlock key={key} data={section} />;
          case "rich_text":
            return <RichTextBlock key={key} data={section} />;
          case "heading":
            return <HeadingBlock key={key} data={section} />;
          case "text":
            return <TextBlock key={key} data={section} />;
          case "image":
            return <ImageBlock key={key} data={section} />;
          case "video":
            return <VideoBlock key={key} data={section} />;
          case "button":
            return <ButtonBlock key={key} data={section} />;
          case "spacer":
            return <SpacerBlock key={key} data={section} />;
          case "two_column":
            return <TwoColumnBlock key={key} data={section} />;
          case "three_column":
            return <ThreeColumnBlock key={key} data={section} />;
          case "airline_logos":
            return <AirlineLogosBlock key={key} data={section} />;
          case "cadet_stages":
            return <CadetStagesBlock key={key} data={section} />;
          case "mentor_card":
            return <MentorCardBlock key={key} data={section} />;
          case "campus_walkthrough":
            return <CampusWalkthroughBlock key={key} data={section} />;
          case "pricing_table":
            return <PricingTableBlock key={key} data={section} />;
          case "whatsapp_cta":
            return <WhatsAppCtaBlock key={key} data={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// ─── Individual Block Renderers ──────────────────────────────────────────────

function HeroBlock({ data }: { data: ModularBlockData }) {
  const bg = safeMediaSrc(data.backgroundImage);
  return (
    <section
      className="rounded-xl p-8 sm:p-14 text-center text-white shadow-xl relative overflow-hidden"
      style={{
        background: bg
          ? `linear-gradient(rgba(15,23,42,0.85), rgba(15,23,42,0.92)), url(${bg})`
          : "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {data.badge && (
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full mb-4">
          {data.badge}
        </span>
      )}
      <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight max-w-4xl mx-auto leading-tight">
        {data.heading}
      </h1>
      {data.subheading && (
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {data.subheading}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {data.ctaText && data.ctaLink && (
          <a
            href={safeHref(data.ctaLink) || "#"}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wide transition-transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            {data.ctaText}
          </a>
        )}
        {data.secondaryCtaText && data.secondaryCtaLink && (
          <a
            href={safeHref(data.secondaryCtaLink) || "#"}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm tracking-wide transition-colors"
          >
            {data.secondaryCtaText}
          </a>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: ModularBlockData }) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <section className="py-6">
      {data.title && (
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-slate-900">
            {data.title}
          </h2>
          {data.subtitle && <p className="text-sm text-slate-500 mt-2">{data.subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border-t-4 border-t-blue-600"
          >
            {item.icon && <div className="text-3xl mb-3">{item.icon}</div>}
            <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FaqBlock({ data }: { data: ModularBlockData }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const items = Array.isArray(data.items) ? data.items : [];

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 shadow-sm">
      {data.title && (
        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 mb-6">
          {data.title}
        </h2>
      )}
      <div className="divide-y divide-slate-100">
        {items.map((item: any, i: number) => {
          const isOpen = openIdx === i;
          return (
            <div key={i} className="py-4">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex justify-between items-center text-left text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 transition-colors"
              >
                <span>{item.question}</span>
                <span className="text-lg font-light text-blue-600 ml-4">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed pl-1">{item.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatsBlock({ data }: { data: ModularBlockData }) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
      {items.map((item: any, i: number) => (
        <div
          key={i}
          className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 text-center shadow-sm"
        >
          <div className="text-2xl sm:text-3xl font-black text-blue-600">{item.value}</div>
          <div className="text-xs uppercase font-semibold text-slate-500 mt-1">{item.label}</div>
        </div>
      ))}
    </section>
  );
}

function CtaBannerBlock({ data }: { data: ModularBlockData }) {
  return (
    <section className="rounded-xl p-8 sm:p-12 text-center text-white bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-extrabold uppercase">{data.title}</h2>
      {data.description && (
        <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto">{data.description}</p>
      )}
      {data.buttonText && data.buttonLink && (
        <div className="mt-6">
          <a
            href={safeHref(data.buttonLink) || "#"}
            className="inline-flex px-8 py-3 rounded-lg bg-blue-500 hover:bg-blue-400 font-bold text-sm tracking-wide transition-transform hover:scale-105"
          >
            {data.buttonText}
          </a>
        </div>
      )}
    </section>
  );
}

function LeadMagnetBlock({ data }: { data: ModularBlockData }) {
  return (
    <section className="bg-blue-50/50 border border-blue-200 border-l-4 border-l-blue-600 rounded-xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-slate-900 uppercase">
        {data.heading || "Download Free Resource"}
      </h3>
      {data.description && (
        <p className="text-sm text-slate-600 mt-2 mb-4 leading-relaxed">{data.description}</p>
      )}
      <a
        href={safeHref(data.downloadFile) || "#"}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-blue-600 text-blue-700 font-bold text-xs uppercase hover:bg-blue-50 transition-colors"
      >
        📥 {data.buttonText || "Download Guide (PDF)"}
      </a>
    </section>
  );
}

function RichTextBlock({ data }: { data: ModularBlockData }) {
  return (
    <div className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
      {data.content}
    </div>
  );
}

function HeadingBlock({ data }: { data: ModularBlockData }) {
  const level = Number(data.level || 2);
  const Tag = (level === 1 ? "h1" : level === 3 ? "h3" : level === 4 ? "h4" : "h2") as any;
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[String(data.align || "left")] || "text-left";

  return (
    <Tag className={`font-extrabold uppercase tracking-tight text-slate-900 text-2xl sm:text-3xl ${alignClass}`}>
      {data.content}
    </Tag>
  );
}

function TextBlock({ data }: { data: ModularBlockData }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[String(data.align || "left")] || "text-left";

  return (
    <p className={`text-slate-600 leading-relaxed text-sm sm:text-base ${alignClass}`}>
      {data.content}
    </p>
  );
}

function ImageBlock({ data }: { data: ModularBlockData }) {
  const src = safeMediaSrc(data.src);
  if (!src) return null;
  return (
    <figure className="my-4">
      <img
        src={src}
        alt={data.alt || "Page image"}
        className="w-full max-h-[500px] object-cover rounded-xl border border-slate-200/80 shadow-sm"
      />
      {data.caption && (
        <figcaption className="text-center text-xs text-slate-500 mt-2">{data.caption}</figcaption>
      )}
    </figure>
  );
}

function VideoBlock({ data }: { data: ModularBlockData }) {
  const src = String(data.src || "");
  const embed = videoEmbedUrl(src);
  if (!embed) return null;

  return (
    <div className="my-6">
      <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={embed}
          title={data.title || "Embedded video"}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
        />
      </div>
      {data.title && (
        <p className="text-xs text-slate-500 mt-2 text-center">{data.title}</p>
      )}
    </div>
  );
}

function ButtonBlock({ data }: { data: ModularBlockData }) {
  const isPrimary = (data.variant || "primary") === "primary";
  return (
    <div className="my-3">
      <a
        href={safeHref(data.href) || "#"}
        className={`inline-flex px-6 py-2.5 rounded-lg text-xs uppercase font-bold tracking-wider transition-colors ${
          isPrimary
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
            : "border border-slate-300 text-slate-700 hover:bg-slate-100"
        }`}
      >
        {data.label || "Learn More"}
      </a>
    </div>
  );
}

function SpacerBlock({ data }: { data: ModularBlockData }) {
  const height = Number(data.height || 48);
  return (
    <div style={{ height: `${height}px` }} className="flex items-center w-full">
      {data.showLine && <hr className="w-full border-slate-200" />}
    </div>
  );
}

function TwoColumnBlock({ data }: { data: ModularBlockData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-900 text-base mb-2">{data.leftHeading}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{data.leftBody}</p>
      </div>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-900 text-base mb-2">{data.rightHeading}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{data.rightBody}</p>
      </div>
    </div>
  );
}

function ThreeColumnBlock({ data }: { data: ModularBlockData }) {
  const cards = Array.isArray(data.cards) ? data.cards : [];
  return (
    <div className="my-6">
      {data.heading && (
        <h3 className="text-xl font-bold uppercase text-slate-900 mb-6 text-center">
          {data.heading}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c: any, i: number) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
            <h4 className="font-bold text-slate-900 mb-2">{c.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AirlineLogosBlock({ data }: { data: ModularBlockData }) {
  const airlines = Array.isArray(data.airlines) ? data.airlines : [];
  return (
    <section className="text-center py-6">
      {data.heading && (
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          {data.heading}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {airlines.map((al: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
          >
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {al.code}
            </span>
            <span className="text-xs font-bold text-slate-800">{al.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CadetStagesBlock({ data }: { data: ModularBlockData }) {
  const stages = Array.isArray(data.stages) ? data.stages : [];
  return (
    <section className="my-6">
      {data.heading && (
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-slate-900 text-center mb-8">
          {data.heading}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stages.map((st: any, idx: number) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 border-t-4 border-t-slate-800 p-5 rounded-xl shadow-sm"
          >
            <span className="text-[10px] font-extrabold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {st.stage}
            </span>
            <h4 className="font-bold text-sm text-slate-900 mt-3 mb-1">{st.name}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{st.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MentorCardBlock({ data }: { data: ModularBlockData }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-blue-900 text-white flex items-center justify-center text-2xl font-black shrink-0">
        🧑‍✈️
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900 uppercase">{data.name}</h4>
        <p className="text-xs font-bold text-blue-600 mb-2">{data.role}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{data.bio}</p>
      </div>
    </div>
  );
}

function CampusWalkthroughBlock({ data }: { data: ModularBlockData }) {
  const features = Array.isArray(data.features) ? data.features : [];
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
      <h3 className="text-lg font-bold text-slate-900 uppercase mb-2">{data.title}</h3>
      {data.subtitle && <p className="text-xs text-slate-500 mb-4">{data.subtitle}</p>}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map((feat: string, i: number) => (
          <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span className="text-blue-600 font-bold">✓</span>
            <span>{feat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PricingTableBlock({ data }: { data: ModularBlockData }) {
  const includes = Array.isArray(data.includes) ? data.includes : [];
  return (
    <div className="bg-white border-2 border-slate-200 border-t-4 border-t-blue-600 rounded-xl p-8 text-center max-w-lg mx-auto shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 uppercase">{data.courseName}</h3>
      <div className="my-4">
        <span className="text-3xl font-black text-blue-600">
          {data.scholarshipFee || data.regularFee}
        </span>
        {data.regularFee && data.scholarshipFee && (
          <span className="text-sm line-through text-slate-400 ml-2">{data.regularFee}</span>
        )}
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Batch: {data.batchStarts} · Duration: {data.duration}
      </p>
      <ul className="space-y-2 text-left mb-6 text-xs text-slate-700 max-w-xs mx-auto">
        {includes.map((inc: string, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-blue-600 font-bold">✓</span>
            <span>{inc}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className="inline-flex px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider"
      >
        Enrol in Next Batch
      </a>
    </div>
  );
}

function WhatsAppCtaBlock({ data }: { data: ModularBlockData }) {
  const waUrl = `https://wa.me/${(data.phone || "919999123456").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    data.prefilledText || "Hi, I would like to enquire about courses."
  )}`;
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-emerald-950 text-base">{data.headline || "Chat on WhatsApp"}</h4>
        <p className="text-xs text-emerald-700 mt-1">{data.subtext || "Get instant answers to your questions."}</p>
      </div>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider"
      >
        💬 {data.buttonText || "Chat Now"}
      </a>
    </div>
  );
}

export default ModularSectionRenderer;
