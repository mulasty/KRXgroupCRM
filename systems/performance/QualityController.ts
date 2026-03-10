"use client";

import type { DeviceTier } from "@/systems/performance/DeviceTierDetector";

export type PerformancePreset = "portfolio" | "playground";

export type QualityProfile = {
  tier: DeviceTier;
  canvasDpr: number;
  particleCount: number;
  shaderIntensity: number;
  postfx: {
    bloomEnabled: boolean;
    bloomScale: number;
    dofEnabled: boolean;
    grainScale: number;
    aberrationScale: number;
    multisampling: number;
  };
};

type QualityState = {
  deviceTier: DeviceTier;
  qualityTier: DeviceTier;
  lowFpsStreak: number;
  highFpsStreak: number;
};

const TIER_ORDER: DeviceTier[] = ["low", "medium", "high"];

function clampTierToDevice(tier: DeviceTier, deviceTier: DeviceTier) {
  return TIER_ORDER[Math.min(TIER_ORDER.indexOf(tier), TIER_ORDER.indexOf(deviceTier))];
}

function downgradeTier(tier: DeviceTier) {
  return TIER_ORDER[Math.max(0, TIER_ORDER.indexOf(tier) - 1)];
}

function upgradeTier(tier: DeviceTier, deviceTier: DeviceTier) {
  return clampTierToDevice(
    TIER_ORDER[Math.min(TIER_ORDER.length - 1, TIER_ORDER.indexOf(tier) + 1)],
    deviceTier,
  );
}

export function syncQualityStateDevice(state: QualityState, deviceTier: DeviceTier): QualityState {
  return {
    deviceTier,
    qualityTier: clampTierToDevice(state.qualityTier, deviceTier),
    lowFpsStreak: state.lowFpsStreak,
    highFpsStreak: state.highFpsStreak,
  };
}

export function createInitialQualityState(deviceTier: DeviceTier): QualityState {
  return {
    deviceTier,
    qualityTier: deviceTier,
    lowFpsStreak: 0,
    highFpsStreak: 0,
  };
}

export function updateQualityState(state: QualityState, averageFps: number): QualityState {
  let lowFpsStreak = state.lowFpsStreak;
  let highFpsStreak = state.highFpsStreak;
  let qualityTier = state.qualityTier;

  if (averageFps < 50) {
    lowFpsStreak += 1;
    highFpsStreak = 0;
  } else if (averageFps > 58) {
    highFpsStreak += 1;
    lowFpsStreak = 0;
  } else {
    lowFpsStreak = 0;
    highFpsStreak = 0;
  }

  if (averageFps < 44 && qualityTier !== "low") {
    qualityTier = downgradeTier(qualityTier);
    lowFpsStreak = 0;
    highFpsStreak = 0;
  } else if (lowFpsStreak >= 2 && qualityTier !== "low") {
    qualityTier = downgradeTier(qualityTier);
    lowFpsStreak = 0;
    highFpsStreak = 0;
  } else if (highFpsStreak >= 3 && qualityTier !== state.deviceTier) {
    qualityTier = upgradeTier(qualityTier, state.deviceTier);
    lowFpsStreak = 0;
    highFpsStreak = 0;
  }

  return {
    deviceTier: state.deviceTier,
    qualityTier: clampTierToDevice(qualityTier, state.deviceTier),
    lowFpsStreak,
    highFpsStreak,
  };
}

export function getQualityProfile(
  tier: DeviceTier,
  preset: PerformancePreset,
): QualityProfile {
  const isPortfolio = preset === "portfolio";

  switch (tier) {
    case "high":
      return {
        tier,
        canvasDpr: isPortfolio ? 1.3 : 1.2,
        particleCount: 15000,
        shaderIntensity: 0.92,
        postfx: {
          bloomEnabled: true,
          bloomScale: 0.82,
          dofEnabled: true,
          grainScale: 0.9,
          aberrationScale: 0.88,
          multisampling: 0,
        },
      };
    case "medium":
      return {
        tier,
        canvasDpr: isPortfolio ? 1.15 : 1.1,
        particleCount: 9000,
        shaderIntensity: 0.78,
        postfx: {
          bloomEnabled: true,
          bloomScale: 0.48,
          dofEnabled: false,
          grainScale: 0.72,
          aberrationScale: 0.68,
          multisampling: 0,
        },
      };
    case "low":
    default:
      return {
        tier: "low",
        canvasDpr: 1,
        particleCount: 4500,
        shaderIntensity: 0.6,
        postfx: {
          bloomEnabled: false,
          bloomScale: 0,
          dofEnabled: false,
          grainScale: 0.52,
          aberrationScale: 0.48,
          multisampling: 0,
        },
      };
  }
}
