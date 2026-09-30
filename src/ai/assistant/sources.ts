/**
 * Per-turn citation registry. Every item a tool returns gets a small numeric `ref`; the model
 * cites with [n], and only refs that were actually handed out can survive into the answer.
 */
export interface SourceRef {
  ref: number;
  title: string;
  kind: string;
  url: string | null;
}

export class SourceRegistry {
  private byKey = new Map<string, SourceRef>();
  private byRef = new Map<number, SourceRef>();
  /** Every link that appeared in a tool result: the only links the answer may contain. */
  readonly links = new Set<string>();

  /** Records all internal paths and http(s) URLs found anywhere in a tool result. */
  collectLinks(value: unknown): void {
    if (typeof value === "string") {
      if (/^(\/(en|ar)(\/|$|#)|https?:\/\/|mailto:)/.test(value)) this.links.add(value);
      return;
    }
    if (Array.isArray(value)) value.forEach((v) => this.collectLinks(v));
    else if (value && typeof value === "object")
      Object.values(value).forEach((v) => this.collectLinks(v));
  }

  register(key: string, source: Omit<SourceRef, "ref">): number {
    const existing = this.byKey.get(key);
    if (existing) return existing.ref;
    const ref = this.byRef.size + 1;
    const entry = { ...source, ref };
    this.byKey.set(key, entry);
    this.byRef.set(ref, entry);
    return ref;
  }

  get(ref: number): SourceRef | undefined {
    return this.byRef.get(ref);
  }

  get size(): number {
    return this.byRef.size;
  }
}

const CITATION = /\s?\[(\d{1,3}(?:\s*,\s*\d{1,3})*)\]/g;
const MARKDOWN_LINK = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/**
 * Removes citations to unknown refs, renumbers the rest 1..n in order of first appearance,
 * and returns the sources in that order.
 */
export function finalizeCitations(
  text: string,
  registry: SourceRegistry,
): { text: string; sources: SourceRef[] } {
  // Unwrap links the model invented; keep the visible text.
  const allowed = (href: string) =>
    registry.links.has(href) || registry.links.has(href.split("#")[0] ?? "");
  text = text.replace(MARKDOWN_LINK, (match: string, label: string, href: string) =>
    allowed(href) ? match : label,
  );
  const order: number[] = [];
  const renumber = new Map<number, number>();
  const cleaned = text.replace(CITATION, (_match, group: string) => {
    const refs = group
      .split(",")
      .map((n) => Number(n.trim()))
      .filter((n) => registry.get(n));
    if (refs.length === 0) return "";
    const mapped = refs.map((ref) => {
      if (!renumber.has(ref)) {
        order.push(ref);
        renumber.set(ref, order.length);
      }
      return renumber.get(ref);
    });
    return ` [${[...new Set(mapped)].join(", ")}]`;
  });
  const sources = order
    .map((ref, i) => {
      const source = registry.get(ref);
      return source ? { ...source, ref: i + 1 } : null;
    })
    .filter((s): s is SourceRef => s !== null);
  return { text: cleaned, sources };
}
