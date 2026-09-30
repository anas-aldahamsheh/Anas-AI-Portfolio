/** Opens the assistant from anywhere (buttons, links, the home ask box) without prop drilling. */
export const OPEN_EVENT = "assistant:open";

export interface OpenAssistantDetail {
  /** Sent immediately as the visitor's message. */
  prompt?: string;
  /** Open as a full-screen conversation instead of the side panel. */
  expand?: boolean;
}

export function openAssistant(detail: OpenAssistantDetail = {}) {
  window.dispatchEvent(new CustomEvent<OpenAssistantDetail>(OPEN_EVENT, { detail }));
}
