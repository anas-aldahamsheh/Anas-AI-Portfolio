import { generateContent, responseText } from "@/ai/gemini/client";
import { getAiSettings } from "@/ai/settings";
import type { Locale } from "@/i18n/config";

type Value = string | string[];

/**
 * Translates a set of fields between English and Arabic for the admin ("fill the other
 * language"). Technology names, product names, numbers and URLs are kept as-is.
 */
export async function translateFields(
  fields: Record<string, Value>,
  from: Locale,
  to: Locale,
): Promise<Record<string, Value>> {
  const entries = Object.entries(fields).filter(([, v]) =>
    Array.isArray(v) ? v.some((x) => x.trim()) : v.trim(),
  );
  if (entries.length === 0) return {};
  const settings = await getAiSettings();
  const target =
    to === "ar"
      ? "Arabic (clear Modern Standard Arabic suitable for a professional portfolio)"
      : "English (professional, concise)";
  const { response } = await generateContent({
    models: [...settings.fastModels, ...settings.agentModels],
    thinking: "minimal",
    timeoutMs: 45_000,
    request: {
      systemInstruction: {
        parts: [
          {
            text:
              `Translate the JSON values from ${from === "ar" ? "Arabic" : "English"} to ${target}. ` +
              "Keep technology, library, product and company names, numbers, dates, emails and URLs unchanged. " +
              "Keep list items as lists with the same number of items. Return JSON with exactly the same keys.",
          },
        ],
      },
      contents: [{ role: "user", parts: [{ text: JSON.stringify(Object.fromEntries(entries)) }] }],
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
    },
  });
  const parsed = JSON.parse(responseText(response)) as Record<string, unknown>;
  const out: Record<string, Value> = {};
  for (const [key, original] of entries) {
    const value = parsed[key];
    if (Array.isArray(original) && Array.isArray(value)) out[key] = value.map(String);
    else if (typeof value === "string") out[key] = value;
  }
  return out;
}
