"use client";

import { useEffect, useMemo, useRef } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Points,
  Vector3,
} from "three";

import {
  type TransitionType,
  useTransitionManager,
} from "@/three/transitions/TransitionManager";

const DISSOLVE_PARTICLE_COUNT = 2400;

const DissolveMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    intensity: 1,
    color: new Color("#8cc8ff"),
  },
  `
    uniform float time;
    uniform float progress;
    uniform float intensity;
    attribute vec3 aDirection;
    attribute float aScale;
    attribute float aSeed;
    varying float vAlpha;

    void main() {
      vec3 transformed = position;
      float travel = progress * (0.45 + aSeed * 1.45) * (0.55 + intensity * 0.9);
      transformed += aDirection * travel;
      transformed.xy += vec2(
        sin(time * 1.8 + aSeed * 6.2831),
        cos(time * 1.4 + aSeed * 4.7123)
      ) * progress * 0.04;

      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      float distanceScale = clamp(140.0 / max(40.0, -mvPosition.z * 40.0), 0.55, 2.2);

      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (4.0 + aScale * 6.0) * distanceScale * (1.0 - progress * 0.35);

      vAlpha = (1.0 - progress) * (0.48 + aSeed * 0.52);
    }
  `,
  `
    uniform vec3 color;
    varying float vAlpha;

    void main() {
      vec2 centered = gl_PointCoord - 0.5;
      float dist = length(centered);
      float falloff = smoothstep(0.5, 0.0, dist);
      float core = smoothstep(0.18, 0.0, dist);
      float alpha = falloff * vAlpha;

      if (alpha < 0.01) {
        discard;
      }

      vec3 finalColor = mix(color, vec3(1.0), core * 0.6);
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
);

extend({ DissolveMaterial });

function supportsDissolve(type: TransitionType) {
  return type === "particle-dissolve" || type === "hybrid";
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function buildBurst(width: number, height: number, cycle: number) {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(DISSOLVE_PARTICLE_COUNT * 3);
  const directions = new Float32Array(DISSOLVE_PARTICLE_COUNT * 3);
  const scales = new Float32Array(DISSOLVE_PARTICLE_COUNT);
  const seeds = new Float32Array(DISSOLVE_PARTICLE_COUNT);

  const halfWidth = Math.max(0.08, width * 0.5);
  const halfHeight = Math.max(0.08, height * 0.5);

  for (let index = 0; index < DISSOLVE_PARTICLE_COUNT; index += 1) {
    const seed = cycle * 1000 + index + 1;
    const theta = seededUnit(seed * 1.13) * Math.PI * 2;
    const radius = Math.sqrt(seededUnit(seed * 1.31));
    const jitterX = (seededUnit(seed * 1.59) - 0.5) * halfWidth * 0.35;
    const jitterY = (seededUnit(seed * 1.73) - 0.5) * halfHeight * 0.35;
    const posX = Math.cos(theta) * halfWidth * radius + jitterX;
    const posY = Math.sin(theta) * halfHeight * radius + jitterY;
    const dir = new Vector3(posX / Math.max(halfWidth, 0.001), posY / Math.max(halfHeight, 0.001), 0);

    dir.normalize().multiplyScalar(0.35 + seededUnit(seed * 1.97) * 1.2);
    dir.x += (seededUnit(seed * 2.11) - 0.5) * 0.18;
    dir.y += (seededUnit(seed * 2.29) - 0.5) * 0.18;
    dir.z = (seededUnit(seed * 2.47) - 0.5) * 0.16;

    positions[index * 3] = posX;
    positions[index * 3 + 1] = posY;
    positions[index * 3 + 2] = (seededUnit(seed * 2.83) - 0.5) * 0.08;

    directions[index * 3] = dir.x;
    directions[index * 3 + 1] = dir.y;
    directions[index * 3 + 2] = dir.z;

    scales[index] = 0.4 + seededUnit(seed * 3.19) * 1.8;
    seeds[index] = seededUnit(seed * 3.53);
  }

  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aDirection", new Float32BufferAttribute(directions, 3));
  geometry.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));

  return {
    geometry,
  };
}

export function ParticleDissolve() {
  const viewport = useThree((state) => state.viewport);
  const transition = useTransitionManager();
  const pointsRef = useRef<Points>(null);

  const anchorPosition = useMemo<[number, number, number]>(() => {
    const x = (transition.anchorNdc?.[0] ?? 0) * viewport.width * 0.5;
    const y = (transition.anchorNdc?.[1] ?? 0) * viewport.height * 0.5;
    return [x, y, 0];
  }, [transition.anchorNdc, viewport.height, viewport.width]);

  const burst = useMemo(() => {
    if (!supportsDissolve(transition.type)) {
      return null;
    }

    const width = Math.max(0.24, (transition.anchorSize?.[0] ?? 0.18) * viewport.width * 0.5);
    const height = Math.max(0.18, (transition.anchorSize?.[1] ?? 0.18) * viewport.height * 0.5);
    return buildBurst(width, height, transition.cycle);
  }, [
    transition.anchorSize,
    transition.cycle,
    transition.type,
    viewport.height,
    viewport.width,
  ]);

  useEffect(() => {
    if (!burst) {
      return;
    }

    return () => {
      burst.geometry.dispose();
    };
  }, [burst]);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const material = points.material as InstanceType<typeof DissolveMaterial>;
    const visible =
      transition.active &&
      supportsDissolve(transition.type) &&
      transition.progress > 0.01 &&
      transition.progress < 0.98;

    points.visible = visible;
    points.position.set(anchorPosition[0], anchorPosition[1], 0);
    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.progress.value = MathUtils.damp(
      material.uniforms.progress.value,
      transition.progress,
      7,
      delta,
    );
    material.uniforms.intensity.value = MathUtils.damp(
      material.uniforms.intensity.value,
      transition.intensity,
      7,
      delta,
    );
    (material.uniforms.color.value as Color).set(transition.accent ?? "#8cc8ff");
  });

  if (!burst) {
    return null;
  }

  return (
    <points
      ref={pointsRef}
      geometry={burst.geometry}
      frustumCulled={false}
      renderOrder={18}
      position={anchorPosition}
    >
      <dissolveMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    dissolveMaterial: any;
  }
}
