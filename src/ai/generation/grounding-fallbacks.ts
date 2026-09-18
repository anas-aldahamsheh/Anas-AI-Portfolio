import { ConversationMode, GroundedAnswer, ResponseLanguage } from "@/ai/contracts";

export const INSUFFICIENT_EVIDENCE_RESPONSES: Record<ResponseLanguage, string> = {
  en: "The portfolio knowledge base does not contain verified information to answer this inquiry. Please feel free to ask about Anas's documented projects, skills, professional experience, or system architecture.",
  ar: "لا تحتوي قاعدة معارف ملف الأعمال على معلومات موثقة كافية للإجابة على هذا الاستفسار. يسعدني إجابتك عن أي من مشاريع أنس الموثقة، أو مهاراته، أو خبراته المهنية، أو معماريات الأنظمة.",
};

/**
 * Checks whether an answer expresses insufficient verified evidence.
 */
export function isInsufficientEvidenceText(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return (
    lower.includes("does not contain verified information") ||
    lower.includes("does not contain enough verified") ||
    lower.includes("insufficient verified evidence") ||
    lower.includes("no verified information found") ||
    text.includes("لا تحتوي قاعدة معارف") ||
    text.includes("لا تتوفر معلومات موثقة") ||
    text.includes("لا يوجد في ملف الأعمال معلومات موثقة")
  );
}

/**
 * Generates a deterministic GroundedAnswer for queries where context is empty or evidence is insufficient.
 * Prevents unnecessary LLM API costs, reduces latency to <1ms, and guarantees zero hallucination.
 */
export function createInsufficientEvidenceAnswer(
  language: ResponseLanguage = "en",
  conversationMode: ConversationMode = "general",
  modelUsed = "grounding-policy",
): GroundedAnswer {
  const content = INSUFFICIENT_EVIDENCE_RESPONSES[language] || INSUFFICIENT_EVIDENCE_RESPONSES.en;

  return {
    content,
    rawContent: content,
    language,
    conversationMode,
    citations: [],
    hasInsufficientEvidence: true,
    validation: {
      isValid: true,
      citedIds: [],
      validCitedIds: [],
      invalidCitedIds: [],
      missingRequiredCitations: false,
      cleanedText: content,
      citations: [],
      languageConsistent: true,
    },
    telemetry: {
      modelUsed,
      providerType: "deterministic_policy",
      promptTokens: 0,
      completionTokens: Math.ceil(content.length / 4),
      totalTokens: Math.ceil(content.length / 4),
      latencyMs: 0,
      citedSourcesCount: 0,
      hasInsufficientEvidence: true,
      strategy: "insufficient_evidence",
    },
  };
}
