"use client";

import { useGLTF } from "@react-three/drei";

import { assetsManifest } from "@/lib/site-data";
import type { Project } from "@/lib/projects";
import { LaptopMockup } from "@/three/mockups/LaptopMockup";
import { PackageMockup } from "@/three/mockups/PackageMockup";
import { PhoneMockup } from "@/three/mockups/PhoneMockup";
import { PosterMockup } from "@/three/mockups/PosterMockup";

type MockupFactoryProps = {
  project: Project;
  loadTexture: boolean;
};

export function MockupFactory({ project, loadTexture }: MockupFactoryProps) {
  let content: React.ReactNode;

  switch (project.mockupType) {
    case "poster":
    case "billboard":
      content = <PosterMockup project={project} loadTexture={loadTexture} />;
      break;
    case "laptop":
      content = <LaptopMockup project={project} loadTexture={loadTexture} />;
      break;
    case "phone":
      content = <PhoneMockup project={project} loadTexture={loadTexture} />;
      break;
    case "jar":
    case "box":
    case "tshirt":
    default:
      content = <PackageMockup project={project} loadTexture={loadTexture} />;
      break;
  }

  return (
    <group
      name={`project-mockup-${project.slug}`}
      userData={{
        audioRole: "project-mockup",
        lightingRole: "project-mockup",
        slug: project.slug,
        accent: project.accent,
      }}
    >
      {content}
    </group>
  );
}

Object.values(assetsManifest.models).forEach((manifest) => {
  useGLTF.preload(manifest.path, manifest.dracoCompressed ? "/draco-gltf/" : false);
});
