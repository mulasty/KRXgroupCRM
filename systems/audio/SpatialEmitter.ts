"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Object3D, Raycaster, Vector3 } from "three";

import { useAudioEngine } from "@/systems/audio/AudioEngine";

function findAudioTarget(object: Object3D | null) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData?.audioRole === "project-mockup") {
      return current;
    }

    current = current.parent;
  }

  return null;
}

export function SpatialEmitter({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  const {
    ready,
    setListenerTransform,
    setSpatialEmitter,
    playHoverProjectSound,
  } = useAudioEngine();
  const raycaster = useMemo(() => new Raycaster(), []);
  const forward = useMemo(() => new Vector3(), []);
  const worldPosition = useMemo(() => new Vector3(), []);
  const lastSlug = useRef<string | null>(null);
  const raycastFrame = useRef(0);
  const activeTarget = useRef<Object3D | null>(null);

  useEffect(() => {
    return () => {
      setSpatialEmitter({ active: false });
    };
  }, [setSpatialEmitter]);

  useFrame((state) => {
    if (!enabled || !ready) {
      return;
    }

    state.camera.getWorldDirection(forward);
    setListenerTransform(state.camera.position, forward, state.camera.up);

    raycastFrame.current += 1;

    if (raycastFrame.current % 3 === 0) {
      raycaster.setFromCamera(state.pointer, state.camera);
      const intersections = raycaster.intersectObjects(state.scene.children, true);

      let target: Object3D | null = null;

      for (const hit of intersections) {
        const candidate = findAudioTarget(hit.object);

        if (candidate) {
          target = candidate;
          break;
        }
      }

      activeTarget.current = target;
    }

    const target = activeTarget.current;

    if (!target) {
      lastSlug.current = null;
      setSpatialEmitter({ active: false });
      return;
    }

    target.getWorldPosition(worldPosition);

    const slug =
      typeof target.userData.slug === "string" ? (target.userData.slug as string) : null;

    if (slug && slug !== lastSlug.current) {
      lastSlug.current = slug;
      void playHoverProjectSound(0.78);
    }

    setSpatialEmitter({
      active: true,
      position: worldPosition,
      intensity: 0.88,
    });
  });

  return null;
}
