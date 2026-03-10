"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  Group,
  MathUtils,
  Mesh,
  Object3D,
  PointLight,
  Vector3,
} from "three";

type HoverGlowProps = {
  targetObject: Object3D | null;
};

export function HoverGlow({ targetObject }: HoverGlowProps) {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const glowColor = useMemo(() => new Color("#8cc8ff"), []);
  const worldPosition = useRef(new Vector3());
  const tempPosition = useRef(new Vector3());

  useEffect(() => {
    const accent =
      typeof targetObject?.userData?.accent === "string"
        ? targetObject.userData.accent
        : "#8cc8ff";
    glowColor.set(accent);

    if (meshRef.current) {
      const material = meshRef.current.material;

      if ("color" in material) {
        material.color = glowColor.clone();
      }
    }

    if (lightRef.current) {
      lightRef.current.color.copy(glowColor);
    }
  }, [glowColor, targetObject]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const light = lightRef.current;
    const mesh = meshRef.current;

    if (!group || !light || !mesh) {
      return;
    }

    const active = Boolean(targetObject);
    const pulse = 0.88 + Math.sin(state.clock.getElapsedTime() * 2.2) * 0.08;

    if (targetObject) {
      targetObject.getWorldPosition(tempPosition.current);
      worldPosition.current.set(
        tempPosition.current.x,
        tempPosition.current.y + 0.4,
        tempPosition.current.z + 0.1,
      );
    }

    group.position.x = MathUtils.damp(group.position.x, worldPosition.current.x, 6, delta);
    group.position.y = MathUtils.damp(group.position.y, worldPosition.current.y, 6, delta);
    group.position.z = MathUtils.damp(group.position.z, worldPosition.current.z, 6, delta);

    light.intensity = MathUtils.damp(light.intensity, active ? 3.2 * pulse : 0, 6, delta);
    mesh.scale.x = MathUtils.damp(mesh.scale.x, active ? 1.18 * pulse : 0.4, 6, delta);
    mesh.scale.y = MathUtils.damp(mesh.scale.y, active ? 1.18 * pulse : 0.4, 6, delta);
    mesh.scale.z = 1;

    const material = mesh.material;

    if ("opacity" in material) {
      material.opacity = MathUtils.damp(material.opacity, active ? 0.11 : 0, 6, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} renderOrder={10}>
        <sphereGeometry args={[0.92, 20, 20]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        color={glowColor}
        distance={9}
        intensity={0}
      />
    </group>
  );
}
