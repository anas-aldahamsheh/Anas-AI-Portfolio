import type { ReactNode } from "react";
import { getMessages } from "@/server/content/ui-text";
import { EditableText } from "@/ui/editable";
import type { Locale } from "./config";
import type { MessageKey } from "./messages";

/**
 * Server-side translator.
 *  - `t(key)`  → plain string (attributes, metadata)
 *  - `tx(key)` → the same text wrapped as inline-editable for the admin overlay
 */
export async function getTranslator(locale: Locale) {
  const messages = await getMessages(locale);
  const t = (key: MessageKey) => messages[key];
  const tx = (key: MessageKey): ReactNode => <EditableText k={key}>{messages[key]}</EditableText>;
  return { t, tx, messages };
}
