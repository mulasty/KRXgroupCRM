"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";

import { assetsManifest, type AssetsManifest } from "@/lib/site-data";
import type { Project, ProjectModel } from "@/lib/projects";
import { ParticleAssembly } from "@/three/components/particle-assembly";

export type AnimatedMockupProps = {
  project: Project;
  loadTexture: boolean;
};

export type MockupManifest = AssetsManifest["models"][ProjectModel];

export function usePreparedMockupScene(project: Project) {
  const manifest = assetsManifest.models[project.mockupType];
  const gltf = useGLTF(manifest.path, manifest.dracoCompressed ? "/draco-gltf/" : false);

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const accent = new Color(project.accent);

    clone.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      const name = child.name.toLowerCase();

      if (project.mockupType === "jar" && (name.includes("glass") || name.includes("body"))) {
        child.material = new MeshPhysicalMaterial({
          color: "#d8e0e8",
          roughness: 0.08,
          metalness: 0.08,
          transmission: 0.94,
          thickness: 1.15,
          ior: 1.18,
          attenuationColor: accent,
          attenuationDistance: 1.9,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
          envMapIntensity: 1.3,
        });
      } else if (name.includes("screen")) {
        child.material = new MeshPhysicalMaterial({
          color: "#080d14",
          roughness: 0.08,
          metalness: 0.24,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          reflectivity: 0.55,
          envMapIntensity: 1.15,
          emissive: accent.clone().multiplyScalar(0.06),
        });
      } else if (
        name.includes("frame") ||
        name.includes("lid") ||
        name.includes("cap") ||
        name.includes("base") ||
        name.includes("leg")
      ) {
        child.material = new MeshStandardMaterial({
          color: "#d4d8df",
          metalness: 0.9,
          roughness: 0.22,
          envMapIntensity: 1.1,
        });
      } else if (project.mockupType === "tshirt" || name.includes("shirt")) {
        child.material = new MeshStandardMaterial({
          color: "#f1ebe3",
          roughness: 0.88,
          metalness: 0.03,
          envMapIntensity: 0.35,
        });
      } else {
        child.material = new MeshStandardMaterial({
          color: "#11151c",
          roughness: 0.54,
          metalness: 0.18,
          emissive: accent.clone().multiplyScalar(0.022),
          envMapIntensity: 1.05,
        });
      }
    });

    return clone;
  }, [gltf.scene, project.accent, project.mockupType]);

  return { manifest, scene };
}

export function MockupLabel({
  project,
  loadTexture,
  manifest,
  children,
}: AnimatedMockupProps & {
  manifest: MockupManifest;
  children?: React.ReactNode;
}) {
  return (
    <group position={manifest.label.position} rotation={manifest.label.rotation}>
      {loadTexture ? (
        <ParticleAssembly
          slug={project.slug}
          textureUrl={project.texture}
          accent={project.accent}
          width={manifest.label.size[0]}
          height={manifest.label.size[1]}
        />
      ) : (
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[manifest.label.size[0], manifest.label.size[1]]} />
          <meshBasicMaterial color={project.accent} transparent opacity={0.1} />
        </mesh>
      )}
      {children}
    </group>
  );
}
