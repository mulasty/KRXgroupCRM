"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { designer } from "@/lib/projects";
import { siteData } from "@/lib/site-data";

export function Header() {
  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="section-shell flex items-start justify-between py-6 text-[11px] uppercase tracking-[0.34em] text-white/70">
        <Link
          href="/"
          className="pointer-events-auto inline-flex flex-col gap-2 text-left"
          data-cursor="link"
        >
          <span>{designer.name}</span>
          <span className="text-white/[0.35]">{designer.location}</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-6">
          {siteData.navigation.map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.href}
                href={item.href}
                data-cursor="link"
                className="transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                data-cursor="link"
                className="transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ),
          )}
        </div>
      </div>
    </motion.header>
  );
}
