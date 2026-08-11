import type { PageBlockModel } from "@/types";

const ALIGN_CLASSES: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function videoEmbedUrl(src: string): string {
  const trimmed = src.trim();
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com") && url.pathname === "/watch") {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (url.hostname.includes("youtu.be")) {
      const v = url.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (url.hostname.includes("vimeo.com")) {
      const v = url.pathname.slice(1).split("/")[0];
      if (v) return `https://player.vimeo.com/video/${v}`;
    }
  } catch {
    return "";
  }
  return "";
}

export default function BlockRenderer({ block }: { block: PageBlockModel }) {
  const { type } = block.blockType;
  const props = block.props ?? {};

  switch (type) {
    case "heading": {
      const level = Number(props.level ?? 2);
      const Tag = (["h1", "h2", "h3", "h4"] as const)[Math.min(Math.max(level, 1), 4) - 1] ?? "h2";
      const align = ALIGN_CLASSES[String(props.align ?? "left")] ?? ALIGN_CLASSES.left;
      return (
        <Tag className={`${align} font-bold tracking-tight`}>
          {String(props.content ?? "")}
        </Tag>
      );
    }

    case "text": {
      const align = ALIGN_CLASSES[String(props.align ?? "left")] ?? ALIGN_CLASSES.left;
      return (
        <p className={`${align} leading-relaxed`}>
          {String(props.content ?? "")}
        </p>
      );
    }

    case "rich_text": {
      return (
        <div
          className="prose prose-slate dark:prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: String(props.content ?? "") }}
        />
      );
    }

    case "image": {
      const src = String(props.src ?? "");
      if (!src) return null;
      return (
        <figure>
          <img
            src={src}
            alt={String(props.alt ?? "")}
            className={`w-full ${String(props.objectFit ?? "cover") === "contain" ? "object-contain" : "object-cover"} rounded-lg`}
          />
          {props.caption ? (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {String(props.caption)}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "video": {
      const src = String(props.src ?? "");
      if (!src) return null;
      const embed = videoEmbedUrl(src);
      const ratio = String(props.aspectRatio ?? "16/9");
      const [w, h] = ratio.split("/").map(Number);
      const pad = w && h ? `${(h / w) * 100}%` : "56.25%";
      return (
        <div className="my-4">
          <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingBottom: pad }}>
            {embed ? (
              <iframe
                src={embed}
                title={String(props.title ?? "Embedded video")}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={src} controls className="absolute inset-0 h-full w-full" />
            )}
          </div>
          {props.title ? (
            <p className="mt-2 text-sm text-muted-foreground">{String(props.title)}</p>
          ) : null}
        </div>
      );
    }

    case "button": {
      const label = String(props.label ?? "");
      if (!label) return null;
      const variant = String(props.variant ?? "primary");
      const classes: Record<string, string> = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      };
      return (
        <a
          href={String(props.href ?? "")}
          target={String(props.target ?? "_self")}
          className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${classes[variant] ?? classes.primary}`}
        >
          {label}
        </a>
      );
    }

    case "spacer": {
      const height = Number(props.height ?? 48);
      return <div style={{ height: Number.isFinite(height) && height >= 0 ? height : 48 }} />;
    }

    default:
      return null;
  }
}
