"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Group, MathUtils } from "three";

import "@/three/transitions/LiquidWarpMaterial";
import { ParticleDissolve } from "@/three/transitions/ParticleDissolve";
import { useTransitionManager } from "@/three/transitions/TransitionManager";

function WarpLayer() {
  const transition = useTransitionManager();
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<any>(null);
  const viewport = useThree((state) => state.viewport);
  const softness = useRef(0);

  useFrame((state, delta) => {
    const material = materialRef.current;
    const group = groupRef.current;

    if (!material || !group) {
      return;
    }

    const active = transition.active && transition.type !== "black-hole";
    group.visible = active;
    group.scale.set(viewport.width * 1.06, viewport.height * 1.06, 1);
    softness.current = MathUtils.damp(
      softness.current,
      active ? transition.progress : 0,
      7,
      delta,
    );

    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.progress.value = softness.current;
    material.uniforms.intensity.value = transition.intensity;
  });

  return (
    <group ref={groupRef} renderOrder={12}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[1, 1, 64, 64]} />
        <liquidWarpMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
        />
      </mesh>
      <ParticleDissolve />
    </group>
  );
}

export function WarpTransition() {
  const transition = useTransitionManager();
  const active = transition.active && transition.type !== "black-hole";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[75]"
      style={{ opacity: active ? 1 : 0 }}
    >
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "demand"}
        camera={{ position: [0, 0, 5], zoom: 1 }}
      >
        <WarpLayer />
      </Canvas>
    </div>
  );
}
