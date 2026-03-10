"use client";

import { startTransition, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, PointLight } from "three";

import type { Project } from "@/lib/projects";
import { MockupFactory } from "@/three/mockups/MockupFactory";
import type { GalaxyNode } from "@/three/universe/GalaxyGenerator";

type ProjectNodeProps = {
  project: Project;
  node: GalaxyNode;
  hovered: boolean;
  focused: boolean;
  hoverScale: number;
  focusLightBoost: number;
  cursorGravityStrength: number;
  onHoverChange: (slug: string | null) => void;
  onSelect: (node: GalaxyNode) => void;
};

export function ProjectNode({
  project,
  node,
  hovered,
  focused,
  hoverScale,
  focusLightBoost,
  cursorGravityStrength,
  onHoverChange,
  onSelect,
}: ProjectNodeProps) {
  const root = useRef<Group>(null);
  const glowLight = useRef<PointLight>(null);
  const [loadTexture, setLoadTexture] = useState(false);
  const textureActiveRef = useRef(false);

  useFrame((state, delta) => {
    if (!root.current) {
      return;
    }

    const time = state.clock.getElapsedTime();
    const focusScale = focused
      ? 1.26
      : hovered
        ? hoverScale
        : 1;
    const targetPositionX =
      node.position.x +
      state.pointer.x * cursorGravityStrength * (0.6 + node.scale * 0.18) +
      Math.cos(time * 0.3 + node.orbitOffset) * 0.15;
    const targetPositionY =
      node.position.y +
      Math.sin(time * 0.7 + node.orbitOffset) * 0.14 +
      state.pointer.y * cursorGravityStrength * 0.24;
    const targetPositionZ =
      node.position.z + Math.sin(time * 0.42 + node.orbitOffset) * 0.2;
    const targetRotY = node.rotation[1] + time * 0.08 + state.pointer.x * 0.18;
    const targetRotX = node.rotation[0] + Math.sin(time * 0.22 + node.orbitOffset) * 0.06;
    const scaleValue = node.scale * focusScale;
    const cameraDistance = state.camera.position.distanceTo(root.current.position);
    const shouldActivateTexture = hovered || focused || cameraDistance < 22;

    if (shouldActivateTexture !== textureActiveRef.current) {
      textureActiveRef.current = shouldActivateTexture;
      startTransition(() => {
        setLoadTexture(shouldActivateTexture);
      });
    }

    root.current.position.x = MathUtils.damp(root.current.position.x, targetPositionX, 3.8, delta);
    root.current.position.y = MathUtils.damp(root.current.position.y, targetPositionY, 3.8, delta);
    root.current.position.z = MathUtils.damp(root.current.position.z, targetPositionZ, 3.8, delta);
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, targetRotX, 4, delta);
    root.current.rotation.y = MathUtils.damp(root.current.rotation.y, targetRotY, 4, delta);
    root.current.rotation.z = MathUtils.damp(
      root.current.rotation.z,
      node.rotation[2] + Math.cos(time * 0.2 + node.orbitOffset) * 0.04,
      4,
      delta,
    );
    root.current.scale.x = MathUtils.damp(root.current.scale.x, scaleValue, 4.5, delta);
    root.current.scale.y = MathUtils.damp(root.current.scale.y, scaleValue, 4.5, delta);
    root.current.scale.z = MathUtils.damp(root.current.scale.z, scaleValue, 4.5, delta);

    if (glowLight.current) {
      glowLight.current.intensity = MathUtils.damp(
        glowLight.current.intensity,
        focused ? 14 * focusLightBoost : hovered ? 9 * focusLightBoost : 8,
        4.5,
        delta,
      );
    }
  });

  return (
    <group
      ref={root}
      position={node.position}
      rotation={node.rotation}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHoverChange(project.slug);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        onHoverChange(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node);
      }}
    >
      <MockupFactory project={project} loadTexture={loadTexture} />

      <mesh position={[0, 0, -0.45]} scale={focused ? 1.6 : hovered ? 1.28 : 1}>
        <sphereGeometry args={[1.15, 24, 24]} />
        <meshBasicMaterial color={project.accent} transparent opacity={focused ? 0.14 : 0.08} />
      </mesh>

      <pointLight
        ref={glowLight}
        position={[0, 0.4, 1.4]}
        distance={6}
        color={project.accent}
        intensity={8}
      />

    </group>
  );
}
