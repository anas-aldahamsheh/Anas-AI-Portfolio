import { cn } from "@/lib/utils";

interface RichTextBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

export function RichTextBlock({ config, content }: RichTextBlockProps) {
  const variant = (config["variant"] as string) || "default";
  const body = (content["body"] as string) || "";

  const variantClass =
    variant === "lead"
      ? "text-base sm:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200"
      : variant === "muted"
        ? "text-xs sm:text-sm text-neutral-500 dark:text-neutral-400"
        : "text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300";

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", variantClass)}>
      {body}
    </div>
  );
}
