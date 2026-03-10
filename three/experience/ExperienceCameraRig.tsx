"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, Vector3 } from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";

export function ExperienceCameraRig() {
  const experience = useExperienceDirector();
  const direction = useMemo(() => new Vector3(), []);
  const appliedOffset = useRef(new Vector3());
  const appliedLift = useRef(0);

  useFrame((state, delta) => {
    const camera = state.camera;

    camera.position.sub(appliedOffset.current);
    camera.position.y -= appliedLift.current;

    camera.getWorldDirection(direction);
    appliedOffset.current.copy(direction).multiplyScalar(experience.camera.dolly);
    appliedLift.current = experience.camera.lift;

    camera.position.add(appliedOffset.current);
    camera.position.y += appliedLift.current;

    if (!(camera instanceof PerspectiveCamera)) {
      return;
    }

    const nextFov = MathUtils.damp(camera.fov, experience.camera.fov, 4.5, delta);

    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
