"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DirectionalLight,
  MathUtils,
  Object3D,
  Vector3,
} from "three";

import type { ExperienceStage } from "@/systems/ExperienceDirector";

type RimLightProps = {
  stage: ExperienceStage;
  hoveredObject: Object3D | null;
  focusTarget: readonly [number, number, number] | null;
};

export function RimLight({
  stage,
  hoveredObject,
  focusTarget,
}: RimLightProps) {
  const lightRef = useRef<DirectionalLight>(null);
  const targetRef = useRef<Object3D>(null);
  const lightPosition = useMemo(() => new Vector3(-6, 5, -8), []);
  const targetPosition = useMemo(() => new Vector3(0, 0, 0), []);
  const hoveredPosition = useMemo(() => new Vector3(), []);
  const fromCamera = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    const light = lightRef.current;
    const target = targetRef.current;

    if (!light || !target) {
      return;
    }

    if (light.target !== target) {
      light.target = target;
    }

    if (focusTarget) {
      targetPosition.set(focusTarget[0], focusTarget[1], focusTarget[2]);
    } else if (hoveredObject) {
      hoveredObject.getWorldPosition(hoveredPosition);
      targetPosition.copy(hoveredPosition);
    } else {
      targetPosition.set(state.camera.position.x * 0.2, 0, state.camera.position.z - 8);
    }

    fromCamera.copy(targetPosition).sub(state.camera.position).normalize();
    lightPosition.lerp(
      targetPosition.clone().add(fromCamera.multiplyScalar(9)).add(new Vector3(-1.8, 3.2, 0)),
      1 - Math.pow(0.05, delta),
    );
    light.position.copy(lightPosition);
    target.position.lerp(targetPosition, 1 - Math.pow(0.08, delta));

    const intensity =
      focusTarget
        ? stage === "focus"
          ? 1.6
          : 1.15
        : hoveredObject
          ? 0.9
          : 0.36;

    light.intensity = MathUtils.damp(light.intensity, intensity, 4.5, delta);
    light.target.updateMatrixWorld();
  });

  return (
    <>
      <object3D ref={targetRef} />
      <directionalLight
        ref={lightRef}
        color="#c9d8ff"
        intensity={0.36}
      />
    </>
  );
}
