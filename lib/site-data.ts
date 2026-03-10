import assetsManifestRaw from "@/assets_manifest.json";
import portfolioProjectsDatasetRaw from "@/data/portfolio_projects.json";
import designSystemRaw from "@/design_system.json";
import heroSceneBlueprintRaw from "@/hero_scene_blueprint.json";
import siteDatasetRaw from "@/site_dataset.json";
import visualEffectsRaw from "@/visual_effects.json";

export type ProjectCluster = "branding" | "packaging" | "video" | "social media";
export type ProjectModel =
  | "jar"
  | "poster"
  | "billboard"
  | "box"
  | "tshirt"
  | "laptop"
  | "phone";

export type ProcessStep = {
  title: string;
  body: string;
};

export type PortfolioProjectTextures = {
  mockup: string;
  hero: string;
  gallery: string[];
};

export type PortfolioProjectDatasetRecord = {
  slug: string;
  index: string;
  title: string;
  client: string;
  year: string;
  cluster: ProjectCluster;
  category: string;
  excerpt: string;
  description: string;
  accent: string;
  palette: [string, string, string];
  mockup_type: ProjectModel;
  textures: PortfolioProjectTextures;
  metrics: string[];
  deliverables: string[];
  process: ProcessStep[];
};

export type PortfolioProjectRecord = PortfolioProjectDatasetRecord & {
  mockupType: ProjectModel;
  model: ProjectModel;
  texture: string;
  heroTexture: string;
  gallery: string[];
};

export type SiteDataset = {
  designer: {
    name: string;
    title: string;
    location: string;
    intro: string;
    about: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  playground: {
    eyebrow: string;
    experiments: Array<{
      title: string;
      caption: string;
    }>;
  };
};

export type AssetsManifest = {
  models: Record<
    ProjectModel,
    {
      path: string;
      dracoCompressed: boolean;
      label: {
        size: [number, number];
        position: [number, number, number];
        rotation: [number, number, number];
      };
    }
  >;
};

export type DesignSystem = typeof designSystemRaw;
export type HeroSceneBlueprint = typeof heroSceneBlueprintRaw;
export type VisualEffects = typeof visualEffectsRaw;

export const siteData = siteDatasetRaw as SiteDataset;
const rawPortfolioProjects = portfolioProjectsDatasetRaw as PortfolioProjectDatasetRecord[];

export const portfolioProjects: PortfolioProjectRecord[] = rawPortfolioProjects.map((project) => ({
  ...project,
  mockupType: project.mockup_type,
  model: project.mockup_type,
  texture: project.textures.mockup,
  heroTexture: project.textures.hero,
  gallery: project.textures.gallery,
}));
export const assetsManifest = assetsManifestRaw as AssetsManifest;
export const designSystem = designSystemRaw as DesignSystem;
export const heroSceneBlueprint = heroSceneBlueprintRaw as HeroSceneBlueprint;
export const visualEffects = visualEffectsRaw as VisualEffects;
