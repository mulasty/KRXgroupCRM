"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { usePathname } from "next/navigation";
import { Box3, Camera, MathUtils, Object3D, Vector3 } from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";

export type TransitionType = "liquid-warp" | "particle-dissolve" | "hybrid" | "black-hole";

type TransitionAnchor = {
  ndc: readonly [number, number] | null;
  size: readonly [number, number] | null;
  accent: string | null;
};

export type TransitionState = {
  active: boolean;
  progress: number;
  durationMs: number;
  intensity: number;
  type: TransitionType;
  cycle: number;
  anchorNdc: readonly [number, number] | null;
  anchorSize: readonly [number, number] | null;
  accent: string | null;
};

type StartTransitionOptions = {
  durationMs?: number;
  intensity?: number;
  type?: TransitionType;
  forceRestart?: boolean;
};

const DEFAULT_STATE: TransitionState = {
  active: false,
  progress: 0,
  durationMs: 1500,
  intensity: 1,
  type: "hybrid",
  cycle: 0,
  anchorNdc: null,
  anchorSize: null,
  accent: null,
};

let transitionState = DEFAULT_STATE;
let transitionStartedAt = 0;
let transitionFrame = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function stopFrameLoop() {
  if (!transitionFrame) {
    return;
  }

  window.cancelAnimationFrame(transitionFrame);
  transitionFrame = 0;
}

function updateTransitionProgress(now: number) {
  const durationMs = Math.max(1, transitionState.durationMs);
  const progress = MathUtils.clamp((now - transitionStartedAt) / durationMs, 0, 1);

  transitionState = {
    ...transitionState,
    progress,
    active: progress < 1,
  };
  emit();

  if (progress >= 1) {
    stopFrameLoop();
    return;
  }

  transitionFrame = window.requestAnimationFrame(updateTransitionProgress);
}

function ensureFrameLoop() {
  if (transitionFrame) {
    return;
  }

  transitionFrame = window.requestAnimationFrame(updateTransitionProgress);
}

function sameTuple(
  a: readonly [number, number] | null,
  b: readonly [number, number] | null,
  epsilon = 0.0005,
) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
}

export function getTransitionSnapshot() {
  return transitionState;
}

export function startTransition({
  durationMs = 1500,
  intensity = 1,
  type = "hybrid",
  forceRestart = false,
}: StartTransitionOptions = {}) {
  if (transitionState.active && !forceRestart) {
    const mergedType =
      transitionState.type === type
        ? transitionState.type
        : transitionState.type === "black-hole" || type === "black-hole"
          ? "black-hole"
          : "hybrid";

    transitionState = {
      ...transitionState,
      durationMs: Math.max(transitionState.durationMs, durationMs),
      intensity: Math.max(transitionState.intensity, intensity),
      type: mergedType,
    };
    emit();
    ensureFrameLoop();
    return transitionState;
  }

  transitionStartedAt = window.performance.now();
  transitionState = {
    ...transitionState,
    active: true,
    progress: 0,
    durationMs,
    intensity,
    type,
    cycle: transitionState.cycle + 1,
  };
  emit();
  stopFrameLoop();
  ensureFrameLoop();
  return transitionState;
}

export function clearTransition() {
  stopFrameLoop();

  transitionStartedAt = 0;
  transitionState = {
    ...transitionState,
    active: false,
    progress: 0,
    anchorNdc: null,
    anchorSize: null,
    accent: null,
  };
  emit();
}

export function setTransitionAnchor(anchor: TransitionAnchor) {
  if (
    sameTuple(transitionState.anchorNdc, anchor.ndc) &&
    sameTuple(transitionState.anchorSize, anchor.size, 0.002) &&
    transitionState.accent === anchor.accent
  ) {
    return;
  }

  transitionState = {
    ...transitionState,
    anchorNdc: anchor.ndc,
    anchorSize: anchor.size,
    accent: anchor.accent,
  };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useTransitionManager() {
  return useSyncExternalStore(subscribe, getTransitionSnapshot, getTransitionSnapshot);
}

export function TransitionSelectionBridge() {
  const pathname = usePathname();
  const experience = useExperienceDirector();
  const wasSelectedRef = useRef(false);

  useEffect(() => {
    if (pathname !== "/") {
      wasSelectedRef.current = experience.selectionActive;
      return;
    }

    if (!wasSelectedRef.current && experience.selectionActive) {
      startTransition({ type: "black-hole", durationMs: 2300, intensity: 1.18, forceRestart: true });
    }

    wasSelectedRef.current = experience.selectionActive;
  }, [experience.selectionActive, pathname]);

  return null;
}

export function TransitionNavigationBridge() {
  const pathname = usePathname();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      const href = anchor?.getAttribute("href");

      if (!href || pathname !== "/" || !href.startsWith("/projects/")) {
        return;
      }

      startTransition({ type: "black-hole", durationMs: 2300, intensity: 1.18, forceRestart: true });
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [pathname]);

  return null;
}

function isProjectMockup(object: Object3D) {
  return object.userData?.lightingRole === "project-mockup";
}

function projectBoundsToNdc(
  target: Object3D,
  camera: Camera,
  box: Box3,
  center: Vector3,
  size: Vector3,
  points: Vector3[],
  projectedPoint: Vector3,
) {
  box.setFromObject(target);

  if (box.isEmpty()) {
    return null;
  }

  box.getCenter(center);
  box.getSize(size);

  const halfX = size.x * 0.5;
  const halfY = size.y * 0.5;
  const halfZ = size.z * 0.5;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const cornerValues = [
    [-halfX, -halfY, -halfZ],
    [-halfX, -halfY, halfZ],
    [-halfX, halfY, -halfZ],
    [-halfX, halfY, halfZ],
    [halfX, -halfY, -halfZ],
    [halfX, -halfY, halfZ],
    [halfX, halfY, -halfZ],
    [halfX, halfY, halfZ],
  ] as const;

  cornerValues.forEach(([x, y, z], index) => {
    points[index].set(center.x + x, center.y + y, center.z + z).project(camera);
    minX = Math.min(minX, points[index].x);
    minY = Math.min(minY, points[index].y);
    maxX = Math.max(maxX, points[index].x);
    maxY = Math.max(maxY, points[index].y);
  });

  projectedPoint.copy(center).project(camera);

  return {
    ndc: [
      MathUtils.clamp(projectedPoint.x, -1, 1),
      MathUtils.clamp(projectedPoint.y, -1, 1),
    ] as const,
    size: [
      MathUtils.clamp(maxX - minX, 0.08, 0.62),
      MathUtils.clamp(maxY - minY, 0.08, 0.62),
    ] as const,
  };
}

export function TransitionSceneBridge() {
  const experience = useExperienceDirector();
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const projectRoots = useRef<Object3D[]>([]);
  const rebuildCounter = useRef(0);
  const focusPoint = useMemo(() => new Vector3(), []);
  const candidatePoint = useMemo(() => new Vector3(), []);
  const box = useMemo(() => new Box3(), []);
  const center = useMemo(() => new Vector3(), []);
  const size = useMemo(() => new Vector3(), []);
  const projectedCenter = useMemo(() => new Vector3(), []);
  const corners = useMemo(() => Array.from({ length: 8 }, () => new Vector3()), []);

  useFrame(() => {
    if (!experience.selectionActive || !experience.focusTarget) {
      return;
    }

    if (rebuildCounter.current <= 0 || projectRoots.current.length === 0) {
      const nextRoots: Object3D[] = [];

      scene.traverse((object) => {
        if (isProjectMockup(object)) {
          nextRoots.push(object);
        }
      });

      projectRoots.current = nextRoots;
      rebuildCounter.current = 36;
    } else {
      rebuildCounter.current -= 1;
    }

    focusPoint.set(
      experience.focusTarget[0],
      experience.focusTarget[1],
      experience.focusTarget[2],
    );

    let bestTarget: Object3D | null = null;
    let bestDistance = Infinity;

    projectRoots.current.forEach((object) => {
      object.getWorldPosition(candidatePoint);
      const distance = candidatePoint.distanceToSquared(focusPoint);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestTarget = object;
      }
    });

    if (!bestTarget) {
      return;
    }

    const projection = projectBoundsToNdc(
      bestTarget,
      camera,
      box,
      center,
      size,
      corners,
      projectedCenter,
    );

    if (!projection) {
      return;
    }

    const target = bestTarget as Object3D;
    const accent =
      typeof target.userData?.accent === "string"
        ? target.userData.accent
        : null;

    setTransitionAnchor({
      ndc: projection.ndc,
      size: projection.size,
      accent,
    });
  });

  return null;
}
