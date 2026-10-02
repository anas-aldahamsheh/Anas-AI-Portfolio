import { CountUp } from "@/ui/count-up";
import { Reveal } from "@/ui/motion/reveal";

/** "93.9% | passage ranked first" → { value: "93.9%", label: "passage ranked first" } */
export function parseMetric(line: string): { value: string; label: string } | null {
  const [value, ...rest] = line.split("|");
  const label = rest.join("|").trim();
  return value?.trim() && label ? { value: value.trim(), label } : null;
}

function MetricValue({ value }: { value: string }) {
  // Whole numbers count up; anything else (decimals, ranges, "97k") is shown as written.
  const match = /^([^\d]*)(\d{1,7})([^\d.,].*|)$/.exec(value);
  if (!match) return <>{value}</>;
  const [, prefix = "", digits = "0", suffix = ""] = match;
  return (
    <>
      {prefix}
      <CountUp value={Number(digits)} suffix={suffix} />
    </>
  );
}

export function ProjectMetrics({ items, label }: { items: string[]; label: string }) {
  const metrics = items.map(parseMetric).filter((m) => m !== null);
  if (metrics.length === 0) return null;
  return (
    <section aria-label={label}>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {metrics.slice(0, 8).map((metric, i) => (
          <Reveal as="li" key={i} delay={i * 70} variant="up">
            <div className="group relative h-full overflow-hidden rounded-2xl border border-[#E5EAF2] bg-white/85 p-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#D0E2FF] hover:shadow-[0_24px_50px_-30px_rgba(47,111,237,0.55)] sm:p-5 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:border-white/[0.16]">
              <span
                className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-[#2F6FED]/20 to-[#8B5CF6]/10 blur-2xl transition-transform duration-700 group-hover:scale-150"
                aria-hidden="true"
              />
              <p
                dir="ltr"
                className="font-display relative bg-gradient-to-br from-[#173B6C] to-[#2F6FED] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl rtl:text-end dark:from-white dark:to-indigo-300"
              >
                <MetricValue value={metric.value} />
              </p>
              <p className="relative mt-1.5 text-xs leading-snug font-medium text-[#637089] sm:text-sm dark:text-[#9AA8C0]">
                {metric.label}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
