"use client";

import { useEffect, useMemo } from "react";
import {
  Color,
  DoubleSide,
  NormalBlending,
  ShaderMaterial,
} from "three";

import { MockupLabel, usePreparedMockupScene, type AnimatedMockupProps } from "@/three/mockups/mockup-utils";

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uTint;
  uniform vec3 cameraPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vWorldNormal), viewDir), 0.0), 3.6);
    float streak = smoothstep(0.0, 0.55, 1.0 - abs(vUv.y - 0.46) * 2.2);
    streak *= smoothstep(-0.15, 0.38, vUv.x + vUv.y * 0.38);
    vec3 color = mix(vec3(0.08, 0.1, 0.14), uTint, 0.58);
    float alpha = fresnel * 0.2 + streak * 0.045;

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export function LaptopMockup({ project, loadTexture }: AnimatedMockupProps) {
  const { manifest, scene } = usePreparedMockupScene(project);
  const glassMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: DoubleSide,
        blending: NormalBlending,
        uniforms: {
          uTint: { value: new Color(project.accent) },
        },
        vertexShader,
        fragmentShader,
      }),
    [project.accent],
  );

  useEffect(() => {
    glassMaterial.uniforms.uTint.value.set(project.accent);
  }, [glassMaterial, project.accent]);

  useEffect(() => {
    return () => {
      glassMaterial.dispose();
    };
  }, [glassMaterial]);

  return (
    <>
      <primitive object={scene} />
      <MockupLabel project={project} loadTexture={loadTexture} manifest={manifest}>
        <mesh material={glassMaterial} position={[0, 0, 0.012]}>
          <planeGeometry args={[manifest.label.size[0], manifest.label.size[1], 1, 1]} />
        </mesh>
      </MockupLabel>
    </>
  );
}
