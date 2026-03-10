"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { PerformanceEngine } from "@/systems/performance/PerformanceEngine";
import { PostFXPipeline } from "@/three/effects/PostFXPipeline";
import { PlaygroundScene } from "@/three/scenes/playground-scene";

export function PlaygroundCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-95">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0.2, 4.8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PerformanceEngine preset="playground">
            <PlaygroundScene />
            <PostFXPipeline preset="playground" targetDistance={4.2} />
          </PerformanceEngine>
        </Suspense>
      </Canvas>
    </div>
  );
}
