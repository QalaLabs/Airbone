"use client";

import React, { createElement } from "react";
import { parseRichText, safeHref, safeMediaSrc, videoEmbedUrl, type RichNode } from "../lib/safeContent";
import { ModularSectionRenderer } from "./ModularSectionRenderer";

function RichNodes({ nodes }: { nodes: RichNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.t === "text") return node.v;
        const children = node.children.length ? <RichNodes nodes={node.children} /> : undefined;
        if (node.tag === "a") {
          if (!node.href) return <span key={i}>{children}</span>;
          return (
            <a
              key={i}
              href={node.href}
              {...(node.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-blue-600 underline font-medium hover:text-blue-700"
            >
              {children}
            </a>
          );
        }
        return createElement(node.tag, { key: i }, children);
      })}
    </>
  );
}

function Block({ block }: { block: any }) {
  const props = block.props && typeof block.props === "object" ? block.props : {};
  const type = block.blockType?.type || block.type;

  switch (type) {
    case "heading": {
      const level = Math.min(Math.max(Number(props.level ?? 2), 1), 4);
      const Tag = (level === 1 ? "h1" : level === 3 ? "h3" : level === 4 ? "h4" : "h2") as any;
      return <Tag className="font-extrabold text-2xl sm:text-3xl text-slate-900 my-2">{String(props.content ?? "")}</Tag>;
    }
    case "text":
      return <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line my-2">{String(props.content ?? "")}</p>;
    case "rich_text":
      return (
        <div className="text-slate-700 leading-relaxed my-3">
          <RichNodes nodes={parseRichText(props.content)} />
        </div>
      );
    case "image": {
      const src = safeMediaSrc(props.src);
      if (!src) return null;
      return (
        <figure className="my-4">
          <img
            src={src}
            alt={String(props.alt ?? "")}
            className="w-full max-h-[500px] object-cover rounded-xl border border-slate-200"
          />
          {props.caption && (
            <figcaption className="text-xs text-slate-500 text-center mt-2">{String(props.caption)}</figcaption>
          )}
        </figure>
      );
    }
    case "video": {
      const embed = videoEmbedUrl(props.src);
      if (!embed) return null;
      return (
        <div className="my-6">
          <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden bg-black">
            <iframe
              src={embed}
              title={String(props.title ?? "Video")}
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
    case "button": {
      const href = safeHref(props.href);
      const label = String(props.label ?? "");
      if (!href || !label) return null;
      return (
        <p className="my-3">
          <a
            href={href}
            className="inline-flex px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-blue-500"
            {...(props.target === "_blank" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>
        </p>
      );
    }
    case "spacer": {
      const height = Number(props.height ?? 48);
      return <div style={{ height: `${height}px` }} className="w-full" aria-hidden="true" />;
    }
    default: {
      if (type) {
        return <ModularSectionRenderer sections={[{ type, id: block.id, ...props }]} />;
      }
      return null;
    }
  }
}

export function CmsPageContent({ page }: { page: any }) {
  const sections = Array.isArray(page.sections) ? page.sections : [];

  return (
    <div className="space-y-12 my-8">
      {sections.map((section: any) => {
        const blocks = Array.isArray(section.blocks) ? section.blocks : [];
        const settings = section.settings || {};

        return (
          <section key={section.id} className="space-y-4">
            {section.name && (
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900 border-b pb-2">
                {section.name}
              </h2>
            )}
            <div className="space-y-4">
              {blocks.map((block: any) => (
                <Block key={block.id} block={block} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default CmsPageContent;
