"use client";

import { useState, useRef, useEffect } from "react";
import { useLocalization } from "@/modules/localization/presentation/localization-provider";
import {
  ConversationMode,
  ScriptDirection,
  CitationMapping,
  RagDebugTelemetry,
} from "@/ai/contracts";
import { ChatMessage, ChatMessageItem } from "./chat-message";

export interface ChatDrawerProps {
  initialOpen?: boolean;
  projectScopeId?: string;
  projectScopeTitle?: string;
}

let messageCounter = 0;
function createMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

interface StreamEventCallbacks {
  onMeta: (direction: ScriptDirection) => void;
  onToken: (accumulated: string) => void;
  onCitations: (citations: CitationMapping[]) => void;
  onDone: (
    answer: string,
    citations: CitationMapping[],
    telemetry?: RagDebugTelemetry | undefined,
  ) => void;
}

async function readChatEventStream(
  stream: ReadableStream<Uint8Array>,
  callbacks: StreamEventCallbacks,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      if (line.startsWith("event: meta")) {
        const next = lines[i + 1];
        if (next?.startsWith("data: ")) {
          try {
            const meta = JSON.parse(next.slice(6));
            if (meta.direction) callbacks.onMeta(meta.direction);
          } catch {
            // ignore JSON parse error
          }
        }
      } else if (line.startsWith("event: token")) {
        const next = lines[i + 1];
        if (next?.startsWith("data: ")) {
          try {
            const tokenData = JSON.parse(next.slice(6));
            text += tokenData.token;
            callbacks.onToken(text);
          } catch {
            // ignore JSON parse error
          }
        }
      } else if (line.startsWith("event: citations")) {
        const next = lines[i + 1];
        if (next?.startsWith("data: ")) {
          try {
            const citeData = JSON.parse(next.slice(6));
            if (Array.isArray(citeData.citations)) {
              callbacks.onCitations(citeData.citations);
            }
          } catch {
            // ignore JSON parse error
          }
        }
      } else if (line.startsWith("event: done")) {
        const next = lines[i + 1];
        if (next?.startsWith("data: ")) {
          try {
            const doneData = JSON.parse(next.slice(6));
            callbacks.onDone(doneData.answer || text, doneData.citations || [], doneData.telemetry);
          } catch {
            // ignore JSON parse error
          }
        }
      }
    }
  }
}

export function ChatDrawer({
  initialOpen = false,
  projectScopeId,
  projectScopeTitle,
}: ChatDrawerProps) {
  const { t, locale, dir } = useLocalization();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [mode, setMode] = useState<ConversationMode>("general");
  const [activeScopeId, setActiveScopeId] = useState<string | undefined>(projectScopeId);
  const [activeScopeTitle, setActiveScopeTitle] = useState<string | undefined>(projectScopeTitle);
  const [availableModes, setAvailableModes] = useState<
    Array<{ slug: ConversationMode; name: string; description: string }>
  >([
    { slug: "general", name: "chat.mode.general", description: "" },
    { slug: "recruiter", name: "chat.mode.recruiter", description: "" },
    { slug: "technical", name: "chat.mode.technical", description: "" },
  ]);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadModes() {
      try {
        const res = await fetch(`/api/chat/modes?locale=${locale}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAvailableModes(
              json.data.map((m: { slug: ConversationMode; name: string; description: string }) => ({
                slug: m.slug,
                name: m.name,
                description: m.description,
              })),
            );
          }
        }
      } catch {
        // Retain baseline modes gracefully
      }
    }
    void loadModes();
    return () => {
      isCancelled = true;
    };
  }, [locale]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Adjust state when prop changes without effect
  const [prevProjectScopeId, setPrevProjectScopeId] = useState(projectScopeId);
  if (projectScopeId !== prevProjectScopeId) {
    setPrevProjectScopeId(projectScopeId);
    setActiveScopeId(projectScopeId);
    setActiveScopeTitle(projectScopeTitle);
  }

  // Listen to open-project-chat and open-chat events dispatched across the app
  useEffect(() => {
    function handleOpenProjectChat(e: Event) {
      const customEvent = e as CustomEvent<{
        projectId?: string;
        projectTitle?: string;
        prompt?: string;
      }>;
      const detail = customEvent.detail;
      if (detail) {
        if (detail.projectId) {
          setActiveScopeId(detail.projectId);
          setActiveScopeTitle(detail.projectTitle || detail.projectId);
        }
        setIsOpen(true);
        if (detail.prompt) {
          setInputVal(detail.prompt);
        }
      }
    }

    function handleOpenChat(e: Event) {
      const customEvent = e as CustomEvent<{
        projectId?: string;
        projectTitle?: string;
        prompt?: string;
        mode?: ConversationMode;
      }>;
      const detail = customEvent.detail;
      if (detail) {
        if (detail.projectId) {
          setActiveScopeId(detail.projectId);
          setActiveScopeTitle(detail.projectTitle || detail.projectId);
        }
        if (detail.prompt) {
          setInputVal(detail.prompt);
        }
        if (detail.mode) {
          setMode(detail.mode);
        }
      }
      setIsOpen(true);
    }

    window.addEventListener("open-project-chat", handleOpenProjectChat);
    window.addEventListener("open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("open-project-chat", handleOpenProjectChat);
      window.removeEventListener("open-chat", handleOpenChat);
    };
  }, []);

  // Listen to URL search params on mount (?chat=open, ?chat=1, ?prompt=..., ?project=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const shouldOpen =
        params.get("chat") === "open" ||
        params.get("chat") === "1" ||
        params.get("openChat") === "true";
      const projSlug = params.get("project");
      const projId = params.get("projectId");
      const prompt = params.get("prompt");

      if (shouldOpen || projSlug || projId || prompt) {
        if (projId || projSlug) {
          setActiveScopeId(projId || projSlug || undefined);
          setActiveScopeTitle(projSlug || projId || undefined);
        }
        if (prompt) {
          setInputVal(prompt);
        }
        setIsOpen(true);

        if (shouldOpen) {
          params.delete("chat");
          params.delete("openChat");
          const remaining = params.toString();
          const cleanUrl = `${window.location.pathname}${remaining ? `?${remaining}` : ""}${window.location.hash}`;
          window.history.replaceState({}, "", cleanUrl);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputVal).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputVal("");

    const userMessageId = createMessageId("msg-user");
    const userMsg: ChatMessageItem = {
      id: userMessageId,
      role: "user",
      content: text,
      direction: /[\u0600-\u06FF]/.test(text) ? "rtl" : "ltr",
    };

    const assistantMessageId = createMessageId("msg-assistant");
    const assistantPlaceholder: ChatMessageItem = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      direction: dir as ScriptDirection,
      isStreaming: true,
      citations: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantPlaceholder]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          mode,
          conversationLocale: locale,
          projectScopeId: activeScopeId,
          projectScopeTitle: activeScopeTitle,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      // Check if response is SSE stream
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && response.body) {
        let finalCitations: CitationMapping[] = [];
        let finalDirection: ScriptDirection = (dir as ScriptDirection) || "ltr";

        await readChatEventStream(response.body, {
          onMeta: (resolvedDir) => {
            finalDirection = resolvedDir;
          },
          onToken: (accumulated) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: accumulated,
                      direction: finalDirection,
                      isStreaming: true,
                    }
                  : m,
              ),
            );
          },
          onCitations: (citations) => {
            finalCitations = citations;
          },
          onDone: (answer, citations, telemetry) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: answer,
                      citations: citations.length > 0 ? citations : finalCitations,
                      direction: finalDirection,
                      telemetry,
                      isStreaming: false,
                    }
                  : m,
              ),
            );
          },
        });
      } else {
        // Handle non-streaming JSON response
        const data = await response.json();
        if (data.result) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: data.result.answer,
                    citations: data.result.citations || [],
                    direction: data.result.direction,
                    telemetry: data.result.telemetry,
                    isStreaming: false,
                  }
                : m,
            ),
          );
        }
      }
    } catch {
      setErrorMessage(t("chat.error.general"));
      // Remove failed assistant message placeholder
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const suggestedPrompts = activeScopeId
    ? [
        t("chat.scope.prompt.architecture"),
        t("chat.scope.prompt.performance"),
        t("chat.scope.prompt.data_flow"),
      ]
    : [t("chat.suggested.skills"), t("chat.suggested.projects"), t("chat.suggested.experience")];

  return (
    <>
      {/* Floating Trigger Button - Exactly matching Image 2 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed end-6 bottom-6 z-40 flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold text-white bg-neutral-950 dark:bg-neutral-900 border border-neutral-800 dark:border-neutral-700/80 shadow-2xl shadow-black/40 hover:bg-neutral-900 dark:hover:bg-neutral-800 hover:border-neutral-600 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-400 ${
          isOpen ? "hidden" : "flex"
        }`}
        aria-label={t("chat.trigger.aria")}
        data-testid="chat-trigger-button"
      >
        <svg
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth={2.6} />
        </svg>
        <span className="tracking-tight">{t("chat.trigger.label")}</span>
      </button>

      {/* Slide-over Drawer / Dialog */}
      {isOpen && (
        <div
          className="bg-background/50 animate-in fade-in fixed inset-0 z-50 flex justify-end backdrop-blur-sm duration-200"
          data-testid="chat-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("chat.title")}
            className="bg-card border-border animate-in slide-in-from-right flex h-full w-full flex-col border-s shadow-2xl duration-300 sm:w-[460px]"
            data-testid="chat-drawer-container"
          >
            {/* Header */}
            <div className="border-border bg-muted/30 flex flex-col gap-2 border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">{t("chat.title")}</h3>
                    {activeScopeTitle && (
                      <p className="text-primary max-w-[200px] truncate text-[11px] font-medium">
                        {activeScopeTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearChat}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted rounded px-2 py-1 text-xs transition-colors"
                      title={t("chat.clear")}
                    >
                      {t("chat.clear")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition-colors"
                    aria-label={t("chat.close")}
                    data-testid="chat-close-button"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Active Project Scope Badge */}
              {activeScopeId && (
                <div
                  className="bg-primary/10 border-primary/25 flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs"
                  data-testid="chat-scope-badge-container"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="bg-primary text-primary-foreground flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold">
                      P
                    </span>
                    <span className="text-foreground truncate font-semibold">
                      {activeScopeTitle || activeScopeId}
                    </span>
                    <span className="text-muted-foreground hidden text-[10px] sm:inline">
                      • {t("chat.scope.badge")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScopeId(undefined);
                      setActiveScopeTitle(undefined);
                    }}
                    className="text-muted-foreground hover:text-foreground shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    data-testid="exit-scope-button"
                    title={t("chat.scope.exit")}
                  >
                    ✕ {t("chat.scope.exit")}
                  </button>
                </div>
              )}

              {/* Mode Selector Tabs */}
              <div
                className="bg-muted/60 flex items-center gap-1 rounded-lg p-1 text-xs"
                data-testid="chat-mode-selector"
              >
                {availableModes.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => setMode(m.slug)}
                    title={m.description || undefined}
                    className={`flex-1 rounded-md py-1 font-medium transition-all ${
                      mode === m.slug
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`mode-tab-${m.slug}`}
                  >
                    {m.name.startsWith("chat.") ? t(m.name) : m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Thread Container */}
            <div
              className="flex-1 space-y-2 overflow-y-auto p-4"
              data-testid="chat-messages-container"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                  <div className="bg-primary/10 text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-foreground mb-1 text-sm font-semibold">
                    {t("chat.empty.title")}
                  </h4>
                  <p className="text-muted-foreground mb-6 max-w-xs text-xs leading-relaxed">
                    {t("chat.empty.subtitle")}
                  </p>

                  <div className="w-full space-y-2">
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-foreground bg-muted/40 hover:bg-muted border-border/50 w-full rounded-xl border p-2.5 text-start text-xs transition-all duration-150"
                        data-testid={`suggested-prompt-${idx}`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}

              {errorMessage && (
                <div className="text-destructive bg-destructive/10 border-destructive/20 my-2 flex items-center justify-between rounded-xl border p-3 text-xs">
                  <span>{errorMessage}</span>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="hover:text-destructive/80 ms-2 font-semibold underline"
                  >
                    {t("chat.retry")}
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="border-border bg-card border-t p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative"
              >
                <textarea
                  ref={inputRef}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={t("chat.placeholder")}
                  className="bg-muted/50 border-border focus:ring-primary/40 text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border p-2.5 pe-12 text-sm focus:ring-2 focus:outline-none"
                  disabled={isLoading}
                  data-testid="chat-input"
                />

                <button
                  type="submit"
                  disabled={!inputVal.trim() || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 absolute end-2.5 bottom-2.5 rounded-lg p-2 transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={t("chat.send")}
                  data-testid="chat-send-button"
                >
                  <svg
                    className="h-4 w-4 rtl:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </form>

              <p className="text-muted-foreground mt-2 line-clamp-1 text-center text-[10px]">
                {t("chat.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
