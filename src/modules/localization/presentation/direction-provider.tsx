"use client";

import React, { createContext, useContext, useEffect } from "react";

interface DirectionContextValue {
  dir: "rtl" | "ltr";
  isRTL: boolean;
  isLTR: boolean;
}

const DirectionContext = createContext<DirectionContextValue>({
  dir: "rtl",
  isRTL: true,
  isLTR: false,
});

interface DirectionProviderProps {
  children: React.ReactNode;
  dir: "rtl" | "ltr";
}

export function DirectionProvider({ children, dir }: DirectionProviderProps) {
  useEffect(() => {
    // Keep document element direction synced
    if (typeof document !== "undefined") {
      document.documentElement.dir = dir;
    }
  }, [dir]);

  const value: DirectionContextValue = {
    dir,
    isRTL: dir === "rtl",
    isLTR: dir === "ltr",
  };

  return (
    <DirectionContext.Provider value={value}>
      <div dir={dir} className="contents">
        {children}
      </div>
    </DirectionContext.Provider>
  );
}

export function useDirection(): DirectionContextValue {
  return useContext(DirectionContext);
}
