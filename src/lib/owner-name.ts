/** The owner's name exactly as it must be written in each language. */
export const OWNER_NAME = { en: "Anas Al Dahamsheh", ar: "أنس الدهامشة" } as const;

const MARKS = "[\\u064B-\\u0652\\u0640]*";
// "أنس" (any alif, any diacritics) followed by a surname that starts like his: ال + د/ذ/ض/ط, then
// ح/ه/خ, ending in ة/ه. Catches transliterations such as الدحادحة, الدحامشة or الدهامشه, and never
// ordinary words after his name (الذي, الذكاء...).
const ARABIC_NAME = new RegExp(
  `[أاإآ]${MARKS}ن${MARKS}س${MARKS}\\s+ال${MARKS}[دذضط]${MARKS}[حهخ][\\u0621-\\u064A\\u064B-\\u0652\\u0640]*[ةه](?![\\u0621-\\u064A])`,
  "g",
);
// The same misspelt surnames on their own.
const ARABIC_SURNAME = /(?<![ء-ي])ال(?:دحادحة|دحامشة|دحامشه|دهامشه|ضهامشة|دهامسة|دحامسة)(?![ء-ي])/g;

/** Writes the owner's Arabic name correctly wherever a reply varies it. */
export function fixOwnerName(text: string): string {
  if (!/[؀-ۿ]/.test(text)) return text;
  return text
    .replace(ARABIC_NAME, OWNER_NAME.ar)
    .replace(ARABIC_SURNAME, OWNER_NAME.ar.split(" ")[1]!);
}
