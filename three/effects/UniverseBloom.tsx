"use client";

import { Bloom } from "@react-three/postprocessing";

type UniverseBloomProps = {
  enabled?: boolean;
  intensity: number;
};

export function UniverseBloom({ enabled = true, intensity }: UniverseBloomProps) {
  if (!enabled) {
    return null;
  }

  return (
    <Bloom
      intensity={intensity}
      luminanceThreshold={0.35}
      luminanceSmoothing={0.2}
      mipmapBlur
    />
  );
}
