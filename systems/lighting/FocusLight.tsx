"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Object3D, SpotLight, Vector3 } from "three";

import type { ExperienceStage } from "@/systems/ExperienceDirector";

type FocusLightProps = {
  active: boolean;
  stage: ExperienceStage;
  target: readonly [number, number, number] | null;
};

export function FocusLight({ active, stage, target }: FocusLightProps) {
  const lightRef = useRef<SpotLight>(null);
  const anchorRef = useRef<Object3D>(null);
  const lightPosition = useMemo(() => new Vector3(0, 4.8, 8.6), []);
  const targetPosition = useMemo(() => new Vector3(0, 0, 0), []);
  const offset = useMemo(() => new Vector3(0, 3.4, 4.8), []);

  useFrame((_, delta) => {
    const light = lightRef.current;
    const anchor = anchorRef.current;

    if (!light || !anchor) {
      return;
    }

    if (light.target !== anchor) {
      light.target = anchor;
    }

    if (target) {
      targetPosition.set(target[0], target[1] + 0.45, target[2]);
    } else {
      targetPosition.set(0, 0, 0);
    }

    const activeIntensity =
      active && target
        ? stage === "focus"
          ? 16
          : stage === "case-study"
            ? 12
            : 8
        : 0;

    lightPosition.lerp(
      target
        ? targetPosition.clone().add(offset)
        : new Vector3(0, 4.8, 8.6),
      1 - Math.pow(0.06, delta),
    );
    light.position.copy(lightPosition);
    anchor.position.lerp(targetPosition, 1 - Math.pow(0.08, delta));
    light.intensity = MathUtils.damp(light.intensity, activeIntensity, 4.8, delta);
    light.angle = MathUtils.damp(
      light.angle,
      target ? 0.34 : 0.26,
      4.2,
      delta,
    );
    light.penumbra = MathUtils.damp(light.penumbra, target ? 0.78 : 0.64, 4.2, delta);
    light.target.updateMatrixWorld();
  });

  return (
    <>
      <object3D ref={anchorRef} />
      <spotLight
        ref={lightRef}
        color="#f8fbff"
        distance={28}
        angle={0.26}
        penumbra={0.64}
        decay={1.35}
        intensity={0}
        castShadow={false}
      />
    </>
  );
}
