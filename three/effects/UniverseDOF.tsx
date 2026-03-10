"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { DepthOfField } from "@react-three/postprocessing";
import { Vector3 } from "three";

type UniverseDOFProps = {
  enabled?: boolean;
  focusTarget?: readonly [number, number, number];
  targetDistance: number;
  focusDistance: number;
  focalLength: number;
  bokehScale: number;
  resolutionScale: number;
};

export function UniverseDOF({
  enabled = true,
  focusTarget,
  targetDistance,
  focusDistance,
  focalLength,
  bokehScale,
  resolutionScale,
}: UniverseDOFProps) {
  const target = useMemo(() => new Vector3(), []);
  const direction = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    target.set(focusTarget[0], focusTarget[1], focusTarget[2]);
  }, [focusTarget, target]);

  useFrame(({ camera }) => {
    if (focusTarget) {
      return;
    }

    camera.getWorldDirection(direction);
    target.copy(camera.position).add(direction.multiplyScalar(targetDistance));
  });

  if (!enabled) {
    return null;
  }

  return (
    <DepthOfField
      target={target}
      focusDistance={focusDistance}
      focalLength={focalLength}
      bokehScale={bokehScale}
      resolutionScale={resolutionScale}
    />
  );
}
