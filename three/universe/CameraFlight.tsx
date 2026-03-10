"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CatmullRomCurve3, MathUtils, Vector3 } from "three";

import { heroSceneBlueprint } from "@/lib/site-data";
import type { GalaxyLayout, GalaxyNode } from "@/three/universe/GalaxyGenerator";

gsap.registerPlugin(ScrollTrigger);

type CameraFlightProps = {
  layout: GalaxyLayout;
  focusNode?: GalaxyNode | null;
};

export function CameraFlight({ layout, focusNode }: CameraFlightProps) {
  const scrollProgress = useRef(0);
  const focusState = useRef({ mix: 0 });
  const curve = useMemo(
    () => new CatmullRomCurve3(layout.pathAnchors, false, "centripetal", 0.5),
    [layout.pathAnchors],
  );
  const lookCurve = useMemo(
    () => new CatmullRomCurve3(layout.lookAnchors, false, "centripetal", 0.5),
    [layout.lookAnchors],
  );
  const focusOffset = useMemo(
    () => new Vector3(...heroSceneBlueprint.camera.focusOffset),
    [],
  );
  const tempLook = useRef(new Vector3());
  const tempFocusLook = useRef(new Vector3());

  useLayoutEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: "#portfolio-scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1,
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    gsap.to(focusState.current, {
      mix: focusNode ? 1 : 0,
      duration: 0.9,
      ease: "power3.out",
      overwrite: true,
    });
  }, [focusNode]);

  useFrame((state, delta) => {
    const camera = state.camera;
    const progress = MathUtils.clamp(scrollProgress.current, 0, 1);
    const basePosition = curve.getPointAt(progress);
    const lookProgress = Math.min(1, progress + heroSceneBlueprint.camera.lookAhead);
    const baseLook = lookCurve.getPointAt(lookProgress);
    const parallax = heroSceneBlueprint.galaxy.parallaxStrength;

    basePosition.x += state.pointer.x * parallax * 3.2;
    basePosition.y += state.pointer.y * parallax * 1.8;

    let destination = basePosition;
    let lookTarget = baseLook;

    if (focusNode) {
      destination = focusNode.position.clone().add(focusOffset);
      tempFocusLook.current.copy(focusNode.position);
      lookTarget = tempFocusLook.current;
    }

    const mix = focusState.current.mix;
    const nextX = MathUtils.lerp(basePosition.x, destination.x, mix);
    const nextY = MathUtils.lerp(basePosition.y, destination.y, mix);
    const nextZ = MathUtils.lerp(basePosition.z, destination.z, mix);

    camera.position.x = MathUtils.damp(
      camera.position.x,
      nextX,
      1 / heroSceneBlueprint.camera.damping,
      delta,
    );
    camera.position.y = MathUtils.damp(
      camera.position.y,
      nextY,
      1 / heroSceneBlueprint.camera.damping,
      delta,
    );
    camera.position.z = MathUtils.damp(
      camera.position.z,
      nextZ,
      1 / heroSceneBlueprint.camera.damping,
      delta,
    );

    tempLook.current.lerpVectors(baseLook, lookTarget, mix);
    camera.lookAt(tempLook.current);
  });

  return null;
}
