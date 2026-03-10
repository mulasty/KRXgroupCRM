"use client";

import { startTransition, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Float } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Group,
  PointLight,
  Vector3,
} from "three";
import { useRouter } from "next/navigation";

import { designSystem, visualEffects } from "@/lib/site-data";
import { CosmicNoiseMaterial } from "@/shaders/cosmic-noise";
import { usePortfolioEngine } from "@/systems/PortfolioEngine";
import { CameraFlight } from "@/three/universe/CameraFlight";
import { ConstellationLinks } from "@/three/universe/ConstellationLinks";
import { GalaxyParticles } from "@/three/universe/GalaxyParticles";
import { type GalaxyLayout, type GalaxyNode } from "@/three/universe/GalaxyGenerator";
import { ProjectNode } from "@/three/universe/ProjectNode";

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function NebulaField() {
  const group = useRef<Group>(null);
  const geometry = useMemo(() => {
    const count = Math.min(15000, visualEffects.nebula.maxParticles);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = visualEffects.nebula.colors.map((entry) => new Color(entry));

    for (let index = 0; index < count; index += 1) {
      const seed = index + 1;
      const radius = Math.pow(seededUnit(seed * 1.23), 0.55) * visualEffects.nebula.fieldRadius;
      const angle = seededUnit(seed * 2.41) * Math.PI * 2;
      const height = (seededUnit(seed * 3.77) - 0.5) * 14;
      const depth = (seededUnit(seed * 4.51) - 0.5) * visualEffects.nebula.depth * 2;

      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = height;
      positions[index * 3 + 2] = depth;

      const color = palette[index % palette.length].clone().lerp(new Color("#ffffff"), 0.08);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }

    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(positions, 3));
    buffer.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return buffer;
  }, []);

  useFrame((_, delta) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y += delta * visualEffects.nebula.rotationSpeed;
    group.current.rotation.x += delta * visualEffects.nebula.rotationSpeed * 0.12;
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          transparent
          vertexColors
          size={visualEffects.nebula.pointSize}
          sizeAttenuation
          opacity={visualEffects.nebula.opacity}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
}

function NoiseBackground() {
  const materialRef = useRef<InstanceType<typeof CosmicNoiseMaterial> | null>(null);

  useFrame((state) => {
    const material = materialRef.current;

    if (!material) {
      return;
    }

    material.uniforms.uTime.value = state.clock.getElapsedTime() * visualEffects.noiseBackground.speed;
  });

  return (
    <mesh position={[0, 0, -52]}>
      <planeGeometry args={[180, 110, 1, 1]} />
      <cosmicNoiseMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uOpacity={visualEffects.noiseBackground.intensity}
        uColorA={visualEffects.noiseBackground.palette[0]}
        uColorB={visualEffects.noiseBackground.palette[1]}
        uColorC={visualEffects.noiseBackground.palette[2]}
      />
    </mesh>
  );
}

function CinematicBeams() {
  const beams = useMemo(
    () =>
      Array.from({ length: visualEffects.lightBeams.count }, (_, index) => ({
        position: [
          Math.cos(index * 1.7) * 14,
          3 + index * 1.1,
          -4 - index * 6,
        ] as [number, number, number],
        rotation: [0.16 + index * 0.05, index * 0.34, 0.12] as [number, number, number],
        color: visualEffects.lightBeams.colors[index % visualEffects.lightBeams.colors.length],
      })),
    [],
  );

  return (
    <group>
      {beams.map((beam, index) => (
        <Float key={beam.color + index} speed={1 + index * 0.15} rotationIntensity={0.02} floatIntensity={0.08}>
          <mesh position={beam.position} rotation={beam.rotation}>
            <coneGeometry args={[0.85 + index * 0.12, visualEffects.lightBeams.length, 24, 1, true]} />
            <meshBasicMaterial
              color={beam.color}
              transparent
              opacity={visualEffects.lightBeams.opacity}
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function ClusterBeacons({ layout }: { layout: GalaxyLayout }) {
  const entries = Object.entries(layout.clusterCenters) as Array<
    [keyof typeof layout.clusterCenters, Vector3]
  >;

  return (
    <group>
      {entries.map(([cluster, position]) => (
        <group key={cluster} position={position}>
          <mesh>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshBasicMaterial
              color={designSystem.colors.clusters[cluster]}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight color={designSystem.colors.clusters[cluster]} intensity={8} distance={10} />
        </group>
      ))}
    </group>
  );
}

function FocusLight({
  targetNode,
  boost,
}: {
  targetNode: GalaxyNode | null;
  boost: number;
}) {
  const lightRef = useRef<PointLight>(null);
  const anchor = useRef(new Vector3(0, 4, 6));

  useFrame((_, delta) => {
    if (!lightRef.current) {
      return;
    }

    const goal = targetNode
      ? targetNode.position.clone().add(new Vector3(0, 2.2, 2.4))
      : new Vector3(0, 4, 6);

    anchor.current.lerp(goal, 1 - Math.pow(0.02, delta));
    lightRef.current.position.copy(anchor.current);
    lightRef.current.intensity += ((targetNode ? 12 * boost : 4) - lightRef.current.intensity) * 0.08;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 4, 6]}
      distance={18}
      intensity={4}
      color="#f5fbff"
    />
  );
}

export function DesignUniverse() {
  const router = useRouter();
  const {
    layout,
    nodes,
    hoveredSlug,
    hoveredNode,
    selectedSlug,
    selectedNode,
    interaction,
    setHoveredSlug,
    selectNode,
    clearSelection,
  } = usePortfolioEngine();
  const pendingNavigation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    return () => {
      pendingNavigation.current?.kill();
      clearSelection();
    };
  }, [clearSelection]);

  useEffect(() => {
    if (!selectedSlug) {
      return;
    }

    pendingNavigation.current?.kill();
    pendingNavigation.current = gsap.delayedCall(1.05, () => {
      startTransition(() => {
        router.push(`/projects/${selectedSlug}`);
      });
    });

    return () => {
      pendingNavigation.current?.kill();
    };
  }, [router, selectedSlug]);

  return (
    <>
      <CameraFlight layout={layout} focusNode={selectedNode} />

      <ambientLight intensity={0.18} />
      <pointLight position={[8, 6, 10]} intensity={34} color="#ffffff" />
      <pointLight position={[-10, 4, -8]} intensity={22} color="#8cc8ff" />
      <pointLight position={[6, -2, -18]} intensity={18} color="#ffb86e" />
      <FocusLight targetNode={selectedNode ?? hoveredNode} boost={interaction.focusLightBoost} />

      <Environment preset="night" blur={0.92} />
      <NoiseBackground />
      <GalaxyParticles />
      <NebulaField />
      <CinematicBeams />
      <ClusterBeacons layout={layout} />

      <group>
        {nodes.map((node) => (
          <ProjectNode
            key={node.project.slug}
            project={node.project}
            node={node}
            hovered={hoveredSlug === node.project.slug}
            focused={selectedSlug === node.project.slug}
            hoverScale={interaction.hoverScale}
            focusLightBoost={interaction.focusLightBoost}
            cursorGravityStrength={interaction.cursorGravityStrength}
            onHoverChange={setHoveredSlug}
            onSelect={selectNode}
          />
        ))}
      </group>
      <ConstellationLinks nodes={nodes} />

      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.14} luminanceSmoothing={0.72} intensity={0.94} />
        <Noise opacity={0.028} />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>
    </>
  );
}
