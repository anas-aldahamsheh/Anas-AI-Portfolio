import { generateContent, responseText } from "@/ai/gemini/client";
import { getAiSettings } from "@/ai/settings";
import { arabicRatio } from "@/ai/knowledge/normalize";

/** Three short follow-up questions a recruiter would plausibly ask next, in the visitor's language. */
export async function suggestFollowUps(
  question: string,
  answer: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const settings = await getAiSettings();
  const arabic = arabicRatio(question) > 0.4;
  try {
    const timeout = AbortSignal.timeout(5000);
    const { response } = await generateContent({
      models: settings.fastModels,
      thinking: "minimal",
      retries: 0,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      request: {
        systemInstruction: {
          parts: [
            {
              text:
                "Suggest exactly 3 short follow-up questions (max 9 words each) that a recruiter reading this exchange " +
                "about a candidate's portfolio would ask next. They must be answerable from a portfolio (projects, " +
                "experience, skills, education, contact). Do not repeat the question. " +
                (arabic ? "Write them in Arabic." : "Write them in English."),
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Visitor asked: ${question.slice(0, 800)}\n\nAssistant answered: ${answer.slice(0, 2000)}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: { questions: { type: "array", items: { type: "string" }, maxItems: 3 } },
            required: ["questions"],
          },
        },
      },
    });
    const parsed = JSON.parse(responseText(response)) as { questions?: unknown };
    return Array.isArray(parsed.questions)
      ? parsed.questions
          .filter((q): q is string => typeof q === "string" && q.trim().length > 3)
          .map((q) => q.trim().slice(0, 120))
          .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}
