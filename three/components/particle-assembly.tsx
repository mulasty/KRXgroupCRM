"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  MathUtils,
  MeshBasicMaterial,
  SRGBColorSpace,
  Texture,
} from "three";

import { AssemblyParticlesMaterial } from "@/shaders/assembly-particles";

gsap.registerPlugin(ScrollTrigger);

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

type ParticleAssemblyProps = {
  textureUrl: string;
  accent: string;
  width: number;
  height: number;
  slug?: string;
};

export function ParticleAssembly({
  textureUrl,
  accent,
  width,
  height,
  slug,
}: ParticleAssemblyProps) {
  const pointsMaterialRef = useRef<InstanceType<typeof AssemblyParticlesMaterial> | null>(null);
  const planeMaterialRef = useRef<MeshBasicMaterial>(null);
  const progressRef = useRef({ value: 0.08 });
  const texture = useTexture(textureUrl) as Texture;
  const accentColor = useMemo(() => new Color(accent), [accent]);

  const displayTexture = useMemo(() => {
    const cloned = texture.clone();
    cloned.colorSpace = SRGBColorSpace;
    cloned.needsUpdate = true;
    return cloned;
  }, [texture]);

  const geometry = useMemo(() => {
    const columns = 92;
    const rows = Math.max(66, Math.floor(columns * (height / width)));
    const count = columns * rows;
    const target = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const uv = new Float32Array(count * 2);
    const scatter = new Float32Array(count);

    let particleIndex = 0;

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const u = x / (columns - 1);
        const v = y / (rows - 1);
        const tx = (u - 0.5) * width;
        const ty = (v - 0.5) * height;
        const seed = particleIndex + 1;
        const radius = 1.2 + seededUnit(seed * 1.31) * 1.8;
        const theta = seededUnit(seed * 2.17) * Math.PI * 2;
        const phi = seededUnit(seed * 3.07) * Math.PI;
        const sx = Math.sin(phi) * Math.cos(theta) * radius * width * 0.9;
        const sy = Math.cos(phi) * radius * height * 0.6;
        const sz = (Math.sin(phi) * Math.sin(theta) * radius + 1.5) * 0.8;

        target[particleIndex * 3] = tx;
        target[particleIndex * 3 + 1] = ty;
        target[particleIndex * 3 + 2] = 0;

        start[particleIndex * 3] = sx;
        start[particleIndex * 3 + 1] = sy;
        start[particleIndex * 3 + 2] = sz;

        uv[particleIndex * 2] = u;
        uv[particleIndex * 2 + 1] = v;
        scatter[particleIndex] = seededUnit(seed * 4.91);

        particleIndex += 1;
      }
    }

    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new BufferAttribute(target, 3));
    buffer.setAttribute("aStart", new BufferAttribute(start, 3));
    buffer.setAttribute("uv", new BufferAttribute(uv, 2));
    buffer.setAttribute("aScatter", new BufferAttribute(scatter, 1));

    return buffer;
  }, [height, width]);

  useEffect(() => {
    if (!slug) {
      gsap.to(progressRef.current, {
        value: 1,
        duration: 1.8,
        ease: "power4.out",
      });

      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: `#section-${slug}`,
      start: "top 80%",
      end: "bottom 30%",
      onEnter: () =>
        gsap.to(progressRef.current, {
          value: 1,
          duration: 1.6,
          ease: "power4.out",
          overwrite: true,
        }),
      onEnterBack: () =>
        gsap.to(progressRef.current, {
          value: 1,
          duration: 1.2,
          ease: "power3.out",
          overwrite: true,
        }),
      onLeaveBack: () =>
        gsap.to(progressRef.current, {
          value: 0.12,
          duration: 0.85,
          ease: "power2.out",
          overwrite: true,
        }),
    });

    return () => {
      trigger.kill();
    };
  }, [slug]);

  useFrame((state, delta) => {
    const material = pointsMaterialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uTime.value += delta;
    material.uniforms.uProgress.value = progressRef.current.value;

    if (planeMaterialRef.current) {
      planeMaterialRef.current.opacity = MathUtils.smoothstep(
        progressRef.current.value,
        0.64,
        0.98,
      );
    }

    const pointSize = MathUtils.lerp(2.1, 3.25, progressRef.current.value);
    material.uniforms.uPointSize.value = pointSize;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <group>
      <points geometry={geometry}>
        <assemblyParticlesMaterial
          ref={pointsMaterialRef}
          transparent
          depthWrite={false}
          depthTest
          uMap={displayTexture}
          uTint={accentColor}
        />
      </points>

      <mesh position={[0, 0, -0.015]}>
        <planeGeometry args={[width * 1.08, height * 1.08]} />
        <meshBasicMaterial color={accent} transparent opacity={0.08} />
      </mesh>

      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={planeMaterialRef}
          map={displayTexture}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
