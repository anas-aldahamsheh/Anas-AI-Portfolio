"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type AnnouncePriority = "polite" | "assertive";

interface AnnouncerContextType {
  announce: (message: string, priority?: AnnouncePriority) => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | null>(null);

export interface AnnouncerProviderProps {
  children: React.ReactNode;
}

export function AnnouncerProvider({ children }: AnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState("");
  const [assertiveMessage, setAssertiveMessage] = useState("");

  const announce = useCallback((message: string, priority: AnnouncePriority = "polite") => {
    if (priority === "assertive") {
      setAssertiveMessage("");
      // Force screen reader trigger on repeated messages
      setTimeout(() => setAssertiveMessage(message), 50);
    } else {
      setPoliteMessage("");
      setTimeout(() => setPoliteMessage(message), 50);
    }
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      {/* Accessible live regions */}
      <div
        id="sr-announcer-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        id="sr-announcer-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AnnouncerContext.Provider>
  );
}

export function useAnnouncer(): AnnouncerContextType {
  const context = useContext(AnnouncerContext);
  if (!context) {
    // Graceful fallback for components rendered outside provider
    return {
      announce: () => {},
    };
  }
  return context;
}
