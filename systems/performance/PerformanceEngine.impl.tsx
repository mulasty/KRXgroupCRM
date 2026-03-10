"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useThree } from "@react-three/fiber";

import {
  detectDeviceTier,
  type DeviceTier,
  type DeviceTierInfo,
} from "@/systems/performance/DeviceTierDetector";
import { useFPSMonitor, type FPSSample } from "@/systems/performance/FPSMonitor";
import {
  createInitialQualityState,
  getQualityProfile,
  syncQualityStateDevice,
  updateQualityState,
  type PerformancePreset,
  type QualityProfile,
} from "@/systems/performance/QualityController";

type PerformanceEngineValue = {
  device: DeviceTierInfo;
  fps: FPSSample;
  qualityTier: DeviceTier;
  quality: QualityProfile;
};

const DEFAULT_DEVICE: DeviceTierInfo = {
  tier: "medium",
  hardwareConcurrency: 4,
  devicePixelRatio: 1,
  isWebGL2: true,
  maxTextureSize: 4096,
  maxSamples: 0,
};

const DEFAULT_FPS: FPSSample = {
  averageFps: 60,
  frameTimeMs: 16.6,
};

const DEFAULT_CONTEXT: PerformanceEngineValue = {
  device: DEFAULT_DEVICE,
  fps: DEFAULT_FPS,
  qualityTier: "medium",
  quality: getQualityProfile("medium", "portfolio"),
};

const PerformanceEngineContext = createContext<PerformanceEngineValue>(DEFAULT_CONTEXT);

export function usePerformanceEngine() {
  return useContext(PerformanceEngineContext);
}

export function PerformanceEngine({
  preset,
  children,
}: {
  preset: PerformancePreset;
  children: React.ReactNode;
}) {
  const gl = useThree((state) => state.gl);
  const setDpr = useThree((state) => state.setDpr);
  const device = useMemo(() => detectDeviceTier(gl), [gl]);
  const [fps, setFps] = useState<FPSSample>(DEFAULT_FPS);
  const [qualityState, setQualityState] = useState(() => {
    const initialTier =
      preset === "portfolio" && device.tier === "high" ? "medium" : device.tier;

    return createInitialQualityState(initialTier);
  });
  const syncedQualityState = useMemo(
    () => syncQualityStateDevice(qualityState, device.tier),
    [device.tier, qualityState],
  );

  const handleSample = useCallback((sample: FPSSample) => {
    setFps(sample);
    setQualityState((current) =>
      updateQualityState(syncQualityStateDevice(current, device.tier), sample.averageFps),
    );
  }, [device.tier]);

  useFPSMonitor(handleSample);

  const quality = useMemo(
    () => getQualityProfile(syncedQualityState.qualityTier, preset),
    [preset, syncedQualityState.qualityTier],
  );

  useEffect(() => {
    setDpr(quality.canvasDpr);
  }, [quality.canvasDpr, setDpr]);

  const value = useMemo(
    () => ({
      device,
      fps,
      qualityTier: syncedQualityState.qualityTier,
      quality,
    }),
    [device, fps, quality, syncedQualityState.qualityTier],
  );

  return (
    <PerformanceEngineContext.Provider value={value}>
      {children}
    </PerformanceEngineContext.Provider>
  );
}
