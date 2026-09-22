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
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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

    // Abort previous pending stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

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
        signal: controller.signal,
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
    } catch (err: unknown) {
      // If user started a new chat or cancelled, quietly exit without showing error
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setErrorMessage(t("chat.error.general"));
      // Remove failed assistant message placeholder
      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Robust New Chat handler: aborts in-flight generation, cleans state, and refocuses input
  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setInputVal("");
    setErrorMessage(null);
    setIsLoading(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
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
      {/* Floating Trigger Button - Circular Icon-Only matching approved references */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed end-6 bottom-6 z-40 flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-[0_4px_20px_rgba(47,111,237,0.35)] hover:shadow-[0_6px_25px_rgba(47,111,237,0.45)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2] dark:shadow-[0_0_25px_rgba(79,70,229,0.5)] ${
          isOpen ? "hidden" : "flex"
        }`}
        aria-label={t("chat.trigger.aria")}
        data-testid="chat-trigger-button"
      >
        <svg
          className="h-6 w-6"
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
        <span className="sr-only">{t("chat.trigger.label")}</span>
      </button>

      {/* Slide-over Drawer / Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          data-testid="chat-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("chat.title")}
            className="relative flex h-full w-full flex-col overflow-hidden border-s border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-2xl duration-300 sm:w-[460px] dark:border-white/10 dark:bg-[#07101F]/95 animate-in slide-in-from-right"
            data-testid="chat-drawer-container"
          >
            {/* Ambient Aurora Accents */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-[#4F46E5]/15 to-[#0891B2]/15 blur-3xl" />
            <div className="pointer-events-none absolute top-1/2 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-[#2F6FED]/10 to-transparent blur-3xl" />

            {/* Header */}
            <div className="relative z-10 flex flex-col gap-3 border-b border-slate-200/80 bg-white/70 px-4 py-3.5 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#173B6C]/10 via-[#2F6FED]/15 to-[#0891B2]/10 text-[#173B6C] ring-1 ring-[#173B6C]/15 shadow-xs dark:from-[#4F46E5]/20 dark:to-[#0891B2]/20 dark:text-[#67E8F9] dark:ring-white/10">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-space-grotesk text-sm font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                      {t("chat.title")}
                    </h3>
                    {activeScopeTitle && (
                      <p className="font-manrope max-w-[200px] truncate text-[11px] font-medium text-[#2F6FED] dark:text-[#67E8F9]">
                        {activeScopeTitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white/80 px-2.5 py-1.5 font-manrope text-xs font-semibold text-[#173B6C] shadow-2xs transition-all duration-150 hover:border-[#2F6FED]/60 hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-indigo-50/50 hover:text-[#2F6FED] hover:shadow-xs active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-[#67E8F9] dark:hover:border-cyan-400/50 dark:hover:bg-white/[0.08] dark:hover:text-white cursor-pointer"
                    title={t("chat.clear")}
                    aria-label={t("chat.clear")}
                    data-testid="chat-new-button"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-[#2F6FED] dark:text-[#67E8F9]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>{t("chat.clear")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
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
                  className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 to-blue-50/80 px-3 py-1.5 text-xs text-indigo-950 shadow-xs dark:border-indigo-500/30 dark:from-indigo-950/40 dark:to-blue-950/40 dark:text-indigo-200"
                  data-testid="chat-scope-badge-container"
                >
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#173B6C] text-[10px] font-bold text-white dark:bg-indigo-500">
                      P
                    </span>
                    <span className="truncate font-semibold font-manrope">
                      {activeScopeTitle || activeScopeId}
                    </span>
                    <span className="hidden text-[10px] text-indigo-700/80 dark:text-indigo-300 sm:inline">
                      • {t("chat.scope.badge")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScopeId(undefined);
                      setActiveScopeTitle(undefined);
                    }}
                    className="cursor-pointer shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition-colors hover:bg-indigo-100 hover:text-indigo-900 dark:hover:bg-indigo-900/50 dark:hover:text-white"
                    data-testid="exit-scope-button"
                    title={t("chat.scope.exit")}
                  >
                    ✕ {t("chat.scope.exit")}
                  </button>
                </div>
              )}

              {/* Mode Selector Tabs */}
              <div
                className="flex items-center gap-1 rounded-xl border border-slate-200/70 bg-slate-100/90 p-1 text-xs dark:border-white/[0.08] dark:bg-white/[0.04]"
                data-testid="chat-mode-selector"
              >
                {availableModes.map((m) => (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => setMode(m.slug)}
                    title={m.description || undefined}
                    className={`flex-1 rounded-lg py-1.5 font-manrope text-xs transition-all duration-200 cursor-pointer ${
                      mode === m.slug
                        ? "bg-card text-[#173B6C] dark:text-white font-bold shadow-xs ring-1 ring-black/5 dark:ring-white/10"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium"
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
              className="relative z-10 flex-1 space-y-2 overflow-y-auto p-4"
              data-testid="chat-messages-container"
            >
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                  <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#173B6C]/10 via-[#2F6FED]/15 to-[#0891B2]/15 text-[#173B6C] ring-1 ring-[#173B6C]/20 shadow-md shadow-indigo-500/10 dark:from-[#4F46E5]/25 dark:to-[#0891B2]/25 dark:text-[#67E8F9] dark:ring-white/15">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-2 font-space-grotesk text-base sm:text-lg font-bold tracking-tight text-[#173B6C] dark:text-[#F4F7FF]">
                    {t("chat.empty.title")}
                  </h4>
                  <p className="mb-6 max-w-xs font-manrope text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {t("chat.empty.subtitle")}
                  </p>

                  <div className="w-full space-y-2.5">
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white/85 p-3 text-start font-manrope text-xs font-medium text-slate-700 shadow-xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2F6FED]/60 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-indigo-50/40 hover:text-[#173B6C] hover:shadow-md hover:shadow-blue-500/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.07] dark:hover:text-white dark:hover:shadow-cyan-500/5 cursor-pointer"
                        data-testid={`suggested-prompt-${idx}`}
                      >
                        <span className="leading-snug">{prompt}</span>
                        <svg
                          className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#2F6FED] rtl:rotate-180 rtl:group-hover:-translate-x-1 dark:group-hover:text-cyan-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {messages.length > 0 && !isLoading && (
                    <div className="flex justify-center pt-3 pb-1">
                      <button
                        type="button"
                        onClick={handleNewChat}
                        className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-1.5 font-manrope text-xs font-medium text-slate-500 shadow-2xs transition-all hover:border-[#2F6FED]/50 hover:bg-white hover:text-[#173B6C] hover:shadow-xs active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-cyan-400/50 dark:hover:bg-white/[0.08] dark:hover:text-white cursor-pointer"
                        data-testid="chat-new-inline-button"
                      >
                        <svg className="h-3.5 w-3.5 text-[#2F6FED] dark:text-[#67E8F9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{t("chat.clear")}</span>
                      </button>
                    </div>
                  )}
                </>
              )}

              {errorMessage && (
                <div className="my-2 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 font-manrope">
                  <span>{errorMessage}</span>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="ms-2 font-semibold underline hover:text-rose-900 dark:hover:text-white cursor-pointer"
                  >
                    {t("chat.retry")}
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="relative z-10 border-t border-slate-200/80 bg-white/90 p-3.5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#07101F]/90">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative"
              >
                <div className="relative rounded-2xl border border-slate-200/90 bg-slate-50/80 shadow-inner transition-all duration-200 focus-within:border-[#2F6FED] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2F6FED]/20 dark:border-white/10 dark:bg-white/[0.03] dark:focus-within:border-cyan-400/60 dark:focus-within:bg-[#0A1326] dark:focus-within:ring-cyan-500/20">
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
                    className="w-full resize-none bg-transparent p-3 pe-12 font-manrope text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
                    disabled={isLoading}
                    data-testid="chat-input"
                  />

                  <button
                    type="submit"
                    disabled={!inputVal.trim() || isLoading}
                    className="absolute end-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#173B6C] via-[#2F6FED] to-[#0891B2] text-white shadow-md shadow-blue-500/25 transition-all duration-150 hover:opacity-95 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed dark:from-[#4F46E5] dark:via-[#6366F1] dark:to-[#0891B2]"
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
                        strokeWidth={2.2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-center font-manrope text-[11px] text-slate-400 dark:text-slate-500">
                <svg className="h-3 w-3 shrink-0 text-[#2F6FED]/70 dark:text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="line-clamp-1">{t("chat.disclaimer")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
