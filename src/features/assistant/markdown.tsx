"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import type { SourceRef } from "./store";

/**
 * A deliberately small Markdown renderer for assistant answers: paragraphs, bullet and numbered
 * lists, **bold**, *italic*, `code`, links and [n] citations. It builds React elements (no HTML
 * injection) and only renders links to this site or to http(s) URLs.
 */

type Block =
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "h"; text: string };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^\s*#{1,4}\s+(.*)$/.exec(line);
    if (bullet?.[1] !== undefined || numbered?.[1] !== undefined) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      const text = (bullet?.[1] ?? numbered?.[1] ?? "").trim();
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push(text);
    } else if (heading?.[1]) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h", text: heading[1] });
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (list && /^\s{2,}\S/.test(raw)) {
      // continuation of a list item
      list.items[list.items.length - 1] += ` ${line.trim()}`;
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

const INLINE =
  /(\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|`([^`]+)`|\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)|\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\])/g;

function safeHref(href: string): { href: string; internal: boolean } | null {
  if (/^\/(en|ar)(\/|$|#)/.test(href)) return { href, internal: true };
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return { href, internal: false };
  return null;
}

function renderInline(text: string, sources: SourceRef[], keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  // A fresh regex per call: bold text recurses, and a shared lastIndex would break the outer loop.
  const pattern = new RegExp(INLINE.source, "g");
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${i++}`;
    const [whole, , bold, bold2, italic, code, label, href, cites] = match;
    if (bold || bold2) {
      out.push(
        <strong key={key} className="font-semibold text-[#173B6C] dark:text-white">
          {renderInline(bold ?? bold2 ?? "", sources, key)}
        </strong>,
      );
    } else if (italic) {
      out.push(<em key={key}>{italic}</em>);
    } else if (code) {
      out.push(
        <code
          key={key}
          className="rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/[0.08]"
        >
          {code}
        </code>,
      );
    } else if (label && href) {
      const link = safeHref(href);
      if (!link) out.push(label);
      else if (link.internal)
        out.push(
          <Link
            key={key}
            href={link.href}
            className="font-medium text-[#2F6FED] underline decoration-[#2F6FED]/30 underline-offset-2 transition-colors hover:decoration-[#2F6FED] dark:text-indigo-300"
          >
            {label}
          </Link>,
        );
      else
        out.push(
          <a
            key={key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#2F6FED] underline decoration-[#2F6FED]/30 underline-offset-2 hover:decoration-[#2F6FED] dark:text-indigo-300"
          >
            {label}
          </a>,
        );
    } else if (cites) {
      const refs = cites.split(",").map((n) => Number(n.trim()));
      out.push(
        <span key={key} className="ms-0.5 inline-flex gap-0.5 align-super">
          {refs.map((ref) => {
            const source = sources.find((s) => s.ref === ref);
            const chip = (
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#EEF5FF] px-1 text-[10px] leading-none font-bold text-[#2F6FED] ring-1 ring-[#D0E2FF] transition-colors hover:bg-[#2F6FED] hover:text-white dark:bg-indigo-500/15 dark:text-indigo-200 dark:ring-indigo-400/30">
                {ref}
              </span>
            );
            return source?.url ? (
              <Link key={ref} href={source.url} title={source.title} aria-label={source.title}>
                {chip}
              </Link>
            ) : (
              <span key={ref} title={source?.title}>
                {chip}
              </span>
            );
          })}
        </span>,
      );
    } else {
      out.push(whole);
    }
    last = match.index + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text, sources = [] }: { text: string; sources?: SourceRef[] }) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2.5 text-[13.5px] leading-relaxed text-[#334155] dark:text-[#CBD5E1]">
      {blocks.map((block, b) => {
        const key = `b${b}`;
        if (block.type === "p") return <p key={key}>{renderInline(block.text, sources, key)}</p>;
        if (block.type === "h")
          return (
            <p key={key} className="pt-1 font-semibold text-[#173B6C] dark:text-white">
              {renderInline(block.text, sources, key)}
            </p>
          );
        const Tag = block.type === "ul" ? "ul" : "ol";
        return (
          <Tag
            key={key}
            className={block.type === "ul" ? "space-y-1.5" : "list-decimal space-y-1.5 ps-5"}
          >
            {block.items.map((item, i) => (
              <li key={`${key}-${i}`} className={block.type === "ul" ? "flex gap-2" : undefined}>
                {block.type === "ul" ? (
                  <Fragment>
                    <span
                      className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#2F6FED] to-[#8B5CF6]"
                      aria-hidden="true"
                    />
                    <span>{renderInline(item, sources, `${key}-${i}`)}</span>
                  </Fragment>
                ) : (
                  renderInline(item, sources, `${key}-${i}`)
                )}
              </li>
            ))}
          </Tag>
        );
      })}
    </div>
  );
}
