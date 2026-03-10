import assetsManifestRaw from "@/assets_manifest.json";
import contentRaw from "@/data/content.json";
import designSystemRaw from "@/data/design_system.json";
import experienceFlowRaw from "@/data/experience_flow.json";
import performanceProfilesRaw from "@/data/performance_profiles.json";
import portfolioProjectsDatasetRaw from "@/data/portfolio_projects.json";
import projectClustersRaw from "@/data/project_clusters.json";
import servicesRaw from "@/data/services.json";
import siteNavigationRaw from "@/data/site_navigation.json";
import uiComponentsRaw from "@/data/ui_components.json";
import heroSceneBlueprintRaw from "@/hero_scene_blueprint.json";
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

export type SiteContent = {
  designer: SiteDataset["designer"];
  about: {
    title: string;
    body: string;
  };
  playground: {
    eyebrow: string;
    title: string[];
    description: string;
    experiments: Array<{
      title: string;
      caption: string;
    }>;
  };
};

export type SiteNavigationItem = {
  label: string;
  href: string;
};

export type SiteNavigation = {
  header: SiteNavigationItem[];
};

export type ProjectClusters = {
  order: ProjectCluster[];
  items: Record<
    ProjectCluster,
    {
      label: string;
      shortLabel: string;
      description: string;
    }
  >;
};

export type Services = {
  eyebrow: string;
  title: string;
  description: string;
  items: Array<{
    slug: string;
    title: string;
    summary: string;
    image: string;
    deliverables: string[];
  }>;
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

export type ExperienceStageKey = "intro" | "explore" | "focus" | "case-study";

export type ExperienceStageOverrides = Partial<{
  dolly: number;
  lift: number;
  fov: number;
  targetDistance: number;
  focus: number;
  bloomBoost: number;
  grainOpacity: number;
  vignetteDarkness: number;
  aberrationScale: number;
  bokehScale: number;
}>;

export type ExperienceFlow = {
  scrollTrigger: {
    trigger: string;
    start: string;
    end: string;
    scrub: number;
  };
  selectionPriority: {
    enabled: boolean;
    selectionStage: ExperienceStageKey;
    caseStudyThreshold: number;
  };
  stages: Array<{
    key: ExperienceStageKey;
    range: {
      start: number;
      end: number;
    };
    camera: {
      dolly: number;
      lift: number;
      fov: number;
      targetDistance: number;
      selected?: ExperienceStageOverrides;
    };
    lighting: {
      ambient: number;
      wash: number;
      focus: number;
      selected?: ExperienceStageOverrides;
    };
    postfx: {
      bloomBoost: number;
      grainOpacity: number;
      vignetteDarkness: number;
      aberrationScale: number;
      bokehScale: number;
      targetDistance: number;
      selected?: ExperienceStageOverrides;
    };
    particles: {
      activity: number;
      opacity: number;
      size: number;
      drift: number;
      spin: number;
    };
  }>;
};

export type PerformanceTierProfile = {
  canvasDpr: number;
  particleCount: number;
  shaderIntensity: number;
  postfx: {
    bloomEnabled: boolean;
    bloomScale: number;
    dofEnabled: boolean;
    grainScale: number;
    aberrationScale: number;
    multisampling: number;
  };
};

export type PerformanceProfiles = {
  portfolio: {
    initialTierCap: "high" | "medium" | "low";
    tiers: Record<"high" | "medium" | "low", PerformanceTierProfile>;
  };
  playground: {
    initialTierCap: "high" | "medium" | "low";
    tiers: Record<"high" | "medium" | "low", PerformanceTierProfile>;
  };
};

export type UIComponents = {
  home: {
    hero: {
      eyebrow: string;
      title: string[];
      description: string;
    };
    profile: {
      eyebrow: string;
      body: string;
      primaryCta: SiteNavigationItem;
      secondaryCta: SiteNavigationItem;
    };
    featured: {
      description: string;
      caseStudyCtaLabel: string;
    };
    about: {
      eyebrow: string;
      title: string;
      statements: string[];
      finalStage: {
        eyebrow: string;
        title: string;
        cta: SiteNavigationItem;
      };
    };
  };
};

const siteNavigationDataset = siteNavigationRaw as SiteNavigation;
const siteContent = contentRaw as SiteContent;

export const siteData = {
  designer: siteContent.designer,
  playground: {
    eyebrow: siteContent.playground.eyebrow,
    experiments: siteContent.playground.experiments,
  },
  navigation: siteNavigationDataset.header,
} as SiteDataset;
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
export const siteNavigation = siteNavigationDataset;
export const content = siteContent;
export const experienceFlow = experienceFlowRaw as ExperienceFlow;
export const performanceProfiles = performanceProfilesRaw as PerformanceProfiles;
export const projectClusters = projectClustersRaw as ProjectClusters;
export const services = servicesRaw as Services;
export const uiComponents = uiComponentsRaw as UIComponents;
export const heroSceneBlueprint = {
  ...(heroSceneBlueprintRaw as HeroSceneBlueprint),
  clusterOrder: projectClusters.order,
} as HeroSceneBlueprint;
export const visualEffects = visualEffectsRaw as VisualEffects;
