"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Mesh,
  ShaderMaterial,
} from "three";

import { MockupLabel, usePreparedMockupScene, type AnimatedMockupProps } from "@/three/mockups/mockup-utils";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uTint;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float radius = length(centered * vec2(0.86, 1.12));
    float core = smoothstep(0.72, 0.08, radius);
    float pulse = 0.82 + sin(uTime * 1.9) * 0.06 + sin(uTime * 0.85 + 1.1) * 0.04;
    float verticalBand = smoothstep(0.0, 0.62, 1.0 - abs(vUv.y - 0.5) * 2.0);
    vec3 color = mix(vec3(0.05, 0.07, 0.1), uTint, 0.68);
    float alpha = core * (0.05 + verticalBand * 0.04) * pulse;

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export function PhoneMockup({ project, loadTexture }: AnimatedMockupProps) {
  const { manifest, scene } = usePreparedMockupScene(project);
  const glowRef = useRef<Mesh>(null);
  const glowMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: DoubleSide,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uTint: { value: new Color(project.accent) },
        },
        vertexShader,
        fragmentShader,
      }),
    [project.accent],
  );

  useEffect(() => {
    glowMaterial.uniforms.uTint.value.set(project.accent);
  }, [glowMaterial, project.accent]);

  useEffect(() => {
    return () => {
      glowMaterial.dispose();
    };
  }, [glowMaterial]);

  useFrame((state) => {
    const mesh = glowRef.current;

    if (!mesh) {
      return;
    }

    const material = mesh.material as ShaderMaterial;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <>
      <primitive object={scene} />
      <MockupLabel project={project} loadTexture={loadTexture} manifest={manifest}>
        <mesh
          ref={glowRef}
          material={glowMaterial}
          position={[0, 0, 0.012]}
          scale={[1.05, 1.04, 1]}
        >
          <planeGeometry args={[manifest.label.size[0], manifest.label.size[1], 1, 1]} />
        </mesh>
      </MockupLabel>
    </>
  );
}
