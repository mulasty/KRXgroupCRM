"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";
import { useTransitionManager } from "@/three/transitions/TransitionManager";

export function CameraChoreography({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const experience = useExperienceDirector();
  const transition = useTransitionManager();
  const appliedOffset = useRef(new Vector3());
  const targetOffset = useRef(new Vector3());
  const forward = useMemo(() => new Vector3(), []);
  const vertical = useMemo(() => new Vector3(0, 1, 0), []);
  const appliedFovDelta = useRef(0);

  useFrame((state, delta) => {
    if (!enabled) {
      return;
    }

    const camera = state.camera;
    const time = state.clock.getElapsedTime();

    camera.position.sub(appliedOffset.current);

    if (camera instanceof PerspectiveCamera) {
      camera.fov -= appliedFovDelta.current;
    }

    camera.getWorldDirection(forward);

    const focusMix = experience.selectionActive
      ? 1
      : experience.stage === "focus"
        ? 0.45
        : 0;
    const portalMix =
      transition.type === "black-hole"
        ? MathUtils.smoothstep(transition.progress, 0.08, 0.95)
        : 0;
    const breathing = Math.sin(time * 0.9 + 0.4) * 0.06 * focusMix;
    const forwardDistance = (0.68 + breathing) * focusMix + portalMix * 1.6;
    const lift = 0.12 * focusMix + portalMix * 0.08;

    targetOffset.current.copy(forward).multiplyScalar(forwardDistance);
    targetOffset.current.addScaledVector(vertical, lift);

    appliedOffset.current.x = MathUtils.damp(appliedOffset.current.x, targetOffset.current.x, 3.6, delta);
    appliedOffset.current.y = MathUtils.damp(appliedOffset.current.y, targetOffset.current.y, 3.6, delta);
    appliedOffset.current.z = MathUtils.damp(appliedOffset.current.z, targetOffset.current.z, 3.6, delta);

    camera.position.add(appliedOffset.current);

    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }

    const targetFovDelta = experience.selectionActive
      ? -1.15 - portalMix * 2.4
      : experience.stage === "focus"
        ? -0.45
        : 0;
    const nextFovDelta = MathUtils.damp(appliedFovDelta.current, targetFovDelta, 4, delta);

    camera.fov += nextFovDelta;
    appliedFovDelta.current = nextFovDelta;

    if (Math.abs(nextFovDelta) > 0.001 || Math.abs(targetFovDelta) > 0.001) {
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
