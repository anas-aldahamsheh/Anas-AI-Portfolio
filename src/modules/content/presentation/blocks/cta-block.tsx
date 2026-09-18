import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  locale?: string | undefined;
}

export function CtaBlock({ config, content, locale }: CtaBlockProps) {
  const variant = (config["variant"] as "primary" | "secondary" | "outline") || "primary";
  const align = (config["align"] as string) || "start";
  const label = (content["label"] as string) || "Click Here";
  const url = (content["url"] as string) || "#";
  const openInNewTab = Boolean(content["openInNewTab"]);

  const alignClass =
    align === "center" ? "justify-center" : align === "end" ? "justify-end" : "justify-start";

  const isExternal = url.startsWith("http") || url.startsWith("//");
  const href = isExternal || !locale ? url : `/${locale}${url.startsWith("/") ? url : `/${url}`}`;

  return (
    <div className={cn("flex items-center", alignClass)}>
      <Link
        href={href}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        <Button variant={variant} size="md">
          {label}
        </Button>
      </Link>
    </div>
  );
}
