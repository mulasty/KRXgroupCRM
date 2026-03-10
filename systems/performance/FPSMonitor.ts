"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export type FPSSample = {
  averageFps: number;
  frameTimeMs: number;
};

export function useFPSMonitor(onSample: (sample: FPSSample) => void) {
  const elapsedRef = useRef(0);
  const framesRef = useRef(0);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    framesRef.current += 1;

    if (elapsedRef.current < 1) {
      return;
    }

    const averageFps = framesRef.current / elapsedRef.current;
    const frameTimeMs = (elapsedRef.current * 1000) / Math.max(framesRef.current, 1);

    onSample({
      averageFps,
      frameTimeMs,
    });

    elapsedRef.current = 0;
    framesRef.current = 0;
  });
}
