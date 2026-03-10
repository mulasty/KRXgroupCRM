"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { ExperienceDirectorController } from "@/systems/ExperienceDirector";
import { PerformanceEngine } from "@/systems/performance/PerformanceEngine";
import { PostFXPipeline } from "@/three/effects/PostFXPipeline";
import { PortfolioScene } from "@/three/scenes/portfolio-scene";
import { TransitionSceneBridge } from "@/three/transitions/TransitionManager";

export function PortfolioCanvas() {
  return (
    <div className="pointer-events-auto fixed inset-0 -z-10" data-cursor="light">
      <ExperienceDirectorController />
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.25, 6.8], fov: 34, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PerformanceEngine preset="portfolio">
            <PortfolioScene />
            <TransitionSceneBridge />
            <PostFXPipeline preset="portfolio" targetDistance={12} />
          </PerformanceEngine>
        </Suspense>
      </Canvas>
    </div>
  );
}
