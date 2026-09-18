import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DirectionalIcon } from "@/modules/localization/presentation/directional-icon";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { NavIcon } from "@/modules/navigation/presentation/nav-icon";
import { cn } from "@/lib/utils";

interface CardItem {
  id: string;
  title: string;
  description: string;
  badge?: string | undefined;
  url?: string | undefined;
  icon?: string | undefined;
}

interface CardCollectionBlockProps {
  config: Record<string, unknown>;
  content: Record<string, unknown>;
  locale?: string | undefined;
}

export function CardCollectionBlock({ config, content, locale }: CardCollectionBlockProps) {
  const items = (content["items"] as CardItem[]) || [];
  const columns = (config["columns"] as string) || (content["columns"] as string) || "2";

  if (items.length === 0) return null;

  const gridColsClass =
    columns === "1"
      ? "grid-cols-1"
      : columns === "3"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns === "4"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2";

  return (
    <StaggerContainer className={cn("grid gap-4", gridColsClass)}>
      {items.map((item) => {
        const hasUrl = Boolean(item.url);
        const isExternal = item.url?.startsWith("http") || item.url?.startsWith("//");
        const href =
          hasUrl && item.url
            ? isExternal || !locale
              ? item.url
              : `/${locale}${item.url.startsWith("/") ? item.url : `/${item.url}`}`
            : undefined;

        const cardElement = (
          <Card className="group relative h-full transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {item.icon && <NavIcon name={item.icon} className="h-4 w-4 opacity-70" />}
                  <CardTitle>{item.title}</CardTitle>
                  {item.badge && (
                    <Badge variant="secondary" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {hasUrl && (
                  <DirectionalIcon
                    name="chevron-end"
                    size={18}
                    className="text-neutral-400 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  />
                )}
              </div>
              <CardDescription className="mt-2 text-xs leading-relaxed sm:text-sm">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        );

        return (
          <StaggerItem key={item.id}>
            {href ? (
              <Link
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="block h-full"
              >
                {cardElement}
              </Link>
            ) : (
              cardElement
            )}
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
