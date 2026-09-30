"use client";

import { useSyncExternalStore } from "react";
import type { Locale } from "@/i18n/config";

export interface SourceRef {
  ref: number;
  title: string;
  kind: string;
  url: string | null;
}

export interface Step {
  label: string;
  tool?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "streaming" | "done" | "error";
  steps?: Step[];
  sources?: SourceRef[];
  suggestions?: string[];
  error?: string;
}

interface State {
  conversationId: string | null;
  messages: ChatMessage[];
  busy: boolean;
}

const STORAGE_KEY = "pf_assistant_v1";
const listeners = new Set<() => void>();
let state: State = { conversationId: null, messages: [], busy: false };
let hydrated = false;
let controller: AbortController | null = null;

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Pick<State, "conversationId" | "messages">;
      state = {
        conversationId: saved.conversationId,
        // A stream cut by a reload can't resume; mark it finished rather than spinning forever.
        messages: saved.messages.map((m) =>
          m.status === "streaming" ? { ...m, status: "done" } : m,
        ),
        busy: false,
      };
    }
  } catch {
    // ignore corrupted storage
  }
}

function set(next: Partial<State>) {
  state = { ...state, ...next };
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ conversationId: state.conversationId, messages: state.messages.slice(-40) }),
    );
  } catch {
    // storage full or disabled
  }
  listeners.forEach((listener) => listener());
}

function patchMessage(
  id: string,
  patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>),
) {
  set({
    messages: state.messages.map((m) =>
      m.id === id ? { ...m, ...(typeof patch === "function" ? patch(m) : patch) } : m,
    ),
  });
}

const subscribe = (listener: () => void) => {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const EMPTY: State = { conversationId: null, messages: [], busy: false };

export function useAssistantState(): State {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random()).slice(2);

/** Parses an SSE byte stream into (event, data) pairs, tolerant of arbitrary chunking. */
async function* readEvents(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<{ event: string; data: unknown }> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n?/g, "\n");
    let index = buffer.indexOf("\n\n");
    while (index !== -1) {
      const block = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);
      let event = "message";
      const data: string[] = [];
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
      }
      if (data.length) {
        try {
          yield { event, data: JSON.parse(data.join("\n")) };
        } catch {
          // skip malformed event
        }
      }
      index = buffer.indexOf("\n\n");
    }
  }
}

export interface SendOptions {
  locale: Locale;
  messages: { rateLimited: string; error: string };
}

export async function sendMessage(text: string, options: SendOptions) {
  load();
  const content = text.trim();
  if (!content || state.busy) return;

  const history = state.messages
    .filter((m) => m.status === "done" && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content }));
  const user: ChatMessage = { id: uid(), role: "user", content, status: "done" };
  const reply: ChatMessage = {
    id: uid(),
    role: "assistant",
    content: "",
    status: "streaming",
    steps: [],
  };
  set({ messages: [...state.messages, user, reply], busy: true });

  controller?.abort();
  controller = new AbortController();
  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        locale: options.locale,
        history,
        ...(state.conversationId ? { conversationId: state.conversationId } : {}),
      }),
      signal: controller.signal,
    });
    if (response.status === 429) {
      patchMessage(reply.id, { status: "error", error: options.messages.rateLimited });
      return;
    }
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

    for await (const { event, data } of readEvents(response.body)) {
      const payload = data as Record<string, unknown>;
      switch (event) {
        case "meta":
          if (typeof payload["conversationId"] === "string")
            set({ conversationId: payload["conversationId"] });
          break;
        case "status":
          patchMessage(reply.id, (m) => {
            const label = String(payload["label"] ?? "");
            const steps = m.steps ?? [];
            if (!label || steps[steps.length - 1]?.label === label) return {};
            const tool = typeof payload["tool"] === "string" ? payload["tool"] : undefined;
            return { steps: [...steps, tool ? { label, tool } : { label }] };
          });
          break;
        case "delta":
          patchMessage(reply.id, (m) => ({ content: m.content + String(payload["text"] ?? "") }));
          break;
        case "final":
          patchMessage(reply.id, {
            content: String(payload["text"] ?? ""),
            sources: Array.isArray(payload["sources"]) ? (payload["sources"] as SourceRef[]) : [],
            status: "done",
          });
          break;
        case "suggestions":
          patchMessage(reply.id, { suggestions: (payload["items"] as string[] | undefined) ?? [] });
          break;
        case "error":
          patchMessage(reply.id, {
            status: "error",
            error:
              typeof payload["message"] === "string" ? payload["message"] : options.messages.error,
          });
          break;
      }
    }
    patchMessage(reply.id, (m) =>
      m.status === "streaming"
        ? {
            status: m.content ? "done" : "error",
            ...(m.content ? {} : { error: options.messages.error }),
          }
        : {},
    );
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      patchMessage(reply.id, (m) => ({
        status: m.content ? "done" : "error",
        ...(m.content ? {} : { error: "—" }),
      }));
    } else {
      patchMessage(reply.id, { status: "error", error: options.messages.error });
    }
  } finally {
    set({ busy: false });
  }
}

export function stopStreaming() {
  controller?.abort();
}

export function resetConversation() {
  controller?.abort();
  set({ conversationId: null, messages: [], busy: false });
}

/** Re-asks the question that produced a failed answer. */
export function retryLast(options: SendOptions) {
  const lastUser = [...state.messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return;
  const index = state.messages.lastIndexOf(lastUser);
  set({ messages: state.messages.slice(0, index) });
  void sendMessage(lastUser.content, options);
}
