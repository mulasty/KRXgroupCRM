"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { MagneticButton } from "@/components/common/magnetic-button";
import type { Project } from "@/lib/projects";

export function ProjectCaseStudy({
  project,
  nextProject,
}: {
  project: Project;
  nextProject: Project;
}) {
  return (
    <main className="relative overflow-x-clip pb-20 pt-24">
      <section className="section-shell">
        <motion.div
          className="glass-card relative overflow-hidden rounded-[40px] p-8 sm:p-10 lg:p-14"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background: `radial-gradient(circle at 20% 20%, ${project.accent}22, transparent 30%), linear-gradient(160deg, rgba(255,255,255,0.03), rgba(255,255,255,0))`,
            }}
          />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="eyebrow">{project.category}</p>
              <h1 className="display-line mt-8 text-white">{project.title}</h1>
              <p className="mt-8 max-w-md text-base leading-8 text-white/[0.66]">
                {project.description}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                {project.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/[0.5]"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative aspect-[1.05/0.8] overflow-hidden rounded-[28px] border border-white/10 bg-black/25">
              <Image
                src={project.heroTexture}
                alt={project.title}
                fill
                className="object-cover opacity-90"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/[0.35] via-transparent to-white/5" />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="section-shell grid gap-8 py-20 lg:grid-cols-[0.55fr_0.45fr]">
        <div className="space-y-5">
          <p className="eyebrow">Approach</p>
          {project.process.map((step, index) => (
            <motion.div
              key={step.title}
              className="rounded-[30px] border border-white/10 bg-white/[0.03] p-7"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.8, delay: index * 0.12 }}
            >
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.35]">
                0{index + 1}
              </p>
              <h2 className="mt-5 text-3xl text-white">{step.title}</h2>
              <p className="mt-4 text-sm leading-8 text-white/[0.64]">{step.body}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="glass-card sticky top-28 flex h-fit flex-col gap-6 p-8"
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-white/[0.35]">Deliverables</p>
          {project.deliverables.map((item) => (
            <div
              key={item}
              className="border-b border-white/[0.08] pb-4 text-xl text-white last:border-none last:pb-0"
            >
              {item}
            </div>
          ))}
          <p className="pt-2 text-sm leading-8 text-white/[0.58]">
            Each deliverable inherited the same core motion logic so the system stayed
            coherent from packaging to spatial launch visuals.
          </p>
        </motion.div>
      </section>

      <section className="section-shell py-6">
        <div className="grid gap-6 md:grid-cols-3">
          {project.gallery.map((image) => (
            <motion.div
              key={image}
              className="relative aspect-[0.82] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src={image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section-shell py-24">
        <div className="glass-card rounded-[38px] p-8 sm:p-10">
          <p className="eyebrow">Next</p>
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="section-title text-white">{nextProject.title}</h2>
              <p className="mt-4 max-w-xl text-sm leading-8 text-white/[0.62]">
                Continue deeper into the portfolio or branch into the experimental
                Playground for visual studies and shader sketches.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <MagneticButton href={`/projects/${nextProject.slug}`}>
                Open next project
              </MagneticButton>
              <Link
                href="/playground"
                data-cursor="link"
                className="inline-flex items-center rounded-full border border-white/10 px-6 py-3 text-xs uppercase tracking-[0.34em] text-white/70 transition-colors hover:border-white/30 hover:text-white"
              >
                Playground
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
