import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaItem {
  label: string;
  url: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | undefined;
  openInNewTab?: boolean | undefined;
}

interface CtaBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  locale?: string | undefined;
}

export function CtaBlock({ config, content, locale }: CtaBlockProps) {
  const align = (config["align"] as string) || "start";
  const alignClass =
    align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start";

  const defaultVariant =
    (config["variant"] as "primary" | "secondary" | "outline" | "ghost") || "primary";

  // Support multiple CTA items or single CTA definition
  const rawItems = content["items"] as CtaItem[] | undefined;
  const items: CtaItem[] =
    rawItems && rawItems.length > 0
      ? rawItems
      : content["label"]
        ? [
            {
              label: content["label"] as string,
              url: (content["url"] as string) || "#",
              variant: defaultVariant,
              openInNewTab: Boolean(content["openInNewTab"]),
            },
          ]
        : [];

  return (
    <div className={cn("flex flex-wrap items-center gap-3 pt-2", alignClass)}>
      {items.map((item, idx) => {
        const isExternal = item.url.startsWith("http") || item.url.startsWith("//");
        const href =
          isExternal || !locale
            ? item.url
            : `/${locale}${item.url.startsWith("/") ? item.url : `/${item.url}`}`;

        return (
          <Link
            key={idx}
            href={href}
            target={item.openInNewTab ? "_blank" : undefined}
            rel={item.openInNewTab ? "noopener noreferrer" : undefined}
          >
            <Button variant={item.variant || defaultVariant} size="md">
              {item.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
