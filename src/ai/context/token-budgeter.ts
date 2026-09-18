/**
 * Multilingual token count estimator for English and Arabic text.
 */
export function estimateTokenCount(text: string, locale?: "ar" | "en"): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const isArabic = locale === "ar" || /[\u0600-\u06FF]/.test(trimmed);

  if (isArabic) {
    // Arabic tokens average ~1.3 tokens per word or ~3.2 characters per token
    const byWords = Math.ceil(words * 1.3);
    const byChars = Math.ceil(trimmed.length / 3.2);
    return Math.max(1, Math.round((byWords + byChars) / 2));
  }

  // English/Latin tokens average ~1.25 tokens per word or ~4.0 characters per token
  const byWords = Math.ceil(words * 1.25);
  const byChars = Math.ceil(trimmed.length / 4.0);
  return Math.max(1, Math.round((byWords + byChars) / 2));
}

/**
 * Token budget manager enforcing strict caps while packing context.
 */
export class TokenBudgeter {
  private currentTokens: number = 0;
  public readonly maxTokens: number;

  constructor(maxTokens: number = 3000) {
    this.maxTokens = maxTokens;
  }

  public get tokensUsed(): number {
    return this.currentTokens;
  }

  public get remainingTokens(): number {
    return Math.max(0, this.maxTokens - this.currentTokens);
  }

  /**
   * Tests whether adding tokens would fit within the remaining budget.
   */
  public canFit(tokens: number): boolean {
    return this.currentTokens + tokens <= this.maxTokens;
  }

  /**
   * Allocates tokens to the budget.
   * Returns true if allocation was successful, or false if budget would be exceeded.
   */
  public allocate(tokens: number): boolean {
    if (!this.canFit(tokens)) {
      return false;
    }
    this.currentTokens += tokens;
    return true;
  }
}
