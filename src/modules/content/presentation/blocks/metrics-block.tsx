import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer, StaggerItem } from "@/components/motion";

interface MetricItem {
  value: string;
  label: string;
  description?: string | undefined;
}

interface MetricsBlockProps {
  content: Record<string, unknown>;
}

export function MetricsBlock({ content }: MetricsBlockProps) {
  const items = (content["items"] as MetricItem[]) || [];

  if (items.length === 0) return null;

  return (
    <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item, idx) => (
        <StaggerItem key={idx}>
          <Card className="h-full border border-neutral-200/80 bg-white/50 backdrop-blur-xs dark:border-neutral-800/80 dark:bg-neutral-950/50">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <span className="text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl dark:text-neutral-50">
                {item.value}
              </span>
              <span className="mt-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {item.label}
              </span>
              {item.description && (
                <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </span>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
