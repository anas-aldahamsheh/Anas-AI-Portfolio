import type { CSSProperties } from "react";

/** Infinite, CSS-only scrolling strip (pauses on hover, mirrored in RTL, static for reduced motion). */
export function Marquee({ items, duration = 45 }: { items: string[]; duration?: number }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <div className="marquee marquee-mask relative overflow-hidden py-1" aria-hidden="true">
      <div
        className="marquee-track gap-3"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#E5EAF2] bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-[#173B6C] shadow-2xs backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#CBD5E1]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-[#06B6D4] to-[#8B5CF6]" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
