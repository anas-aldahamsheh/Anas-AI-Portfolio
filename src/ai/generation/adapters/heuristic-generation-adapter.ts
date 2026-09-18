import { ConversationMode, GenerationInput, ResponseLanguage } from "@/ai/contracts";

export interface HeuristicGenerationResult {
  text: string;
  citedChunkIds: string[];
}

/**
 * Deterministic offline generator that synthesizes a grounded answer from verified context chunks,
 * attaching appropriate citation markers. Used during testing and as a reliable fallback when LLM endpoints fail.
 */
export function generateHeuristicAnswer(input: GenerationInput): HeuristicGenerationResult {
  const language: ResponseLanguage = input.responseLanguage || "en";
  const mode: ConversationMode = input.conversationMode || "general";
  const chunks = input.contextChunks;

  if (!chunks || chunks.length === 0) {
    return {
      text: "",
      citedChunkIds: [],
    };
  }

  // Take top chunks up to 3
  const topChunks = chunks.slice(0, 3);
  const citedChunkIds: string[] = [];

  const sentences: string[] = [];

  if (language === "ar") {
    const intro =
      mode === "technical"
        ? "وفقاً للمواصفات التقنية والمعمارية الموثقة في ملف الأعمال:"
        : mode === "recruiter"
          ? "بناءً على السجلات المهنية والإنجازات الموثقة لأنس:"
          : "استناداً إلى الأدلة الموثقة في ملف أعمال أنس:";
    sentences.push(intro);

    for (const chunk of topChunks) {
      const citeTag = `[cit:${chunk.citationId}]`;
      citedChunkIds.push(chunk.citationId);

      // Clean snippet from chunk content (up to first 200 chars or first sentence)
      const cleanContent = chunk.content
        .replace(/^#+\s*/gm, "")
        .replace(/\n+/g, " ")
        .trim();
      const firstSentence = cleanContent.split(/[.!؟\n]/)[0]?.trim() || cleanContent.slice(0, 150);

      sentences.push(`- ${chunk.title}: ${firstSentence}. ${citeTag}`);
    }
  } else {
    const intro =
      mode === "technical"
        ? "According to verified architectural specifications in the portfolio:"
        : mode === "recruiter"
          ? "Based on Anas's verified professional track record and deliverables:"
          : "Based on verified evidence in Anas's engineering portfolio:";
    sentences.push(intro);

    for (const chunk of topChunks) {
      const citeTag = `[cit:${chunk.citationId}]`;
      citedChunkIds.push(chunk.citationId);

      // Clean snippet from chunk content
      const cleanContent = chunk.content
        .replace(/^#+\s*/gm, "")
        .replace(/\n+/g, " ")
        .trim();
      const firstSentence = cleanContent.split(/[.!\n]/)[0]?.trim() || cleanContent.slice(0, 150);

      sentences.push(`- ${chunk.title}: ${firstSentence}. ${citeTag}`);
    }
  }

  return {
    text: sentences.join("\n"),
    citedChunkIds,
  };
}
