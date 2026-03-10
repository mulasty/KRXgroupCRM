"use client";

import { Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

type UniverseGrainProps = {
  opacity: number;
};

export function UniverseGrain({ opacity }: UniverseGrainProps) {
  return <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={opacity} />;
}
