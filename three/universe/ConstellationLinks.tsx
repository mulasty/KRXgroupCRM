"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
} from "three";

import { designSystem } from "@/lib/site-data";
import type { GalaxyNode } from "@/three/universe/GalaxyGenerator";

type ConstellationLinksProps = {
  nodes: GalaxyNode[];
  distanceThreshold?: number;
  maxConnectionsPerNode?: number;
};

type LinkSegment = {
  from: GalaxyNode;
  to: GalaxyNode;
  strength: number;
};

function buildSegments(
  nodes: GalaxyNode[],
  distanceThreshold: number,
  maxConnectionsPerNode: number,
) {
  const segments: LinkSegment[] = [];
  const connectionCounts = new Map<string, number>();

  for (let index = 0; index < nodes.length; index += 1) {
    const current = nodes[index];
    const candidates: Array<{ node: GalaxyNode; distance: number }> = [];

    for (let candidateIndex = index + 1; candidateIndex < nodes.length; candidateIndex += 1) {
      const candidate = nodes[candidateIndex];
      const distance = current.position.distanceTo(candidate.position);

      if (distance > distanceThreshold) {
        continue;
      }

      if (current.cluster !== candidate.cluster && distance > distanceThreshold * 0.7) {
        continue;
      }

      candidates.push({ node: candidate, distance });
    }

    candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxConnectionsPerNode)
      .forEach(({ node, distance }) => {
        const fromCount = connectionCounts.get(current.project.slug) ?? 0;
        const toCount = connectionCounts.get(node.project.slug) ?? 0;

        if (fromCount >= maxConnectionsPerNode || toCount >= maxConnectionsPerNode) {
          return;
        }

        connectionCounts.set(current.project.slug, fromCount + 1);
        connectionCounts.set(node.project.slug, toCount + 1);

        segments.push({
          from: current,
          to: node,
          strength: 1 - distance / distanceThreshold,
        });
      });
  }

  return segments;
}

export function ConstellationLinks({
  nodes,
  distanceThreshold = 12,
  maxConnectionsPerNode = 2,
}: ConstellationLinksProps) {
  const lineRef = useRef<LineSegments>(null);
  const geometry = useMemo(() => {
    const segments = buildSegments(nodes, distanceThreshold, maxConnectionsPerNode);
    const positions = new Float32Array(segments.length * 6);
    const colors = new Float32Array(segments.length * 6);

    segments.forEach((segment, index) => {
      const offset = index * 6;
      const fromColor = new Color(designSystem.colors.clusters[segment.from.cluster])
        .lerp(new Color("#f3f8ff"), 0.55 + segment.strength * 0.12);
      const toColor = new Color(designSystem.colors.clusters[segment.to.cluster])
        .lerp(new Color("#f3f8ff"), 0.55 + segment.strength * 0.12);

      positions.set(segment.from.position.toArray(), offset);
      positions.set(segment.to.position.toArray(), offset + 3);

      colors.set(fromColor.toArray(), offset);
      colors.set(toColor.toArray(), offset + 3);
    });

    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(positions, 3));
    buffer.setAttribute("color", new Float32BufferAttribute(colors, 3));
    return buffer;
  }, [distanceThreshold, maxConnectionsPerNode, nodes]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useFrame((state, delta) => {
    const lines = lineRef.current;

    if (!lines) {
      return;
    }

    const material = lines.material as LineBasicMaterial;
    const targetOpacity = 0.08 + Math.sin(state.clock.getElapsedTime() * 0.7) * 0.02;

    material.opacity = MathUtils.damp(material.opacity, targetOpacity, 3.4, delta);
  });

  return (
    <lineSegments
      ref={lineRef}
      geometry={geometry}
      frustumCulled={false}
      renderOrder={-1}
    >
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.08}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </lineSegments>
  );
}
