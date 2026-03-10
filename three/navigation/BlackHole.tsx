"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";

import "@/three/navigation/BlackHoleMaterial";
import { AccretionDisk } from "@/three/navigation/AccretionDisk";

type BlackHoleProps = {
  active: boolean;
  progress: number;
  intensity: number;
  anchorNdc: readonly [number, number] | null;
  anchorSize: readonly [number, number] | null;
};

export function BlackHole({
  active,
  progress,
  intensity,
  anchorNdc,
  anchorSize,
}: BlackHoleProps) {
  const viewport = useThree((state) => state.viewport);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<any>(null);
  const anchor = useMemo(() => new Vector3(), []);
  const center = useMemo(() => new Vector3(0, 0, 0), []);
  const target = useMemo(() => new Vector3(), []);
  const appliedScale = useRef(0.001);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const material = materialRef.current;

    if (!group || !material) {
      return;
    }

    const ndcX = anchorNdc?.[0] ?? 0;
    const ndcY = anchorNdc?.[1] ?? 0;
    anchor.set(ndcX * viewport.width * 0.5, ndcY * viewport.height * 0.5, 0);

    const sink = MathUtils.smoothstep(progress, 0.16, 0.96);
    target.lerpVectors(anchor, center, sink);

    group.visible = active;
    group.position.x = MathUtils.damp(group.position.x, target.x, 4.8, delta);
    group.position.y = MathUtils.damp(group.position.y, target.y, 4.8, delta);
    group.position.z = 0;

    const baseRadius = Math.max(anchorSize?.[0] ?? 0.14, anchorSize?.[1] ?? 0.14);
    const targetScale = (0.28 + baseRadius * viewport.width * 0.22) * (0.9 + progress * 4.1);

    appliedScale.current = MathUtils.damp(
      appliedScale.current,
      active ? targetScale : 0.001,
      5.4,
      delta,
    );
    group.scale.setScalar(appliedScale.current);

    group.rotation.z += delta * (0.14 + intensity * 0.06);

    material.uniforms.time.value = state.clock.getElapsedTime();
    material.uniforms.progress.value = MathUtils.damp(material.uniforms.progress.value, progress, 6, delta);
    material.uniforms.distortionStrength.value = MathUtils.damp(
      material.uniforms.distortionStrength.value,
      intensity,
      6,
      delta,
    );
  });

  return (
    <group ref={groupRef} renderOrder={15}>
      <AccretionDisk progress={progress} intensity={intensity} />
      <mesh>
        <sphereGeometry args={[1, 48, 48]} />
        <blackHoleMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
