import React from "react";
import { detectScriptDirection } from "../domain/direction";

interface MixedContentProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  text?: string;
  as?: "div" | "span" | "p" | "bdi";
  autoDetect?: boolean;
  className?: string;
}

/**
 * Mixed Content Wrapper.
 * Isolates bidirectional text segments (e.g. Arabic descriptions with English URLs or code tokens)
 * ensuring proper reading order and logical alignment without corrupting surrounding layout.
 */
export function MixedContent({
  children,
  text,
  as: Component = "span",
  autoDetect = true,
  className = "",
  ...props
}: MixedContentProps) {
  const contentToAnalyze = text ?? (typeof children === "string" ? children : "");

  const resolvedDir =
    autoDetect && contentToAnalyze.length > 0 ? detectScriptDirection(contentToAnalyze) : "auto";

  return (
    <Component
      dir={resolvedDir}
      className={`inline-block text-start ${className}`.trim()}
      {...props}
    >
      {text ?? children}
    </Component>
  );
}

interface IsolatedTokenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Isolates code tokens, numbers, or URLs within bidirectional sentences.
 */
export function IsolatedToken({ children, className = "" }: IsolatedTokenProps) {
  return (
    <bdi dir="ltr" className={`inline-block text-start font-mono ${className}`.trim()}>
      {children}
    </bdi>
  );
}
