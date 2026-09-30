"use client";

import { useEffect, useState } from "react";

/**
 * Types each role, pauses, erases, and moves to the next. The first role is rendered on the
 * server (so the text is always there for SEO and no-JS); animation starts after hydration.
 */
export function RolesTypewriter({ roles }: { roles: string[] }) {
  const list = roles.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(list[0] ?? "");
  const [phase, setPhase] = useState<"hold" | "erase" | "type">("hold");

  useEffect(() => {
    if (list.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    if (phase === "hold") {
      timer = setTimeout(() => setPhase("erase"), 2600);
    } else if (phase === "erase") {
      timer =
        text.length > 0
          ? setTimeout(() => setText(text.slice(0, -1)), 28)
          : setTimeout(() => {
              setIndex((i) => (i + 1) % list.length);
              setPhase("type");
            }, 180);
    } else {
      const next = list[index] ?? "";
      timer =
        text.length < next.length
          ? setTimeout(() => setText(next.slice(0, text.length + 1)), 55 + Math.random() * 35)
          : setTimeout(() => setPhase("hold"), 60);
    }
    return () => clearTimeout(timer);
  }, [phase, text, index, list]);

  return (
    <span className="inline-flex items-baseline">
      <span className="sr-only">{list.join(" · ")}</span>
      <span aria-hidden="true" className="text-gradient-accent font-semibold">
        {text || " "}
      </span>
      <span
        aria-hidden="true"
        className="typing-caret ms-1 inline-block w-[2.5px] self-stretch rounded-full bg-gradient-to-b from-[#4F46E5] to-[#0891B2] shadow-[0_0_8px_rgba(8,145,178,0.7)] dark:from-[#8B8CFF] dark:to-[#67E8F9]"
      />
    </span>
  );
}
