/**
 * Writing direction of a piece of chat text, decided by its letters rather than by the page:
 * an Arabic answer on the English site reads right to left, and an English one on the Arabic
 * site left to right. Mixed text follows whichever script has more letters; text without
 * letters (numbers, links) keeps the fallback.
 */
export type Dir = "rtl" | "ltr";

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/g;
const LATIN = /[A-Za-zÀ-ɏ]/g;

export function textDir(text: string, fallback: Dir): Dir {
  const arabic = text.match(ARABIC)?.length ?? 0;
  const latin = text.match(LATIN)?.length ?? 0;
  if (!arabic && !latin) return fallback;
  return arabic >= latin * 0.5 && arabic > 0 ? "rtl" : "ltr";
}
