"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { Group, MathUtils } from "three";

import { ReactiveSurfaceMaterial } from "@/shaders/reactive-surface";

export function PlaygroundScene() {
  const materialRef = useRef<InstanceType<typeof ReactiveSurfaceMaterial> | null>(null);
  const knot = useRef<Group>(null);

  useFrame((state, delta) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uPointer.value.set(
      MathUtils.mapLinear(state.pointer.x, -1, 1, 0, 1),
      MathUtils.mapLinear(state.pointer.y, -1, 1, 1, 0),
    );

    if (knot.current) {
      knot.current.rotation.x += delta * 0.14;
      knot.current.rotation.y += delta * 0.22;
    }
  });

  return (
    <>
      <color attach="background" args={["#06080c"]} />
      <fog attach="fog" args={["#06080c", 3, 12]} />
      <ambientLight intensity={0.18} />
      <pointLight position={[2.8, 2.6, 2.4]} intensity={24} color="#8cc8ff" />
      <pointLight position={[-3, -1, 1]} intensity={18} color="#ffb86e" />
      <Environment preset="city" blur={0.95} />

      <mesh rotation={[-0.55, 0, 0]} position={[0, -0.1, -0.4]}>
        <planeGeometry args={[6.4, 4.2, 160, 160]} />
        <reactiveSurfaceMaterial ref={materialRef} transparent />
      </mesh>

      <group ref={knot} position={[0, 0.65, 1.2]}>
        <mesh>
          <torusKnotGeometry args={[0.62, 0.18, 180, 24]} />
          <meshPhysicalMaterial
            color="#cad6e3"
            roughness={0.1}
            metalness={0.78}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </mesh>
      </group>

      <Sparkles count={160} scale={[9, 5, 4]} size={2.2} speed={0.45} opacity={0.24} />
    </>
  );
}
