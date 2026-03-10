"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AmbientLight, MathUtils, PointLight, Vector3 } from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";

export function ExperienceLightingRig() {
  const experience = useExperienceDirector();
  const ambientRef = useRef<AmbientLight>(null);
  const washRef = useRef<PointLight>(null);
  const focusRef = useRef<PointLight>(null);
  const focusAnchor = useMemo(() => new Vector3(0, 2.8, 4.5), []);
  const target = useMemo(() => new Vector3(), []);

  useFrame((state, delta) => {
    if (ambientRef.current) {
      ambientRef.current.intensity = MathUtils.damp(
        ambientRef.current.intensity,
        experience.lighting.ambient,
        4,
        delta,
      );
    }

    if (washRef.current) {
      washRef.current.intensity = MathUtils.damp(
        washRef.current.intensity,
        experience.lighting.wash,
        4.2,
        delta,
      );
      washRef.current.position.x = MathUtils.damp(
        washRef.current.position.x,
        state.camera.position.x * 0.45,
        3.4,
        delta,
      );
      washRef.current.position.z = MathUtils.damp(
        washRef.current.position.z,
        state.camera.position.z + 7,
        3.4,
        delta,
      );
    }

    if (focusRef.current) {
      if (experience.focusTarget) {
        target.set(
          experience.focusTarget[0],
          experience.focusTarget[1] + 1.9,
          experience.focusTarget[2] + 2.6,
        );
      } else {
        target.set(state.camera.position.x, state.camera.position.y + 2.2, state.camera.position.z + 5.5);
      }

      focusAnchor.lerp(target, 1 - Math.pow(0.04, delta));
      focusRef.current.position.copy(focusAnchor);
      focusRef.current.intensity = MathUtils.damp(
        focusRef.current.intensity,
        experience.lighting.focus,
        4.4,
        delta,
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} color="#eef5ff" />
      <pointLight
        ref={washRef}
        position={[0, 6, 8]}
        intensity={0}
        distance={42}
        color="#74adff"
      />
      <pointLight
        ref={focusRef}
        position={[0, 2.8, 4.5]}
        intensity={0}
        distance={16}
        color="#f9fbff"
      />
    </>
  );
}
