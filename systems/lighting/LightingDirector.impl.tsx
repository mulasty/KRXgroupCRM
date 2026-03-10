"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AmbientLight,
  MathUtils,
  Mesh,
  Object3D,
  Raycaster,
  Vector3,
} from "three";

import { useExperienceDirector } from "@/systems/ExperienceDirector";
import { FocusLight } from "@/systems/lighting/FocusLight";
import { HoverGlow } from "@/systems/lighting/HoverGlow";
import { RimLight } from "@/systems/lighting/RimLight";

function findLightingRoot(object: Object3D | null) {
  let current: Object3D | null = object;

  while (current) {
    if (current.userData?.lightingRole === "project-mockup") {
      return current;
    }

    current = current.parent;
  }

  return null;
}

function collectInteractiveMeshes(root: Object3D) {
  const meshes: Mesh[] = [];

  root.traverse((object) => {
    if (object.userData?.lightingRole === "project-mockup") {
      object.traverse((child) => {
        if (child instanceof Mesh) {
          meshes.push(child);
        }
      });
    }
  });

  return meshes;
}

export function LightingDirector() {
  const experience = useExperienceDirector();
  const ambientRef = useRef<AmbientLight>(null);
  const raycaster = useMemo(() => new Raycaster(), []);
  const lastCameraPosition = useMemo(() => new Vector3(), []);
  const initializedCamera = useRef(false);
  const interactiveMeshes = useRef<Mesh[]>([]);
  const rebuildCountdown = useRef(0);
  const hoveredRef = useRef<Object3D | null>(null);
  const raycastFrame = useRef(0);
  const [hoveredObject, setHoveredObject] = useState<Object3D | null>(null);

  useFrame((state, delta) => {
    if (rebuildCountdown.current <= 0 || interactiveMeshes.current.length === 0) {
      interactiveMeshes.current = collectInteractiveMeshes(state.scene);
      rebuildCountdown.current = 120;
    } else {
      rebuildCountdown.current -= 1;
    }

    raycastFrame.current += 1;

    if (raycastFrame.current % 2 === 0) {
      raycaster.setFromCamera(state.pointer, state.camera);
      const hits = raycaster.intersectObjects(interactiveMeshes.current, false);
      let nextHovered: Object3D | null = null;

      for (const hit of hits) {
        const root = findLightingRoot(hit.object);

        if (root) {
          nextHovered = root;
          break;
        }
      }

      if (nextHovered !== hoveredRef.current) {
        hoveredRef.current = nextHovered;
        setHoveredObject(nextHovered);
      }
    }

    if (ambientRef.current) {
      if (!initializedCamera.current) {
        lastCameraPosition.copy(state.camera.position);
        initializedCamera.current = true;
      }

      const cameraSpeed =
        lastCameraPosition.distanceTo(state.camera.position) / Math.max(delta, 0.0001);
      lastCameraPosition.copy(state.camera.position);

      const baseAmbient =
        experience.stage === "intro"
          ? 0.018
          : experience.stage === "explore"
            ? 0.05
            : experience.stage === "focus"
              ? 0.038
              : 0.024;
      const motionBoost = Math.min(0.032, cameraSpeed * 0.004);
      const attentionBoost = experience.selectionActive ? 0.012 : hoveredRef.current ? 0.008 : 0;

      ambientRef.current.intensity = MathUtils.damp(
        ambientRef.current.intensity,
        baseAmbient + motionBoost + attentionBoost,
        4.5,
        delta,
      );
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.02} color="#edf4ff" />
      <FocusLight
        active={experience.selectionActive}
        stage={experience.stage}
        target={experience.focusTarget}
      />
      <HoverGlow targetObject={hoveredObject} />
      <RimLight
        stage={experience.stage}
        hoveredObject={hoveredObject}
        focusTarget={experience.focusTarget}
      />
    </>
  );
}
