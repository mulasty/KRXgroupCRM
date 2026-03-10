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
  return clampTierToDevice(performanceProfiles[preset].initialTierCap, deviceTier);
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
  const profile = performanceProfiles[preset].tiers[resolvedTier];

  return {
    tier: resolvedTier,
    ...profile,
  };
}
