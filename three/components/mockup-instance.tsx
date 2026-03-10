"use client";

import { useMemo, useRef } from "react";
import { Float, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  Group,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";

import type { Project } from "@/lib/projects";
import { assetsManifest } from "@/lib/site-data";
import { ParticleAssembly } from "@/three/components/particle-assembly";

type MockupInstanceProps = {
  project: Project;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
};

export function MockupInstance({
  project,
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: MockupInstanceProps) {
  const root = useRef<Group>(null);
  const manifest = assetsManifest.models[project.model];
  const gltf = useGLTF(manifest.path, manifest.dracoCompressed ? "/draco-gltf/" : false);
  const config = manifest.label;

  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);

    clone.traverse((child) => {
      if (!(child instanceof Mesh)) {
        return;
      }

      child.castShadow = true;
      child.receiveShadow = true;
      const name = child.name.toLowerCase();

      if (project.model === "jar" && (name.includes("glass") || name.includes("body"))) {
        child.material = new MeshPhysicalMaterial({
          color: "#d4dce4",
          roughness: 0.08,
          metalness: 0.08,
          transmission: 0.92,
          thickness: 1.1,
          ior: 1.18,
          attenuationColor: project.accent,
          attenuationDistance: 1.9,
          clearcoat: 1,
          clearcoatRoughness: 0.08,
        });
      } else if (name.includes("screen")) {
        child.material = new MeshStandardMaterial({
          color: "#0b1016",
          roughness: 0.18,
          metalness: 0.46,
        });
      } else if (
        name.includes("lid") ||
        name.includes("cap") ||
        name.includes("frame") ||
        name.includes("leg") ||
        name.includes("base")
      ) {
        child.material = new MeshStandardMaterial({
          color: "#d2d6de",
          metalness: 0.92,
          roughness: 0.18,
        });
      } else {
        child.material = new MeshStandardMaterial({
          color: "#11151c",
          roughness: 0.52,
          metalness: 0.18,
        });
      }
    });

    return clone;
  }, [gltf.scene, project.accent, project.model]);

  useFrame((state, delta) => {
    if (!root.current) {
      return;
    }

    const time = state.clock.getElapsedTime();
    const targetY = rotation[1] + state.pointer.x * 0.16;
    const targetX = rotation[0] + state.pointer.y * 0.1;
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, targetY, 4.2, delta);
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, targetX, 4.2, delta);
    root.current.position.y = MathUtils.damp(
      root.current.position.y,
      position[1] + Math.sin(time * 0.8 + position[2]) * 0.08,
      3.2,
      delta,
    );
  });

  return (
    <group position={position} scale={scale}>
      <Float floatIntensity={0.2} rotationIntensity={0.06} speed={1.1 + scale * 0.15}>
        <group ref={root}>
          <primitive object={scene} />
          <group position={config.position} rotation={config.rotation}>
            <ParticleAssembly
              slug={project.slug}
              textureUrl={project.texture}
              accent={project.accent}
              width={config.size[0]}
              height={config.size[1]}
            />
          </group>
        </group>
      </Float>
    </group>
  );
}
