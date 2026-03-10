"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Group, MathUtils, Vector2 } from "three";

import { BlackHole } from "@/three/navigation/BlackHole";
import { useTransitionManager } from "@/three/transitions/TransitionManager";

const WarpFieldMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    intensity: 1,
    center: new Vector2(0.5, 0.5),
  },
  `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform float progress;
    uniform float intensity;
    uniform vec2 center;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      vec2 delta = vUv - center;
      float radius = length(delta);
      float angle = atan(delta.y, delta.x);
      float sink = smoothstep(0.0, 1.0, progress);
      float pull = smoothstep(0.78, 0.08, radius) * sink;
      float streaks = sin(angle * 24.0 - time * (1.8 + intensity * 0.25) - radius * 18.0);
      float turbulence = noise(delta * 8.0 + vec2(time * 0.12, -time * 0.09));
      float horizon = smoothstep(0.95, 0.12, radius);

      vec3 color = mix(vec3(0.01, 0.015, 0.03), vec3(0.12, 0.38, 0.78), pull * 0.55);
      color = mix(color, vec3(0.86, 0.95, 1.0), (streaks * 0.5 + 0.5) * 0.12 + turbulence * 0.12);

      float alpha = pull * 0.28 + horizon * sink * 0.08;
      alpha += smoothstep(0.82, 0.1, radius) * (streaks * 0.5 + 0.5) * 0.07 * sink;
      alpha = clamp(alpha, 0.0, 0.55);

      if (alpha < 0.01) {
        discard;
      }

      gl_FragColor = vec4(color, alpha);
    }
  `,
);

extend({ WarpFieldMaterial });

function BlackHoleWarpLayer() {
  const transition = useTransitionManager();
  const viewport = useThree((state) => state.viewport);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<any>(null);
  const easedProgress = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;

    if (!group || !material) {
      return;
    }

    const active = transition.type === "black-hole" && transition.active;
    easedProgress.current = MathUtils.damp(
      easedProgress.current,
      active ? transition.progress : 0,
      5.5,
      delta,
    );

    group.visible = active || easedProgress.current > 0.001;
    group.scale.set(viewport.width * 1.08, viewport.height * 1.08, 1);

    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.progress.value = easedProgress.current;
    material.uniforms.intensity.value = transition.intensity;
    (material.uniforms.center.value as Vector2).set(
      (transition.anchorNdc?.[0] ?? 0) * 0.5 + 0.5,
      (transition.anchorNdc?.[1] ?? 0) * 0.5 + 0.5,
    );
  });

  return (
    <group ref={groupRef} renderOrder={14}>
      <mesh frustumCulled={false}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <warpFieldMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
        />
      </mesh>
      <BlackHole
        active={transition.type === "black-hole" && transition.active}
        progress={transition.progress}
        intensity={transition.intensity}
        anchorNdc={transition.anchorNdc}
        anchorSize={transition.anchorSize}
      />
    </group>
  );
}

export function SpaceWarp() {
  const transition = useTransitionManager();
  const active = transition.type === "black-hole" && transition.active;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[76]"
      style={{ opacity: active ? 1 : 0 }}
    >
      <Canvas
        orthographic
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "demand"}
        camera={{ position: [0, 0, 5], zoom: 1 }}
      >
        <BlackHoleWarpLayer />
      </Canvas>
    </div>
  );
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    warpFieldMaterial: any;
  }
}
