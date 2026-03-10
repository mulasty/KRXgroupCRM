"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  MathUtils,
  Mesh,
  NormalBlending,
  SRGBColorSpace,
  ShaderMaterial,
} from "three";

import { visualEffects } from "@/lib/site-data";
import { usePerformanceEngine } from "@/systems/performance/PerformanceEngine";

const MAX_LOGO_COUNT = 4500;
const LOGO_ASPECT = 324 / 156;

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

const vertexShader = `
  uniform float uTime;
  uniform float uBaseScale;
  attribute vec3 iOffset;
  attribute vec3 iColor;
  attribute float iScale;
  attribute float iSeed;
  attribute float iPhase;
  attribute float iRotation;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vUv = uv;
    vColor = iColor;

    vec3 center = iOffset;
    float drift = (0.18 + iSeed * 0.34);
    center.x += cos(uTime * (0.12 + iSeed * 0.14) + iPhase) * drift * 0.9;
    center.y += sin(uTime * (0.15 + iSeed * 0.16) + iPhase * 1.17) * drift * 0.54;
    center.z += cos(uTime * (0.09 + iSeed * 0.11) + iPhase * 0.72) * drift * 0.7;

    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);
    float spin = iRotation + uTime * (0.08 + iSeed * 0.06);
    mat2 rotation = mat2(cos(spin), -sin(spin), sin(spin), cos(spin));
    vec2 rotated = rotation * position.xy;
    float scale = uBaseScale * iScale;

    mvCenter.xy += rotated * scale;

    gl_Position = projectionMatrix * mvCenter;
    vAlpha = 0.18 + iSeed * 0.2;
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uBrightnessThreshold;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 tex = texture2D(uMap, vUv);
    float luminance = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    float mask = 1.0 - smoothstep(uBrightnessThreshold - 0.14, uBrightnessThreshold + 0.02, luminance);
    float alpha = mask * uOpacity * vAlpha;

    if (alpha < 0.02) {
      discard;
    }

    vec3 color = mix(vColor * 0.88, vec3(1.0), mask * 0.12);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function LogoNebulaField() {
  const performance = usePerformanceEngine();
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const geometryRef = useRef<InstancedBufferGeometry | null>(null);
  const logoTexture = useTexture(visualEffects.brandField.logoTexture);
  const configuredLogoTexture = useMemo(() => {
    const texture = logoTexture.clone();
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [logoTexture]);
  const geometry = useMemo(() => {
    const base = new InstancedBufferGeometry();
    const positions = new Float32Array([
      -0.5 * LOGO_ASPECT, -0.5, 0,
      0.5 * LOGO_ASPECT, -0.5, 0,
      0.5 * LOGO_ASPECT, 0.5, 0,
      -0.5 * LOGO_ASPECT, 0.5, 0,
    ]);
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ]);
    const offsets = new Float32Array(MAX_LOGO_COUNT * 3);
    const colors = new Float32Array(MAX_LOGO_COUNT * 3);
    const scales = new Float32Array(MAX_LOGO_COUNT);
    const seeds = new Float32Array(MAX_LOGO_COUNT);
    const phases = new Float32Array(MAX_LOGO_COUNT);
    const rotations = new Float32Array(MAX_LOGO_COUNT);
    const palette = visualEffects.nebula.colors.map((entry) => new Color(entry));

    for (let index = 0; index < MAX_LOGO_COUNT; index += 1) {
      const seed = index + 1;
      const radius = Math.pow(seededUnit(seed * 1.23), 0.55) * visualEffects.nebula.fieldRadius;
      const angle = seededUnit(seed * 2.41) * Math.PI * 2;
      const height = (seededUnit(seed * 3.77) - 0.5) * 14;
      const depth = (seededUnit(seed * 4.51) - 0.5) * visualEffects.nebula.depth * 2;
      const color = palette[index % palette.length].clone().lerp(new Color("#ffffff"), 0.08);

      offsets[index * 3] = Math.cos(angle) * radius;
      offsets[index * 3 + 1] = height;
      offsets[index * 3 + 2] = depth;

      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;

      scales[index] = 0.42 + seededUnit(seed * 5.19) * 1.18;
      seeds[index] = seededUnit(seed * 5.73);
      phases[index] = seededUnit(seed * 6.31) * Math.PI * 2;
      rotations[index] = (seededUnit(seed * 7.07) - 0.5) * Math.PI;
    }

    base.setAttribute("position", new Float32BufferAttribute(positions, 3));
    base.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    base.setIndex([0, 1, 2, 0, 2, 3]);
    base.setAttribute("iOffset", new InstancedBufferAttribute(offsets, 3));
    base.setAttribute("iColor", new InstancedBufferAttribute(colors, 3));
    base.setAttribute("iScale", new InstancedBufferAttribute(scales, 1));
    base.setAttribute("iSeed", new InstancedBufferAttribute(seeds, 1));
    base.setAttribute("iPhase", new InstancedBufferAttribute(phases, 1));
    base.setAttribute("iRotation", new InstancedBufferAttribute(rotations, 1));
    base.instanceCount = Math.min(MAX_LOGO_COUNT, visualEffects.brandField.maxLogos);

    return base;
  }, []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: NormalBlending,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uBaseScale: { value: visualEffects.brandField.baseScale },
          uOpacity: { value: visualEffects.brandField.opacity },
          uBrightnessThreshold: { value: visualEffects.brandField.brightnessThreshold },
          uMap: { value: configuredLogoTexture },
        },
        vertexShader,
        fragmentShader,
      }),
    [configuredLogoTexture],
  );
  const logoCount = useMemo(
    () =>
      Math.min(
        visualEffects.brandField.maxLogos,
        Math.max(1200, Math.floor(performance.quality.particleCount * 0.3)),
      ),
    [performance.quality.particleCount],
  );

  useEffect(() => {
    geometryRef.current = geometry;

    return () => {
      geometryRef.current = null;
      geometry.dispose();
      material.dispose();
      configuredLogoTexture.dispose();
    };
  }, [configuredLogoTexture, geometry, material]);

  useEffect(() => {
    if (geometryRef.current) {
      geometryRef.current.instanceCount = logoCount;
    }
  }, [logoCount]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * visualEffects.nebula.rotationSpeed;
      groupRef.current.rotation.x += delta * visualEffects.nebula.rotationSpeed * 0.12;
    }

    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const meshMaterial = mesh.material as ShaderMaterial;

    meshMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
    meshMaterial.uniforms.uOpacity.value = MathUtils.damp(
      meshMaterial.uniforms.uOpacity.value,
      visualEffects.brandField.opacity * performance.quality.shaderIntensity,
      3.8,
      delta,
    );
    meshMaterial.uniforms.uBaseScale.value = MathUtils.damp(
      meshMaterial.uniforms.uBaseScale.value,
      visualEffects.brandField.baseScale * (0.82 + performance.quality.shaderIntensity * 0.24),
      3.8,
      delta,
    );
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    </group>
  );
}
