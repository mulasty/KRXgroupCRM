"use client";

import { useEffect, useMemo, useRef } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Points,
  Vector3,
} from "three";

const DISK_PARTICLE_COUNT = 1400;

function seededUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

const AccretionDiskMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    intensity: 1,
    colorA: new Color("#5d8dff"),
    colorB: new Color("#f7f9ff"),
  },
  `
    uniform float time;
    uniform float progress;
    uniform float intensity;
    attribute float aAngle;
    attribute float aRadius;
    attribute float aHeight;
    attribute float aScale;
    attribute float aSpeed;
    attribute float aSeed;
    varying float vMix;
    varying float vAlpha;

    void main() {
      float sink = progress * progress;
      float radius = mix(aRadius, 0.08 + aSeed * 0.08, sink * 0.92);
      float angle = aAngle + time * (1.3 + aSpeed * 1.25) - sink * (3.2 + aSpeed * 1.8);

      vec3 transformed = vec3(
        cos(angle) * radius,
        aHeight * (1.0 - sink * 0.55),
        sin(angle) * radius
      );

      transformed.y += sin(time * 2.2 + aSeed * 6.2831) * 0.02 * intensity;
      transformed.xz *= 1.0 + sin(time * 0.7 + aSeed * 3.1415) * 0.03;

      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      float distanceScale = clamp(180.0 / max(70.0, -mvPosition.z * 48.0), 0.45, 2.4);

      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = (2.0 + aScale * 4.6) * distanceScale * (1.0 - sink * 0.3);

      vMix = clamp((aRadius - 0.14) / 0.55, 0.0, 1.0);
      vAlpha = (0.18 + aSeed * 0.42) * (1.0 - sink * 0.12);
    }
  `,
  `
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying float vMix;
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

      vec3 color = mix(colorA, colorB, vMix * 0.65 + core * 0.35);
      gl_FragColor = vec4(color, alpha);
    }
  `,
);

extend({ AccretionDiskMaterial });

type AccretionDiskProps = {
  progress: number;
  intensity: number;
};

export function AccretionDisk({ progress, intensity }: AccretionDiskProps) {
  const pointsRef = useRef<Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(DISK_PARTICLE_COUNT * 3);
    const angles = new Float32Array(DISK_PARTICLE_COUNT);
    const radii = new Float32Array(DISK_PARTICLE_COUNT);
    const heights = new Float32Array(DISK_PARTICLE_COUNT);
    const scales = new Float32Array(DISK_PARTICLE_COUNT);
    const speeds = new Float32Array(DISK_PARTICLE_COUNT);
    const seeds = new Float32Array(DISK_PARTICLE_COUNT);

    for (let index = 0; index < DISK_PARTICLE_COUNT; index += 1) {
      const seed = index + 1;
      const radius = 0.35 + Math.pow(seededUnit(seed * 1.13), 0.75) * 0.72;
      const angle = seededUnit(seed * 1.37) * Math.PI * 2;
      const height = (seededUnit(seed * 1.61) - 0.5) * 0.08;
      const scale = 0.3 + seededUnit(seed * 1.89) * 1.8;
      const speed = 0.4 + seededUnit(seed * 2.17) * 1.2;
      const randomSeed = seededUnit(seed * 2.41);

      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = height;
      positions[index * 3 + 2] = Math.sin(angle) * radius;

      angles[index] = angle;
      radii[index] = radius;
      heights[index] = height;
      scales[index] = scale;
      speeds[index] = speed;
      seeds[index] = randomSeed;
    }

    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(positions, 3));
    buffer.setAttribute("aAngle", new Float32BufferAttribute(angles, 1));
    buffer.setAttribute("aRadius", new Float32BufferAttribute(radii, 1));
    buffer.setAttribute("aHeight", new Float32BufferAttribute(heights, 1));
    buffer.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
    buffer.setAttribute("aSpeed", new Float32BufferAttribute(speeds, 1));
    buffer.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    return buffer;
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const material = points.material as InstanceType<typeof AccretionDiskMaterial>;

    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.progress.value = MathUtils.damp(material.uniforms.progress.value, progress, 5.8, delta);
    material.uniforms.intensity.value = MathUtils.damp(material.uniforms.intensity.value, intensity, 5.8, delta);
    points.rotation.z += delta * (0.28 + intensity * 0.08);
    points.rotation.x = MathUtils.damp(points.rotation.x, Math.PI * 0.5 - 0.22, 4.2, delta);
  });

  return (
    <points ref={pointsRef} geometry={geometry} renderOrder={16} frustumCulled={false}>
      <accretionDiskMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    accretionDiskMaterial: any;
  }
}
