import type { CSSProperties, ElementType, ReactNode } from "react";

export type RevealVariant = "up" | "down" | "start" | "end" | "scale" | "blur" | "fade";

interface RevealProps {
  as?: ElementType;
  variant?: RevealVariant;
  /** Delay in ms (use index * step for staggered lists). */
  delay?: number;
  className?: string;
  children?: ReactNode;
  id?: string;
  style?: CSSProperties;
  "aria-labelledby"?: string;
  "aria-label"?: string;
  [key: `data-${string}`]: string | undefined;
}

/**
 * Scroll-triggered entrance without shipping JavaScript per element: renders plain markup
 * with `data-reveal`; one observer (see DocumentScript) reveals it when it enters the viewport.
 * Visible by default for crawlers, no-JS and reduced-motion visitors.
 */
export function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  return (
    <Tag
      data-reveal={variant}
      className={className}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const ARABIC = /[؀-ۿ]/;
const SPACE = /^\s+$/;

/**
 * Splits text into animated units (words for Arabic to keep letters joined, letters otherwise).
 * Every unit is an inline-block, which bidi treats as one neutral character, so two rules keep
 * mixed text readable: the wrapper takes the text's own direction (an English title on an
 * Arabic page keeps its letter order), and inside Arabic text a run of Latin words stays one
 * unit (otherwise "تقييم Large Language Models" would read "Models Language Large تقييم").
 */
export function SplitText({
  text,
  by = "auto",
  baseDelay = 0,
  step,
  className,
}: {
  text: string;
  by?: "auto" | "word" | "char";
  baseDelay?: number;
  step?: number;
  className?: string;
}) {
  const arabic = ARABIC.test(text);
  const mode =
    by === "auto" ? (arabic || text.length > 40 ? "word" : "char") : arabic ? "word" : by;
  const parts = text.split(/(\s+)/).filter(Boolean);
  const words: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? "";
    const previous = words[words.length - 1];
    const next = parts[i + 1];
    if (
      arabic &&
      SPACE.test(part) &&
      previous &&
      !SPACE.test(previous) &&
      !ARABIC.test(previous) &&
      next &&
      !ARABIC.test(next)
    ) {
      words[words.length - 1] = previous + part + next;
      i++;
      continue;
    }
    words.push(part);
  }
  let index = 0;
  return (
    <span
      dir={arabic ? "rtl" : "ltr"}
      className={className ? `split-text ${className}` : "split-text"}
      style={
        {
          "--split-base": `${baseDelay}ms`,
          "--split-step": `${step ?? (mode === "word" ? 70 : 28)}ms`,
        } as CSSProperties
      }
    >
      <span className="sr-only">{text}</span>
      {words.map((word, w) =>
        /^\s+$/.test(word) ? (
          <span key={`s${w}`} aria-hidden="true">
            {word}
          </span>
        ) : mode === "word" ? (
          <span
            key={`w${w}`}
            aria-hidden="true"
            className="split-unit"
            style={{ "--i": index++ } as CSSProperties}
          >
            {word}
          </span>
        ) : (
          <span key={`w${w}`} aria-hidden="true" className="inline-block whitespace-nowrap">
            {[...word].map((char, c) => (
              <span key={c} className="split-unit" style={{ "--i": index++ } as CSSProperties}>
                {char}
              </span>
            ))}
          </span>
        ),
      )}
    </span>
  );
}
