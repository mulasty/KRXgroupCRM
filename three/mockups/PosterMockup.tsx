"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Color,
  DoubleSide,
  Mesh,
  NormalBlending,
  ShaderMaterial,
} from "three";

import { MockupLabel, usePreparedMockupScene, type AnimatedMockupProps } from "@/three/mockups/mockup-utils";

const vertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float envelope = 1.0 - smoothstep(0.0, 0.48, abs(uv.y - 0.5));
    float wave = sin(position.x * 4.6 + uTime * 0.95) * 0.028;
    wave += sin(position.y * 1.8 + uTime * 0.42) * 0.012;
    transformed.z += wave * envelope;
    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uTint;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec2 centered = vUv - 0.5;
    float edgeFade = smoothstep(0.56, 0.1, length(centered * vec2(1.1, 0.85)));
    float sheen = smoothstep(-0.12, 0.2, centered.x + centered.y * 0.55 + vWave * 2.8);
    vec3 color = mix(vec3(0.92, 0.95, 1.0), uTint, 0.22);
    float alpha = edgeFade * (0.035 + sheen * 0.06);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export function PosterMockup({ project, loadTexture }: AnimatedMockupProps) {
  const { manifest, scene } = usePreparedMockupScene(project);
  const coverRef = useRef<Mesh>(null);
  const coverMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: DoubleSide,
        blending: NormalBlending,
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
    coverMaterial.uniforms.uTint.value.set(project.accent);
  }, [coverMaterial, project.accent]);

  useEffect(() => {
    return () => {
      coverMaterial.dispose();
    };
  }, [coverMaterial]);

  useFrame((state) => {
    const mesh = coverRef.current;

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
        <mesh ref={coverRef} material={coverMaterial} position={[0, 0, 0.014]}>
          <planeGeometry
            args={[manifest.label.size[0] * 1.02, manifest.label.size[1] * 1.02, 26, 42]}
          />
        </mesh>
      </MockupLabel>
    </>
  );
}
