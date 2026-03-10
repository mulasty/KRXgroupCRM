"use client";

import type { WebGLRenderer } from "three";

export type DeviceTier = "high" | "medium" | "low";

export type DeviceTierInfo = {
  tier: DeviceTier;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  isWebGL2: boolean;
  maxTextureSize: number;
  maxSamples: number;
};

function scoreHardwareConcurrency(cores: number) {
  if (cores >= 8) {
    return 2;
  }

  if (cores >= 4) {
    return 1;
  }

  return -1;
}

function scorePixelRatio(pixelRatio: number) {
  if (pixelRatio <= 1.35) {
    return 1;
  }

  if (pixelRatio <= 2) {
    return 0;
  }

  return -1;
}

function scoreTextureBudget(maxTextureSize: number) {
  if (maxTextureSize >= 8192) {
    return 1;
  }

  if (maxTextureSize >= 4096) {
    return 0;
  }

  return -1;
}

function scoreSampling(maxSamples: number) {
  if (maxSamples >= 4) {
    return 1;
  }

  if (maxSamples >= 2) {
    return 0;
  }

  return -1;
}

export function detectDeviceTier(gl: WebGLRenderer): DeviceTierInfo {
  const hardwareConcurrency =
    typeof navigator !== "undefined" && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 4;
  const devicePixelRatio =
    typeof window !== "undefined" && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1;
  const isWebGL2 = gl.capabilities.isWebGL2;
  const maxTextureSize = gl.capabilities.maxTextureSize;
  const maxSamples = gl.capabilities.maxSamples;

  const score =
    scoreHardwareConcurrency(hardwareConcurrency) +
    scorePixelRatio(devicePixelRatio) +
    scoreTextureBudget(maxTextureSize) +
    scoreSampling(maxSamples) +
    (isWebGL2 ? 1 : -1);

  const tier: DeviceTier = score >= 4 ? "high" : score >= 1 ? "medium" : "low";

  return {
    tier,
    hardwareConcurrency,
    devicePixelRatio,
    isWebGL2,
    maxTextureSize,
    maxSamples,
  };
}
