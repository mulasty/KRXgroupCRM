"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  Points as ThreePoints,
  ShaderMaterial,
  Vector3,
} from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";
import { usePerformanceEngine } from "@/systems/performance/PerformanceEngine";

const MAX_PARTICLE_COUNT = 15000;
const GALAXY_RADIUS = 72;
const GALAXY_ARMS = 4;

function seededUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

const vertexShader = `
  uniform float uTime;
  uniform float uSize;
  uniform float uRadius;
  uniform float uDriftStrength;
  uniform float uSpinStrength;
  uniform vec3 uCameraPosition;
  attribute float aScale;
  attribute float aSeed;
  attribute float aPhase;
  attribute float aMix;
  varying float vMix;
  varying float vAlpha;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  void main() {
    vec3 transformed = position;
    float radiusNorm = saturate(length(transformed.xz) / uRadius);
    float rotation = uTime * uSpinStrength * (0.01 + radiusNorm * 0.014);
    float c = cos(rotation);
    float s = sin(rotation);

    transformed.xz = mat2(c, -s, s, c) * transformed.xz;

    float drift = uDriftStrength * (0.18 + aSeed * 0.28) * (0.35 + radiusNorm * 0.65);
    transformed.x += cos(uTime * (0.08 + aSeed * 0.12) + aPhase) * drift;
    transformed.z += sin(uTime * (0.06 + aSeed * 0.1) + aPhase * 1.3) * drift;
    transformed.y += sin(uTime * (0.12 + aSeed * 0.18) + aPhase) * (0.12 + aSeed * 0.3);

    vec2 cameraReactive = uCameraPosition.xz * (0.002 + aSeed * 0.0015);
    transformed.xz += cameraReactive * (0.25 + radiusNorm * 0.75);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    float distanceScale = clamp(320.0 / -mvPosition.z, 0.0, 10.0);
    float pointSize = uSize * aScale * distanceScale * (0.75 + radiusNorm * 0.65);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = min(pointSize, 8.5);

    vMix = aMix;
    vAlpha = 0.18 + (1.0 - radiusNorm) * 0.14 + aSeed * 0.22;
  }
`;

const fragmentShader = `
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying float vMix;
  varying float vAlpha;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = length(centered);
    float falloff = smoothstep(0.5, 0.0, distanceToCenter);
    float core = smoothstep(0.22, 0.0, distanceToCenter);
    float sparkle = smoothstep(0.32, 0.0, abs(centered.x) + abs(centered.y));
    vec3 color = mix(uColorA, uColorB, clamp(vMix, 0.0, 1.0));
    color = mix(color, uColorC, core * 0.82 + sparkle * 0.18);
    float alpha = falloff * vAlpha * uOpacity;

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export function GalaxyParticles() {
  const experience = useExperienceDirector();
  const performance = usePerformanceEngine();
  const pointsRef = useRef<ThreePoints>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(MAX_PARTICLE_COUNT * 3);
    const scales = new Float32Array(MAX_PARTICLE_COUNT);
    const seeds = new Float32Array(MAX_PARTICLE_COUNT);
    const phases = new Float32Array(MAX_PARTICLE_COUNT);
    const mixes = new Float32Array(MAX_PARTICLE_COUNT);

    for (let index = 0; index < MAX_PARTICLE_COUNT; index += 1) {
      const seed = index + 1;
      const arm = index % GALAXY_ARMS;
      const radius = Math.pow(seededUnit(seed * 1.71), 1.2) * GALAXY_RADIUS;
      const angle = seededUnit(seed * 2.13) * Math.PI * 2;
      const twist = radius * 0.19;
      const spiralAngle = angle * 0.3 + (arm / GALAXY_ARMS) * Math.PI * 2 + twist;
      const spread = (0.35 + radius * 0.06) * Math.pow(seededUnit(seed * 2.93), 1.6);
      const offsetX = (seededUnit(seed * 3.17) - 0.5) * spread;
      const offsetZ = (seededUnit(seed * 3.61) - 0.5) * spread;
      const offsetY = (seededUnit(seed * 4.07) - 0.5) * (0.7 + radius * 0.1);

      positions[index * 3] = Math.cos(spiralAngle) * radius + offsetX;
      positions[index * 3 + 1] = offsetY;
      positions[index * 3 + 2] = Math.sin(spiralAngle) * radius + offsetZ - 10;

      scales[index] = 0.6 + Math.pow(seededUnit(seed * 4.41), 2) * 2.2;
      seeds[index] = seededUnit(seed * 4.83);
      phases[index] = seededUnit(seed * 5.29) * Math.PI * 2;
      mixes[index] = Math.min(1, 0.16 + radius / GALAXY_RADIUS * 0.86 + seededUnit(seed * 5.71) * 0.08);
    }

    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(positions, 3));
    buffer.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
    buffer.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    buffer.setAttribute("aPhase", new Float32BufferAttribute(phases, 1));
    buffer.setAttribute("aMix", new Float32BufferAttribute(mixes, 1));
    return buffer;
  }, []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1.05 },
          uRadius: { value: GALAXY_RADIUS },
          uOpacity: { value: 0.46 },
          uDriftStrength: { value: 1 },
          uSpinStrength: { value: 1 },
          uCameraPosition: { value: new Vector3() },
          uColorA: { value: new Color("#24173b") },
          uColorB: { value: new Color("#5f8cff") },
          uColorC: { value: new Color("#f5f8ff") },
        },
        vertexShader,
        fragmentShader,
      }),
    [],
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, delta) => {
    const points = pointsRef.current;

    if (!points) {
      return;
    }

    const pointsMaterial = points.material as ShaderMaterial;
    const clampedParticleCount = Math.min(
      Math.max(3000, Math.floor(performance.quality.particleCount * 0.7)),
      MAX_PARTICLE_COUNT,
    );

    if (geometry.drawRange.count !== clampedParticleCount) {
      geometry.setDrawRange(0, clampedParticleCount);
    }

    pointsMaterial.uniforms.uTime.value = state.clock.getElapsedTime() * experience.particles.activity;
    pointsMaterial.uniforms.uOpacity.value = MathUtils.damp(
      pointsMaterial.uniforms.uOpacity.value,
      experience.particles.opacity * performance.quality.shaderIntensity,
      3.6,
      delta,
    );
    pointsMaterial.uniforms.uSize.value = MathUtils.damp(
      pointsMaterial.uniforms.uSize.value,
      1.05 * experience.particles.size * (0.82 + performance.quality.shaderIntensity * 0.18),
      3.6,
      delta,
    );
    pointsMaterial.uniforms.uDriftStrength.value = MathUtils.damp(
      pointsMaterial.uniforms.uDriftStrength.value,
      experience.particles.drift * performance.quality.shaderIntensity,
      3.6,
      delta,
    );
    pointsMaterial.uniforms.uSpinStrength.value = MathUtils.damp(
      pointsMaterial.uniforms.uSpinStrength.value,
      experience.particles.spin * (0.75 + performance.quality.shaderIntensity * 0.25),
      3.6,
      delta,
    );
    (pointsMaterial.uniforms.uCameraPosition.value as Vector3).copy(state.camera.position);
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      position={[0, 0, -4]}
      renderOrder={-8}
    />
  );
}
