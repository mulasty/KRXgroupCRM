"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

import { experiments } from "@/lib/projects";
import { content } from "@/lib/site-data";

const PlaygroundCanvas = dynamic(
  () => import("@/three/canvas/playground-canvas").then((mod) => mod.PlaygroundCanvas),
  {
    ssr: false,
  },
);

export function PlaygroundPage() {
  const [playgroundLineA, playgroundLineB] = content.playground.title;

  return (
    <main className="relative min-h-screen overflow-x-clip pb-20 pt-24">
      <PlaygroundCanvas />

      <section className="section-shell relative z-10 grid min-h-[100svh] items-end gap-12 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">{content.playground.eyebrow}</p>
          <h1 className="display-line mt-8 text-white">
            {playgroundLineA}
            <br />
            {playgroundLineB}
          </h1>
        </motion.div>

        <motion.div
          className="glass-card max-w-xl justify-self-end p-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm leading-8 text-white/[0.66]">
            {content.playground.description}
          </p>
        </motion.div>
      </section>

      <section className="section-shell relative z-10 grid gap-6 md:grid-cols-3">
        {experiments.map((experiment, index) => (
          <motion.article
            key={experiment.title}
            className="glass-card min-h-72 rounded-[30px] p-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.85, delay: index * 0.12 }}
          >
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.35]">
              Study 0{index + 1}
            </p>
            <h2 className="mt-10 text-4xl text-white">{experiment.title}</h2>
            <p className="mt-5 text-sm leading-8 text-white/[0.62]">{experiment.caption}</p>
          </motion.article>
        ))}
      </section>
    </main>
  );
}
