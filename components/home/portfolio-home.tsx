"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";

import { MagneticButton } from "@/components/common/magnetic-button";
import { designer, projects } from "@/lib/projects";

const PortfolioCanvas = dynamic(
  () => import("@/three/canvas/portfolio-canvas").then((mod) => mod.PortfolioCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(140,200,255,0.12),transparent_34%),#07090d]" />
    ),
  },
);

export function PortfolioHome() {
  return (
    <main id="portfolio-scroll" className="relative overflow-x-clip">
      <PortfolioCanvas />

      <section className="section-shell relative z-10 flex min-h-[170svh] flex-col justify-between pb-20 pt-28 md:pt-32">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl"
          >
            <span className="eyebrow">Immersive portfolio</span>
            <h1 className="display-line mt-8 text-white">
              Visual identities
              <br />
              staged as <span className="gradient-stroke">digital matter</span>.
            </h1>
            <p className="body-copy mt-8 max-w-2xl text-base leading-8 text-white/[0.72] sm:text-lg">
              {designer.title} The work unfolds across WebGL environments, editorial
              layouts, and mockups that materialize through particle-based assembly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card max-w-lg justify-self-end p-8"
          >
            <p className="text-sm uppercase tracking-[0.32em] text-white/[0.42]">Profile</p>
            <p className="mt-6 text-2xl font-display leading-tight text-white">
              {designer.intro}
            </p>
            <p className="mt-6 text-sm leading-7 text-white/60">
              The site behaves like an installation: slow camera travel, cinematic
              section changes, and premium material studies rather than flat project
              tiles.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <MagneticButton href="#featured">Enter projects</MagneticButton>
              <MagneticButton
                href="/playground"
                className="border-white/10 bg-white/[0.03] text-white/[0.72]"
              >
                Explore playground
              </MagneticButton>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <motion.div
              key={project.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: Number(project.index) * 0.12 }}
              className="rounded-[26px] border border-white/10 bg-black/[0.15] p-5 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between text-[10px] uppercase tracking-[0.32em] text-white/[0.42]">
                <span>{project.index}</span>
                <span>{project.year}</span>
              </div>
              <div className="mt-16 flex items-end justify-between gap-5">
                <div>
                  <p className="text-2xl font-display text-white">{project.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/[0.45]">
                    {project.category}
                  </p>
                </div>
                <Link href={`/projects/${project.slug}`} data-cursor="link" className="text-white/[0.75]">
                  View
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="featured" className="relative z-10 pb-32">
        {projects.map((project) => (
          <motion.section
            id={`section-${project.slug}`}
            key={project.slug}
            className="section-shell grid min-h-[120svh] gap-10 py-20 lg:grid-cols-[0.48fr_0.52fr] lg:items-end"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="glass-card self-start p-6 sm:p-8 lg:sticky lg:top-28">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.34em] text-white/[0.44]">
                <span>{project.index}</span>
                <span>{project.client}</span>
              </div>
              <h2 className="section-title mt-10 text-white">{project.title}</h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/[0.66]">{project.excerpt}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                {project.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/[0.52]"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            <div className="ml-auto max-w-xl">
              <p className="eyebrow">{project.category}</p>
              <p className="mt-10 text-[clamp(1.6rem,3.6vw,3rem)] font-display leading-[1.02] text-white">
                {project.description}
              </p>
              <p className="mt-8 text-sm leading-8 text-white/[0.62]">
                Scroll shifts the camera through a three-dimensional sequence of
                mockups. Each project lives at a different depth plane, while the
                matching artwork assembles from particles onto the object surface.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <MagneticButton href={`/projects/${project.slug}`}>Open case study</MagneticButton>
                <span className="text-xs uppercase tracking-[0.26em] text-white/[0.35]">
                  {project.deliverables.join(" / ")}
                </span>
              </div>
            </div>
          </motion.section>
        ))}
      </section>

      <section className="section-shell relative z-10 pb-24">
        <div className="glass-card grid gap-8 overflow-hidden rounded-[40px] p-8 sm:p-10 lg:grid-cols-[0.7fr_0.7fr_0.6fr]">
          <div>
            <span className="eyebrow">About</span>
            <h2 className="section-title mt-8 text-white">
              Design systems with editorial calm and a universe-scale point of view.
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-8 text-white/[0.64]">
              {designer.intro} {designer.about}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              "Shader-led transitions replace hard cuts with atmospheric reveals.",
              "Mockups are treated like lit objects in a gallery, not screenshots in cards.",
              "Typography stays large, patient, and sharply composed across every section.",
              "The Playground expands the portfolio into a laboratory for motion and code.",
            ].map((statement) => (
              <div key={statement} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-sm leading-8 text-white/[0.68]">{statement}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.35]">
                Final stage
              </p>
              <p className="mt-8 text-3xl font-display leading-tight text-white">
                Scroll exits the galaxy into the Playground and studio context.
              </p>
            </div>
            <MagneticButton href="/playground">Open playground</MagneticButton>
          </div>
        </div>
      </section>
    </main>
  );
}
