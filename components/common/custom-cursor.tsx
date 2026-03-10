"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import { useInteractionProvider, type CursorMode } from "@/components/providers/interaction-provider";

export function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [supportsHover, setSupportsHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const { cursorOverride } = useInteractionProvider();
  const x = useSpring(0, { stiffness: 500, damping: 38, mass: 0.55 });
  const y = useSpring(0, { stiffness: 500, damping: 38, mass: 0.55 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateSupport = (event: MediaQueryListEvent) => setSupportsHover(event.matches);
    media.addEventListener("change", updateSupport);

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      setMode((target?.dataset.cursor as CursorMode | undefined) ?? "default");
    };

    const handleLeave = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerleave", handleLeave);

    return () => {
      media.removeEventListener("change", updateSupport);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerleave", handleLeave);
    };
  }, [x, y]);

  if (!supportsHover) {
    return null;
  }

  const resolvedMode = cursorOverride ?? mode;

  const sizeByMode = {
    default: 14,
    link: 54,
    magnetic: 72,
    light: 120,
    view_project: 96,
    zoom: 112,
  }[resolvedMode];

  const labelByMode = {
    default: "",
    link: "",
    magnetic: "",
    light: "",
    view_project: "VIEW",
    zoom: "OPEN",
  }[resolvedMode];

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80]"
      style={{ x, y }}
      animate={{
        opacity: visible ? 1 : 0,
        width: sizeByMode,
        height: sizeByMode,
        marginLeft: -sizeByMode / 2,
        marginTop: -sizeByMode / 2,
      }}
      transition={{ type: "spring", stiffness: 380, damping: 28, mass: 0.5 }}
    >
      <motion.div
        className="relative flex h-full w-full items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md"
        animate={{
          scale:
            resolvedMode === "default"
              ? 1
              : resolvedMode === "light"
                ? 1.06
                : resolvedMode === "view_project"
                  ? 1.12
                  : 1.18,
          borderColor:
            resolvedMode === "light" || resolvedMode === "view_project"
              ? "rgba(140,200,255,0.42)"
              : "rgba(255,255,255,0.25)",
          boxShadow:
            resolvedMode === "light" || resolvedMode === "zoom"
              ? "0 0 110px rgba(140, 200, 255, 0.35)"
              : resolvedMode === "view_project"
                ? "0 0 72px rgba(255, 255, 255, 0.16)"
              : "0 0 30px rgba(255, 255, 255, 0.08)",
          backgroundColor:
            resolvedMode === "light"
              ? "rgba(140, 200, 255, 0.12)"
              : resolvedMode === "view_project"
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.08)",
        }}
      >
        {labelByMode ? (
          <span className="text-[10px] uppercase tracking-[0.34em] text-white/80">
            {labelByMode}
          </span>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
