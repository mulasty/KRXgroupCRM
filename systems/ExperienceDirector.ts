"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { experienceFlow } from "@/lib/site-data";

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
  if (progress >= experienceFlow.selectionPriority.caseStudyThreshold) {
    return "case-study";
  }

  if (selectionActive && experienceFlow.selectionPriority.enabled) {
    return experienceFlow.selectionPriority.selectionStage;
  }

  const matchedStage = experienceFlow.stages.find((stage) => {
    if (stage.key === "case-study") {
      return progress >= stage.range.start && progress <= stage.range.end;
    }

    return progress >= stage.range.start && progress < stage.range.end;
  });

  if (matchedStage) {
    return matchedStage.key;
  }

  return "intro";
}

function computeExperienceState(state: ExperienceBaseState): ExperienceDirectorState {
  const stage = stageFromState(state.progress, state.selectionActive);
  const stageConfig =
    experienceFlow.stages.find((entry) => entry.key === stage) ?? experienceFlow.stages[0];
  const selected =
    state.selectionActive && stage === experienceFlow.selectionPriority.selectionStage;
  const { selected: cameraSelected, ...cameraBase } = stageConfig.camera;
  const { selected: lightingSelected, ...lightingBase } = stageConfig.lighting;
  const { selected: postfxSelected, ...postfxBase } = stageConfig.postfx;

  return {
    ...state,
    stage,
    camera: {
      ...cameraBase,
      ...(selected ? cameraSelected ?? {} : {}),
    },
    lighting: {
      ...lightingBase,
      ...(selected ? lightingSelected ?? {} : {}),
    },
    postfx: {
      ...postfxBase,
      ...(selected ? postfxSelected ?? {} : {}),
    },
    particles: stageConfig.particles,
  };
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
      trigger: experienceFlow.scrollTrigger.trigger,
      start: experienceFlow.scrollTrigger.start,
      end: experienceFlow.scrollTrigger.end,
      scrub: experienceFlow.scrollTrigger.scrub,
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
