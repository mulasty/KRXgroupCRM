"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CursorMode =
  | "default"
  | "link"
  | "magnetic"
  | "light"
  | "view_project"
  | "zoom";

type InteractionContextValue = {
  cursorOverride: CursorMode | null;
  setCursorOverride: (mode: CursorMode | null) => void;
};

const InteractionContext = createContext<InteractionContextValue | null>(null);

export function InteractionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cursorOverride, setCursorOverrideState] = useState<CursorMode | null>(null);

  const setCursorOverride = useCallback((mode: CursorMode | null) => {
    setCursorOverrideState(mode);
  }, []);

  const value = useMemo(
    () => ({
      cursorOverride,
      setCursorOverride,
    }),
    [cursorOverride, setCursorOverride],
  );

  return <InteractionContext.Provider value={value}>{children}</InteractionContext.Provider>;
}

export function useInteractionProvider() {
  const context = useContext(InteractionContext);

  if (!context) {
    throw new Error("useInteractionProvider must be used within InteractionProvider.");
  }

  return context;
}
