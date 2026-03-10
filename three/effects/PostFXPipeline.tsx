"use client";

import { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";

import { useExperienceDirector } from "@/systems/ExperienceDirector";
import { usePerformanceEngine } from "@/systems/performance/PerformanceEngine";
import { UniverseBloom } from "@/three/effects/UniverseBloom";
import { UniverseColorFX } from "@/three/effects/UniverseColorFX";
import { UniverseDOF } from "@/three/effects/UniverseDOF";
import { UniverseGrain } from "@/three/effects/UniverseGrain";

export type PostFXPreset = "portfolio" | "playground";

type PostFXPipelineProps = {
  preset?: PostFXPreset;
  qualityHint?: number;
  focusTarget?: readonly [number, number, number];
  targetDistance?: number;
};

export function PostFXPipeline({
  preset = "portfolio",
  qualityHint = 1.5,
  focusTarget,
  targetDistance,
}: PostFXPipelineProps) {
  const gl = useThree((state) => state.gl);
  const experience = useExperienceDirector();
  const performance = usePerformanceEngine();

  const settings = useMemo(() => {
    const pixelRatio = Math.max(gl.getPixelRatio(), qualityHint ?? 1);
    const highDensity = pixelRatio > 1.5;
    const reducedFx = performance.qualityTier !== "high";
    const directorState = preset === "portfolio" ? experience : null;
    const baseTargetDistance =
      targetDistance ?? directorState?.postfx.targetDistance ?? (preset === "portfolio" ? 12 : 4.5);
    const intensityScale = highDensity ? 0.82 : 1;
    const bloomBoost = directorState?.postfx.bloomBoost ?? 1;
    const aberrationScale =
      (directorState?.postfx.aberrationScale ?? 1) * performance.quality.postfx.aberrationScale;

    return {
      bloomEnabled: performance.quality.postfx.bloomEnabled,
      bloomIntensity: 0.8 * intensityScale * bloomBoost * performance.quality.postfx.bloomScale,
      aberrationOffset: highDensity
        ? ([0.0004 * aberrationScale, 0.0008 * aberrationScale] as const)
        : ([0.0005 * aberrationScale, 0.001 * aberrationScale] as const),
      vignetteDarkness: directorState?.postfx.vignetteDarkness ?? (preset === "portfolio" ? 0.76 : 0.62),
      grainOpacity:
        (directorState?.postfx.grainOpacity ?? (highDensity ? 0.024 : 0.03)) *
        performance.quality.postfx.grainScale,
      dofEnabled: !reducedFx && performance.quality.postfx.dofEnabled,
      dofResolutionScale:
        performance.qualityTier === "low"
          ? 0.35
          : reducedFx
            ? 0.4
            : preset === "portfolio"
              ? 0.72
              : 0.8,
      focusDistance: preset === "portfolio" ? 0.02 : 0.018,
      focalLength: reducedFx ? 0.012 : 0.015,
      bokehScale:
        reducedFx
          ? 1.2
          : (directorState?.postfx.bokehScale ?? 2) * performance.quality.shaderIntensity,
      multisampling: performance.quality.postfx.multisampling,
      targetDistance: baseTargetDistance,
    };
  }, [experience, gl, performance.quality, performance.qualityTier, preset, qualityHint, targetDistance]);

  const resolvedFocusTarget =
    preset === "portfolio" ? focusTarget ?? experience.focusTarget ?? undefined : focusTarget;

  return (
    <EffectComposer multisampling={settings.multisampling}>
      <UniverseBloom enabled={settings.bloomEnabled} intensity={settings.bloomIntensity} />
      <UniverseDOF
        enabled={settings.dofEnabled}
        focusTarget={resolvedFocusTarget}
        targetDistance={settings.targetDistance}
        focusDistance={settings.focusDistance}
        focalLength={settings.focalLength}
        bokehScale={settings.bokehScale}
        resolutionScale={settings.dofResolutionScale}
      />
      <UniverseColorFX
        aberrationOffset={settings.aberrationOffset}
        vignetteDarkness={settings.vignetteDarkness}
      />
      <UniverseGrain opacity={settings.grainOpacity} />
    </EffectComposer>
  );
}
