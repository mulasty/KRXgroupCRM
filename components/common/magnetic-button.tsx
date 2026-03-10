"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/lib/utils";

type MagneticButtonProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function MagneticButton({
  href,
  children,
  className,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link
        ref={ref}
        href={href}
        data-cursor="magnetic"
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-white/[0.15] bg-white/[0.06] px-6 py-3 text-xs uppercase tracking-[0.34em] text-white transition-colors duration-300 hover:border-white/[0.35] hover:bg-white/[0.1]",
          className,
        )}
        onMouseMove={(event) => {
          const bounds = ref.current?.getBoundingClientRect();

          if (!bounds) {
            return;
          }

          const offsetX = event.clientX - (bounds.left + bounds.width / 2);
          const offsetY = event.clientY - (bounds.top + bounds.height / 2);
          x.set(offsetX * 0.18);
          y.set(offsetY * 0.18);
        }}
        onMouseLeave={reset}
      >
        {children}
      </Link>
    </motion.div>
  );
}
