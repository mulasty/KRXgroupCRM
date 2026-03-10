"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector2, Vector3 } from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";

export function CameraIdleMotion({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const experience = useExperienceDirector();
  const appliedOffset = useRef(new Vector3());
  const targetOffset = useRef(new Vector3());
  const driftOffset = useRef(new Vector3());
  const orbitOffset = useRef(new Vector3());
  const lastPointer = useRef(new Vector2());
  const lastInteractionAt = useRef(0);
  const tempPointer = useMemo(() => new Vector2(), []);

  useFrame((state, delta) => {
    if (!enabled) {
      return;
    }

    const camera = state.camera;
    const time = state.clock.getElapsedTime();

    camera.position.sub(appliedOffset.current);

    tempPointer.set(state.pointer.x, state.pointer.y);

    if (tempPointer.distanceToSquared(lastPointer.current) > 0.000004) {
      lastInteractionAt.current = time;
      lastPointer.current.copy(tempPointer);
    }

    const idleWindow = Math.max(0, time - lastInteractionAt.current - 0.45);
    const idleMix = MathUtils.clamp(idleWindow / 2.2, 0, 1);
    const stageScale =
      experience.stage === "intro"
        ? 0.65
        : experience.stage === "explore"
          ? 1
          : experience.stage === "focus"
            ? 0.42
            : 0.24;
    const selectionScale = experience.selectionActive ? 0.22 : 1;
    const intensity = idleMix * stageScale * selectionScale;

    driftOffset.current.set(
      Math.sin(time * 0.18 + 0.8) * 0.16 + Math.cos(time * 0.34) * 0.04,
      Math.sin(time * 0.22 + 1.7) * 0.1 + Math.cos(time * 0.17 + 0.4) * 0.03,
      Math.cos(time * 0.14 + 0.3) * 0.12,
    ).multiplyScalar(intensity);

    orbitOffset.current.set(
      Math.cos(time * 0.1 + 0.35) * 0.24,
      0,
      Math.sin(time * 0.1 + 0.35) * 0.18,
    ).multiplyScalar(intensity);

    targetOffset.current.copy(driftOffset.current).add(orbitOffset.current);
    appliedOffset.current.x = MathUtils.damp(appliedOffset.current.x, targetOffset.current.x, 2.8, delta);
    appliedOffset.current.y = MathUtils.damp(appliedOffset.current.y, targetOffset.current.y, 2.8, delta);
    appliedOffset.current.z = MathUtils.damp(appliedOffset.current.z, targetOffset.current.z, 2.8, delta);

    camera.position.add(appliedOffset.current);
  });

  return null;
}
