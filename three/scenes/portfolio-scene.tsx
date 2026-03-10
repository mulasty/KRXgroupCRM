"use client";

import { SpatialEmitter } from "@/systems/audio/SpatialEmitter";
import { CameraChoreography } from "@/systems/camera/CameraChoreography";
import { CameraIdleMotion } from "@/systems/camera/CameraIdleMotion";
import { LightingDirector } from "@/systems/lighting/LightingDirector";
import { ExperienceCameraRig } from "@/three/experience/ExperienceCameraRig";
import { DesignUniverse } from "@/three/universe/DesignUniverse";

export function PortfolioScene() {
  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <fog attach="fog" args={["#06080c", 12, 72]} />
      <LightingDirector />
      <DesignUniverse />
      <ExperienceCameraRig />
      <CameraIdleMotion />
      <CameraChoreography />
      <SpatialEmitter />
    </>
  );
}
