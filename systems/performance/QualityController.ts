"use client";

import { performanceProfiles } from "@/lib/site-data";
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
  cooldownTicks: number;
};

const TIER_ORDER: DeviceTier[] = ["low", "medium", "high"];

const FALLBACK_PROFILES = {
  portfolio: {
    initialTierCap: "high" as const,
    tiers: {
      high: {
        canvasDpr: 1.85,
        particleCount: 30000,
        shaderIntensity: 1,
        postfx: {
          bloomEnabled: true,
          bloomScale: 1,
          dofEnabled: true,
          grainScale: 1,
          aberrationScale: 1,
          multisampling: 4,
        },
      },
      medium: {
        canvasDpr: 1.4,
        particleCount: 15000,
        shaderIntensity: 0.84,
        postfx: {
          bloomEnabled: true,
          bloomScale: 0.72,
          dofEnabled: false,
          grainScale: 0.8,
          aberrationScale: 0.78,
          multisampling: 0,
        },
      },
      low: {
        canvasDpr: 1,
        particleCount: 8000,
        shaderIntensity: 0.68,
        postfx: {
          bloomEnabled: false,
          bloomScale: 0,
          dofEnabled: false,
          grainScale: 0.6,
          aberrationScale: 0.55,
          multisampling: 0,
        },
      },
    },
  },
  playground: {
    initialTierCap: "high" as const,
    tiers: {
      high: {
        canvasDpr: 1.7,
        particleCount: 30000,
        shaderIntensity: 1,
        postfx: {
          bloomEnabled: true,
          bloomScale: 1,
          dofEnabled: true,
          grainScale: 1,
          aberrationScale: 1,
          multisampling: 4,
        },
      },
      medium: {
        canvasDpr: 1.3,
        particleCount: 15000,
        shaderIntensity: 0.84,
        postfx: {
          bloomEnabled: true,
          bloomScale: 0.72,
          dofEnabled: false,
          grainScale: 0.8,
          aberrationScale: 0.78,
          multisampling: 0,
        },
      },
      low: {
        canvasDpr: 1,
        particleCount: 8000,
        shaderIntensity: 0.68,
        postfx: {
          bloomEnabled: false,
          bloomScale: 0,
          dofEnabled: false,
          grainScale: 0.6,
          aberrationScale: 0.55,
          multisampling: 0,
        },
      },
    },
  },
};

function hasRuntimePerformanceProfiles(
  value: unknown,
): value is {
  portfolio: { initialTierCap: DeviceTier; tiers: Record<DeviceTier, QualityProfile> };
  playground: { initialTierCap: DeviceTier; tiers: Record<DeviceTier, QualityProfile> };
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return ["portfolio", "playground"].every((preset) => {
    const presetValue = candidate[preset];

    if (!presetValue || typeof presetValue !== "object") {
      return false;
    }

    const presetRecord = presetValue as Record<string, unknown>;
    return typeof presetRecord.initialTierCap === "string" && !!presetRecord.tiers;
  });
}

function getRuntimeProfiles() {
  return hasRuntimePerformanceProfiles(performanceProfiles) ? performanceProfiles : FALLBACK_PROFILES;
}

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
    cooldownTicks: state.cooldownTicks,
  };
}

export function createInitialQualityState(deviceTier: DeviceTier): QualityState {
  return {
    deviceTier,
    qualityTier: deviceTier,
    lowFpsStreak: 0,
    highFpsStreak: 0,
    cooldownTicks: 0,
  };
}

export function getInitialQualityTier(
  preset: PerformancePreset,
  deviceTier: DeviceTier,
): DeviceTier {
  return clampTierToDevice(getRuntimeProfiles()[preset].initialTierCap, deviceTier);
}

export function updateQualityState(state: QualityState, averageFps: number): QualityState {
  let lowFpsStreak = state.lowFpsStreak;
  let highFpsStreak = state.highFpsStreak;
  let qualityTier = state.qualityTier;
  let cooldownTicks = Math.max(0, state.cooldownTicks - 1);

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

  if (cooldownTicks === 0) {
    if (averageFps < 42 && qualityTier !== "low") {
      qualityTier = downgradeTier(qualityTier);
      lowFpsStreak = 0;
      highFpsStreak = 0;
      cooldownTicks = 6;
    } else if (lowFpsStreak >= 3 && qualityTier !== "low") {
      qualityTier = downgradeTier(qualityTier);
      lowFpsStreak = 0;
      highFpsStreak = 0;
      cooldownTicks = 6;
    } else if (highFpsStreak >= 6 && qualityTier !== state.deviceTier) {
      qualityTier = upgradeTier(qualityTier, state.deviceTier);
      lowFpsStreak = 0;
      highFpsStreak = 0;
      cooldownTicks = 6;
    }
  }

  return {
    deviceTier: state.deviceTier,
    qualityTier: clampTierToDevice(qualityTier, state.deviceTier),
    lowFpsStreak,
    highFpsStreak,
    cooldownTicks,
  };
}

export function getQualityProfile(
  tier: DeviceTier,
  preset: PerformancePreset,
): QualityProfile {
  const resolvedTier = tier === "high" || tier === "medium" ? tier : "low";
  const profile = getRuntimeProfiles()[preset].tiers[resolvedTier];

  return {
    tier: resolvedTier,
    ...profile,
  };
}
