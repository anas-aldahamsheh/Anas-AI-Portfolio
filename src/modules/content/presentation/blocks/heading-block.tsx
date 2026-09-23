import { cn } from "@/lib/utils";

interface HeadingBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
}

export function HeadingBlock({ config, content }: HeadingBlockProps) {
  const level = (config["level"] as string) || "h2";
  const align = (config["align"] as string) || "start";
  const text = (content["text"] as string) || "";
  const subtitle = content["subtitle"] as string | undefined;

  const alignClass =
    align === "center" ? "text-center" : align === "end" ? "text-end" : "text-start";

  const renderHeading = () => {
    switch (level) {
      case "h1":
        return (
          <h1 className="text-3xl font-bold tracking-tight text-[#173B6C] sm:text-4xl dark:text-neutral-50">
            {text}
          </h1>
        );
      case "h3":
        return (
          <h3 className="text-lg font-semibold tracking-tight text-[#173B6C] dark:text-neutral-100">
            {text}
          </h3>
        );
      case "h4":
        return (
          <h4 className="text-base font-semibold text-[#173B6C] dark:text-neutral-100">{text}</h4>
        );
      case "h2":
      default:
        return (
          <h2 className="text-xl font-bold tracking-tight text-[#173B6C] sm:text-2xl dark:text-neutral-100">
            {text}
          </h2>
        );
    }
  };

  return (
    <div className={cn("space-y-2", alignClass)}>
      {renderHeading()}
      {subtitle && (
        <p className="max-w-2xl text-sm text-neutral-600 sm:text-base dark:text-neutral-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
