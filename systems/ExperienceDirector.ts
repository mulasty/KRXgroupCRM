"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type ExperienceStage = "intro" | "explore" | "focus" | "case-study";

type FocusTarget = readonly [number, number, number] | null;

type ExperienceBaseState = {
  progress: number;
  selectionActive: boolean;
  focusTarget: FocusTarget;
};

export type ExperienceDirectorState = ExperienceBaseState & {
  stage: ExperienceStage;
  camera: {
    dolly: number;
    lift: number;
    fov: number;
    targetDistance: number;
  };
  lighting: {
    ambient: number;
    wash: number;
    focus: number;
  };
  postfx: {
    bloomBoost: number;
    grainOpacity: number;
    vignetteDarkness: number;
    aberrationScale: number;
    bokehScale: number;
    targetDistance: number;
  };
  particles: {
    activity: number;
    opacity: number;
    size: number;
    drift: number;
    spin: number;
  };
};

const DEFAULT_BASE_STATE: ExperienceBaseState = {
  progress: 0,
  selectionActive: false,
  focusTarget: null,
};

let baseState = DEFAULT_BASE_STATE;
let snapshot = computeExperienceState(baseState);
const listeners = new Set<() => void>();

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function equalFocusTarget(a: FocusTarget, b: FocusTarget) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

function stageFromState(progress: number, selectionActive: boolean): ExperienceStage {
  if (progress >= 0.8) {
    return "case-study";
  }

  if (selectionActive || progress >= 0.6) {
    return "focus";
  }

  if (progress >= 0.2) {
    return "explore";
  }

  return "intro";
}

function computeExperienceState(state: ExperienceBaseState): ExperienceDirectorState {
  const stage = stageFromState(state.progress, state.selectionActive);

  switch (stage) {
    case "intro":
      return {
        ...state,
        stage,
        camera: {
          dolly: 1.1,
          lift: 0.3,
          fov: 35.5,
          targetDistance: 13.5,
        },
        lighting: {
          ambient: 0.08,
          wash: 4,
          focus: 0,
        },
        postfx: {
          bloomBoost: 0.9,
          grainOpacity: 0.022,
          vignetteDarkness: 0.72,
          aberrationScale: 0.9,
          bokehScale: 1.6,
          targetDistance: 13.5,
        },
        particles: {
          activity: 0.72,
          opacity: 0.2,
          size: 0.86,
          drift: 0.82,
          spin: 0.76,
        },
      };
    case "explore":
      return {
        ...state,
        stage,
        camera: {
          dolly: 0.2,
          lift: 0.08,
          fov: 36.4,
          targetDistance: 11.5,
        },
        lighting: {
          ambient: 0.12,
          wash: 8.5,
          focus: 1.8,
        },
        postfx: {
          bloomBoost: 1.1,
          grainOpacity: 0.028,
          vignetteDarkness: 0.76,
          aberrationScale: 1,
          bokehScale: 2,
          targetDistance: 11.5,
        },
        particles: {
          activity: 1.14,
          opacity: 0.38,
          size: 1.08,
          drift: 1.18,
          spin: 1.12,
        },
      };
    case "focus":
      return {
        ...state,
        stage,
        camera: {
          dolly: state.selectionActive ? -1.55 : -1.15,
          lift: 0.26,
          fov: state.selectionActive ? 30.5 : 31.8,
          targetDistance: state.selectionActive ? 8.2 : 9.4,
        },
        lighting: {
          ambient: 0.1,
          wash: 6.5,
          focus: state.selectionActive ? 15 : 8,
        },
        postfx: {
          bloomBoost: 1.18,
          grainOpacity: 0.024,
          vignetteDarkness: 0.82,
          aberrationScale: 0.88,
          bokehScale: state.selectionActive ? 2.5 : 2.2,
          targetDistance: state.selectionActive ? 8.2 : 9.4,
        },
        particles: {
          activity: 0.96,
          opacity: 0.3,
          size: 0.98,
          drift: 0.96,
          spin: 0.92,
        },
      };
    case "case-study":
    default:
      return {
        ...state,
        stage,
        camera: {
          dolly: -2.1,
          lift: 0.44,
          fov: 28.6,
          targetDistance: 6.6,
        },
        lighting: {
          ambient: 0.06,
          wash: 4.8,
          focus: 9,
        },
        postfx: {
          bloomBoost: 0.96,
          grainOpacity: 0.022,
          vignetteDarkness: 0.88,
          aberrationScale: 0.72,
          bokehScale: 2.35,
          targetDistance: 6.6,
        },
        particles: {
          activity: 0.68,
          opacity: 0.16,
          size: 0.82,
          drift: 0.7,
          spin: 0.74,
        },
      };
  }
}

function emit() {
  snapshot = computeExperienceState(baseState);
  listeners.forEach((listener) => listener());
}

export function setExperienceProgress(progress: number) {
  const nextProgress = clamp01(progress);

  if (nextProgress === baseState.progress) {
    return;
  }

  baseState = {
    ...baseState,
    progress: nextProgress,
  };
  emit();
}

export function setExperienceSelection(
  selectionActive: boolean,
  focusTarget: FocusTarget = null,
) {
  if (
    selectionActive === baseState.selectionActive &&
    equalFocusTarget(focusTarget, baseState.focusTarget)
  ) {
    return;
  }

  baseState = {
    ...baseState,
    selectionActive,
    focusTarget,
  };
  emit();
}

export function resetExperienceDirector() {
  baseState = DEFAULT_BASE_STATE;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

export function useExperienceDirector() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function ExperienceDirectorController({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: "#portfolio-scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        setExperienceProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return () => {
      resetExperienceDirector();
    };
  }, [enabled]);

  return null;
}
