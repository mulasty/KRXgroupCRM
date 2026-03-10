import { MathUtils, Vector3 } from "three";

import type { Project } from "@/lib/projects";
import type { HeroSceneBlueprint, ProjectCluster } from "@/lib/site-data";

export type GalaxyNode = {
  project: Project;
  cluster: ProjectCluster;
  clusterIndex: number;
  position: Vector3;
  rotation: [number, number, number];
  scale: number;
  orbitOffset: number;
};

export type GalaxyLayout = {
  nodes: GalaxyNode[];
  clusterCenters: Record<ProjectCluster, Vector3>;
  constellationSegments: Array<[Vector3, Vector3]>;
  pathAnchors: Vector3[];
  lookAnchors: Vector3[];
};

function seededUnit(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function clampToRadius(position: Vector3, radius: number) {
  const xzLength = Math.hypot(position.x, position.z);

  if (xzLength <= radius) {
    return position;
  }

  const scale = radius / xzLength;
  position.x *= scale;
  position.z *= scale;
  return position;
}

export function generateGalaxyLayout(
  projects: Project[],
  blueprint: HeroSceneBlueprint,
): GalaxyLayout {
  const radius = blueprint.galaxy.radius;
  const depth = blueprint.galaxy.depth;
  const clusterSpread = blueprint.galaxy.clusterSpread;
  const clusterOrder = blueprint.clusterOrder as ProjectCluster[];

  const grouped = new Map<ProjectCluster, Project[]>();

  clusterOrder.forEach((cluster) => grouped.set(cluster, []));
  projects.forEach((project) => {
    grouped.get(project.cluster)?.push(project);
  });

  const clusterCenters = {} as Record<ProjectCluster, Vector3>;

  clusterOrder.forEach((cluster, index) => {
    const t = clusterOrder.length === 1 ? 0 : index / (clusterOrder.length - 1);
    const angle = 0.55 + t * Math.PI * 1.52;
    const spiralRadius = radius * (0.34 + t * 0.18);
    const position = new Vector3(
      Math.cos(angle) * spiralRadius,
      Math.sin(angle * 1.85) * 4.2,
      MathUtils.lerp(2, -depth, t),
    );

    clusterCenters[cluster] = position;
  });

  const nodes: GalaxyNode[] = [];
  const constellationSegments: Array<[Vector3, Vector3]> = [];

  clusterOrder.forEach((cluster, clusterIndex) => {
    const clusterProjects = grouped.get(cluster) ?? [];
    const center = clusterCenters[cluster];
    const orderedNodes: GalaxyNode[] = [];

    clusterProjects.forEach((project, index) => {
      const seed = (clusterIndex + 1) * 100 + index * 13;
      const angle = index * (Math.PI * 0.92) + seededUnit(seed) * 0.8;
      const localRadius = 2.8 + index * 1.9 + seededUnit(seed + 2) * 1.25;
      const localDepth = Math.sin(angle * blueprint.galaxy.spiralTurns) * clusterSpread * 0.36;
      const localHeight = (seededUnit(seed + 4) - 0.5) * 4.6;
      const position = center
        .clone()
        .add(
          new Vector3(
            Math.cos(angle) * localRadius,
            localHeight,
            localDepth - index * 0.7,
          ),
        );

      clampToRadius(position, radius);
      position.z = MathUtils.clamp(position.z, -depth - 2, 6);

      const node: GalaxyNode = {
        project,
        cluster,
        clusterIndex,
        position,
        rotation: [
          (seededUnit(seed + 8) - 0.5) * 0.22,
          seededUnit(seed + 10) * Math.PI * 2,
          (seededUnit(seed + 12) - 0.5) * 0.16,
        ],
        scale: 0.96 + seededUnit(seed + 14) * 0.34,
        orbitOffset: seededUnit(seed + 16) * Math.PI * 2,
      };

      orderedNodes.push(node);
      nodes.push(node);
    });

    if (orderedNodes.length > 0) {
      constellationSegments.push([center.clone(), orderedNodes[0].position.clone()]);
    }

    for (let index = 0; index < orderedNodes.length - 1; index += 1) {
      constellationSegments.push([
        orderedNodes[index].position.clone(),
        orderedNodes[index + 1].position.clone(),
      ]);
    }
  });

  const heroPosition = new Vector3(...blueprint.camera.heroPosition);
  const pathAnchors = [
    heroPosition.clone(),
    clusterCenters.branding.clone().add(new Vector3(8, 2.4, 12)),
    clusterCenters.packaging.clone().add(new Vector3(5.6, 1.6, 9)),
    clusterCenters.video.clone().add(new Vector3(-4.8, 1.2, 7.2)),
    clusterCenters["social media"].clone().add(new Vector3(5, 1.8, 5.4)),
    new Vector3(-4.5, 3.4, -depth - 6),
  ];

  const lookAnchors = [
    new Vector3(0, 0.4, 0),
    clusterCenters.branding.clone(),
    clusterCenters.packaging.clone(),
    clusterCenters.video.clone(),
    clusterCenters["social media"].clone(),
    new Vector3(0, 1.2, -depth + 2),
  ];

  return {
    nodes,
    clusterCenters,
    constellationSegments,
    pathAnchors,
    lookAnchors,
  };
}
