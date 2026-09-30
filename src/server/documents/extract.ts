import { generateContent, responseText } from "@/ai/gemini/client";
import { getAiSettings } from "@/ai/settings";

const INSTRUCTION = `Transcribe this document into clean Markdown so it can be searched and quoted.
Rules:
- Keep EVERY fact exactly as written: names, job titles, companies, dates, numbers, links, emails, skills, grades.
- Keep the original language(s); do not translate or summarise.
- Use "## " headings for the document's sections (e.g. Experience, Education, Projects, Skills) and "- " bullets for lists.
- For each job or project, keep its title, organisation, dates and bullet points together under one heading.
- Output only the Markdown, with no commentary.`;

/**
 * Turns an uploaded file into searchable text. Plain text is decoded directly; PDFs and images
 * are read by Gemini's document understanding (handles Arabic, tables and scanned pages).
 */
export async function extractText(bytes: Buffer, mimeType: string): Promise<string> {
  if (mimeType.startsWith("text/")) return bytes.toString("utf8").replace(/\r\n?/g, "\n").trim();

  const settings = await getAiSettings();
  const { response } = await generateContent({
    // Accuracy matters more than speed here: prefer the agent models over the lite ones.
    models: [...settings.agentModels, ...settings.fastModels],
    thinking: "low",
    retries: 1,
    timeoutMs: 120_000,
    request: {
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: bytes.toString("base64") } },
            { text: INSTRUCTION },
          ],
        },
      ],
      generationConfig: { temperature: 0, maxOutputTokens: 16_384 },
    },
  });
  const text = responseText(response).trim();
  return text
    .replace(/^```(?:markdown)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
}
