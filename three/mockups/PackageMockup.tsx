"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";

import { MockupLabel, usePreparedMockupScene, type AnimatedMockupProps } from "@/three/mockups/mockup-utils";

function phaseFromSlug(slug: string) {
  return Array.from(slug).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0) * 0.0038;
}

export function PackageMockup({ project, loadTexture }: AnimatedMockupProps) {
  const { manifest, scene } = usePreparedMockupScene(project);
  const root = useRef<Group>(null);
  const phase = useMemo(() => phaseFromSlug(project.slug), [project.slug]);

  useFrame((state, delta) => {
    const group = root.current;

    if (!group) {
      return;
    }

    const time = state.clock.getElapsedTime();
    const targetRotY = Math.sin(time * 0.28 + phase) * 0.045;
    const targetRotX = Math.cos(time * 0.21 + phase * 0.8) * 0.028;

    group.rotation.y = MathUtils.damp(group.rotation.y, targetRotY, 2.8, delta);
    group.rotation.x = MathUtils.damp(group.rotation.x, targetRotX, 2.4, delta);
  });

  return (
    <group ref={root}>
      <primitive object={scene} />
      <MockupLabel project={project} loadTexture={loadTexture} manifest={manifest} />
    </group>
  );
}
