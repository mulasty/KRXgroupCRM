"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 24, filter: "blur(18px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.985, filter: "blur(24px)" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70]"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.08 }}
          exit={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.95, ease: [0.83, 0, 0.17, 1] }}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.16), rgba(140,200,255,0.12) 24%, rgba(7,9,13,0.98) 68%)",
          }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
