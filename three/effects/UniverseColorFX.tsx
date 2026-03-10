"use client";

import { useMemo } from "react";
import { ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

type UniverseColorFXProps = {
  aberrationOffset: readonly [number, number];
  vignetteDarkness: number;
};

export function UniverseColorFX({
  aberrationOffset,
  vignetteDarkness,
}: UniverseColorFXProps) {
  const offset = useMemo(
    () => new Vector2(aberrationOffset[0], aberrationOffset[1]),
    [aberrationOffset],
  );

  return (
    <>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={offset}
        radialModulation={false}
      />
      <Vignette
        blendFunction={BlendFunction.NORMAL}
        eskil={false}
        offset={0.18}
        darkness={vignetteDarkness}
      />
    </>
  );
}
