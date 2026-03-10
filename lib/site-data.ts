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
    image?: string;
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

const fallbackExperienceFlow: ExperienceFlow = {
  scrollTrigger: {
    trigger: "#portfolio-scroll",
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
  selectionPriority: {
    enabled: true,
    selectionStage: "focus",
    caseStudyThreshold: 0.8,
  },
  stages: [
    {
      key: "intro",
      range: { start: 0, end: 0.2 },
      camera: {
        dolly: 1.1,
        lift: 0.3,
        fov: 35.5,
        targetDistance: 13.5,
      },
      lighting: {
        ambient: 0.08,
        wash: 4,
        focus: 0,
      },
      postfx: {
        bloomBoost: 0.9,
        grainOpacity: 0.022,
        vignetteDarkness: 0.72,
        aberrationScale: 0.9,
        bokehScale: 1.6,
        targetDistance: 13.5,
      },
      particles: {
        activity: 0.72,
        opacity: 0.2,
        size: 0.86,
        drift: 0.82,
        spin: 0.76,
      },
    },
    {
      key: "explore",
      range: { start: 0.2, end: 0.6 },
      camera: {
        dolly: 0.2,
        lift: 0.08,
        fov: 36.4,
        targetDistance: 11.5,
      },
      lighting: {
        ambient: 0.12,
        wash: 8.5,
        focus: 1.8,
      },
      postfx: {
        bloomBoost: 1.1,
        grainOpacity: 0.028,
        vignetteDarkness: 0.76,
        aberrationScale: 1,
        bokehScale: 2,
        targetDistance: 11.5,
      },
      particles: {
        activity: 1.14,
        opacity: 0.38,
        size: 1.08,
        drift: 1.18,
        spin: 1.12,
      },
    },
    {
      key: "focus",
      range: { start: 0.6, end: 0.8 },
      camera: {
        dolly: -1.15,
        lift: 0.26,
        fov: 31.8,
        targetDistance: 9.4,
        selected: {
          dolly: -1.55,
          fov: 30.5,
          targetDistance: 8.2,
        },
      },
      lighting: {
        ambient: 0.1,
        wash: 6.5,
        focus: 8,
        selected: {
          focus: 15,
        },
      },
      postfx: {
        bloomBoost: 1.18,
        grainOpacity: 0.024,
        vignetteDarkness: 0.82,
        aberrationScale: 0.88,
        bokehScale: 2.2,
        targetDistance: 9.4,
        selected: {
          bokehScale: 2.5,
          targetDistance: 8.2,
        },
      },
      particles: {
        activity: 0.96,
        opacity: 0.3,
        size: 0.98,
        drift: 0.96,
        spin: 0.92,
      },
    },
    {
      key: "case-study",
      range: { start: 0.8, end: 1 },
      camera: {
        dolly: -2.1,
        lift: 0.44,
        fov: 28.6,
        targetDistance: 6.6,
      },
      lighting: {
        ambient: 0.06,
        wash: 4.8,
        focus: 9,
      },
      postfx: {
        bloomBoost: 0.96,
        grainOpacity: 0.022,
        vignetteDarkness: 0.88,
        aberrationScale: 0.72,
        bokehScale: 2.35,
        targetDistance: 6.6,
      },
      particles: {
        activity: 0.68,
        opacity: 0.16,
        size: 0.82,
        drift: 0.7,
        spin: 0.74,
      },
    },
  ],
};

const fallbackUiComponents: UIComponents = {
  home: {
    hero: {
      eyebrow: "Immersive portfolio",
      title: ["Visual identities", "staged as", "digital matter."],
      description:
        "The work unfolds across WebGL environments, editorial layouts, and mockups that materialize through particle-based assembly.",
    },
    profile: {
      eyebrow: "Profile",
      body:
        "The site behaves like an installation: slow camera travel, cinematic section changes, and premium material studies rather than flat project tiles.",
      primaryCta: {
        label: "Enter projects",
        href: "#featured",
      },
      secondaryCta: {
        label: "Explore playground",
        href: "/playground",
      },
    },
    featured: {
      description:
        "Scroll shifts the camera through a three-dimensional sequence of mockups. Each project lives at a different depth plane, while the matching artwork assembles from particles onto the object surface.",
      caseStudyCtaLabel: "Open case study",
    },
    about: {
      eyebrow: "About",
      title: "Design systems with editorial calm and a universe-scale point of view.",
      statements: [
        "Shader-led transitions replace hard cuts with atmospheric reveals.",
        "Mockups are treated like lit objects in a gallery, not screenshots in cards.",
        "Typography stays large, patient, and sharply composed across every section.",
        "The Playground expands the portfolio into a laboratory for motion and code.",
      ],
      finalStage: {
        eyebrow: "Final stage",
        title: "Scroll exits the galaxy into the Playground and studio context.",
        cta: {
          label: "Open playground",
          href: "/playground",
        },
      },
    },
  },
};

function hasRuntimeExperienceFlow(value: unknown): value is ExperienceFlow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return !!candidate.scrollTrigger && !!candidate.selectionPriority && Array.isArray(candidate.stages);
}

function hasRuntimeUiComponents(value: unknown): value is UIComponents {
  if (!value || typeof value !== "object") {
    return false;
  }

  return "home" in (value as Record<string, unknown>);
}

type LegacyPortfolioProjectsDataset = PortfolioProjectDatasetRecord[];

type RawPortfolioProjectRecord = {
  slug: string;
  title: string;
  year?: number | string;
  category?: string;
  cluster?: string;
  mockup_type?: string;
  priority?: number;
  summary?: string;
  intro?: string;
  tags?: string[];
  services?: string[];
  deliverables?: string[];
  client?: {
    name?: string;
  } | string;
  palette?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  textures?: {
    cover?: string;
    mockup?: string;
    gallery?: string[];
    thumbnail?: string;
  };
  case_study?: {
    challenge?: string;
    concept?: string;
    process?: string;
    result?: string;
  };
};

type RawPortfolioProjectsDataset = {
  version?: string;
  studio?: string;
  defaultLocale?: string;
  projects: RawPortfolioProjectRecord[];
};

const fallbackTextureSets: PortfolioProjectTextures[] = [
  {
    mockup: "/textures/krx-resonance.svg",
    hero: "/textures/krx-grid.svg",
    gallery: ["/textures/krx-signal.svg", "/textures/krx-frames.svg", "/textures/krx-resonance.svg"],
  },
  {
    mockup: "/textures/mula-atlas.svg",
    hero: "/textures/mula-lines.svg",
    gallery: ["/textures/mula-details.svg", "/textures/mula-sheet.svg", "/textures/mula-atlas.svg"],
  },
  {
    mockup: "/textures/aether-poster.svg",
    hero: "/textures/aether-field.svg",
    gallery: ["/textures/aether-scan.svg", "/textures/aether-type.svg", "/textures/aether-poster.svg"],
  },
  {
    mockup: "/textures/north-core.svg",
    hero: "/textures/north-grid.svg",
    gallery: ["/textures/north-core.svg", "/textures/krx-grid.svg", "/textures/north-grid.svg"],
  },
  {
    mockup: "/textures/framewear-drop.svg",
    hero: "/textures/framewear-motion.svg",
    gallery: ["/textures/framewear-drop.svg", "/textures/pulse-feed.svg", "/textures/framewear-motion.svg"],
  },
  {
    mockup: "/textures/lucid-launch.svg",
    hero: "/textures/lucid-spectrum.svg",
    gallery: ["/textures/lucid-launch.svg", "/textures/lucid-spectrum.svg", "/textures/krx-frames.svg"],
  },
  {
    mockup: "/textures/pulse-social.svg",
    hero: "/textures/pulse-feed.svg",
    gallery: ["/textures/pulse-social.svg", "/textures/pulse-feed.svg", "/textures/framewear-motion.svg"],
  },
];

function isLegacyPortfolioProjectRecord(
  project: PortfolioProjectDatasetRecord | RawPortfolioProjectRecord,
): project is PortfolioProjectDatasetRecord {
  return (
    "index" in project &&
    Boolean(project.textures) &&
    typeof (project.textures as PortfolioProjectTextures).hero === "string"
  );
}

function normalizeCluster(
  rawCluster: string | undefined,
  category: string | undefined,
  services: string[] = [],
  tags: string[] = [],
): ProjectCluster {
  const haystack = [rawCluster, category, ...services, ...tags].join(" ").toLowerCase();

  if (haystack.includes("social") || haystack.includes("mobile") || haystack.includes("content")) {
    return "social media";
  }

  if (
    haystack.includes("motion") ||
    haystack.includes("video") ||
    haystack.includes("broadcast") ||
    haystack.includes("poster")
  ) {
    return "video";
  }

  if (
    haystack.includes("pack") ||
    haystack.includes("label") ||
    haystack.includes("jar") ||
    haystack.includes("box")
  ) {
    return "packaging";
  }

  return "branding";
}

function normalizeMockupType(
  rawMockupType: string | undefined,
  category: string | undefined,
  tags: string[] = [],
): ProjectModel {
  const source = [rawMockupType, category, ...tags].join(" ").toLowerCase();

  if (source.includes("billboard")) {
    return "billboard";
  }

  if (source.includes("poster")) {
    return "poster";
  }

  if (source.includes("phone") || source.includes("mobile") || source.includes("social")) {
    return "phone";
  }

  if (source.includes("laptop") || source.includes("screen") || source.includes("website")) {
    return "laptop";
  }

  if (source.includes("shirt") || source.includes("tshirt") || source.includes("apparel")) {
    return "tshirt";
  }

  if (source.includes("jar")) {
    return "jar";
  }

  return "box";
}

function isUsableTexturePath(path: string | undefined) {
  return Boolean(path && (path.startsWith("/textures/") || path.startsWith("/images/")));
}

function resolveTextures(
  textures: RawPortfolioProjectRecord["textures"] | PortfolioProjectTextures | undefined,
  fallbackIndex: number,
): PortfolioProjectTextures {
  if (textures && "hero" in textures && isUsableTexturePath(textures.hero)) {
    return textures;
  }

  const fallback = fallbackTextureSets[fallbackIndex % fallbackTextureSets.length] ?? fallbackTextureSets[0];
  const mockup =
    textures && "mockup" in textures && isUsableTexturePath(textures.mockup)
      ? textures.mockup
      : fallback.mockup;
  const hero =
    textures && "cover" in textures && isUsableTexturePath(textures.cover)
      ? textures.cover
      : fallback.hero;
  const gallery =
    textures &&
    Array.isArray(textures.gallery) &&
    textures.gallery.length > 0 &&
    textures.gallery.every((entry) => isUsableTexturePath(entry))
      ? (textures.gallery as string[])
      : fallback.gallery;

  return {
    mockup: mockup ?? fallback.mockup,
    hero: hero ?? fallback.hero,
    gallery,
  };
}

function buildProcess(
  project: RawPortfolioProjectRecord,
  fallbackDescription: string,
): ProcessStep[] {
  const caseStudy = project.case_study;
  const steps = [
    { title: "Challenge", body: caseStudy?.challenge ?? fallbackDescription },
    { title: "Concept", body: caseStudy?.concept ?? project.summary ?? fallbackDescription },
    { title: "Process", body: caseStudy?.process ?? project.intro ?? fallbackDescription },
    { title: "Result", body: caseStudy?.result ?? project.summary ?? fallbackDescription },
  ].filter((step) => step.body && step.body.trim().length > 0);

  return steps.length > 0
    ? steps
    : [
        {
          title: "Overview",
          body: fallbackDescription,
        },
      ];
}

function normalizePortfolioProject(
  project: PortfolioProjectDatasetRecord | RawPortfolioProjectRecord,
  index: number,
): PortfolioProjectRecord {
  if (isLegacyPortfolioProjectRecord(project)) {
    return {
      ...project,
      mockupType: project.mockup_type,
      model: project.mockup_type,
      texture: project.textures.mockup,
      heroTexture: project.textures.hero,
      gallery: project.textures.gallery,
    };
  }

  const accent = project.palette?.accent ?? "#8cc8ff";
  const description =
    project.intro ??
    project.summary ??
    project.case_study?.concept ??
    "A portfolio project presented as part of the immersive design universe.";
  const cluster = normalizeCluster(project.cluster, project.category, project.services, project.tags);
  const mockupType = normalizeMockupType(project.mockup_type, project.category, project.tags);
  const textures = resolveTextures(project.textures, index);
  const deliverables = project.deliverables?.length
    ? project.deliverables
    : project.services?.length
      ? project.services
      : ["Identity system", "Art direction", "Launch assets"];

  return {
    slug: project.slug,
    index: String(project.priority ?? index + 1).padStart(2, "0"),
    title: project.title,
    client: typeof project.client === "string" ? project.client : project.client?.name ?? "Independent project",
    year: String(project.year ?? new Date().getFullYear()),
    cluster,
    category: project.category ?? "Brand Identity",
    excerpt: project.summary ?? description,
    description,
    accent,
    palette: [
      project.palette?.primary ?? "#090d14",
      project.palette?.secondary ?? "#f5f7fb",
      accent,
    ],
    mockup_type: mockupType,
    textures,
    metrics: (project.services?.length ? project.services : project.tags ?? []).slice(0, 3),
    deliverables,
    process: buildProcess(project, description),
    mockupType,
    model: mockupType,
    texture: textures.mockup,
    heroTexture: textures.hero,
    gallery: textures.gallery,
  };
}

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
const rawPortfolioProjectsDataset = portfolioProjectsDatasetRaw as
  | LegacyPortfolioProjectsDataset
  | RawPortfolioProjectsDataset;
const rawPortfolioProjects = Array.isArray(rawPortfolioProjectsDataset)
  ? rawPortfolioProjectsDataset
  : rawPortfolioProjectsDataset.projects;

export const portfolioProjects: PortfolioProjectRecord[] = rawPortfolioProjects.map((project, index) =>
  normalizePortfolioProject(project, index),
);
export const assetsManifest = assetsManifestRaw as AssetsManifest;
export const designSystem = designSystemRaw as DesignSystem;
export const siteNavigation = siteNavigationDataset;
export const content = siteContent;
export const experienceFlow = hasRuntimeExperienceFlow(experienceFlowRaw)
  ? experienceFlowRaw
  : fallbackExperienceFlow;
export const performanceProfiles = performanceProfilesRaw as unknown as PerformanceProfiles;
export const projectClusters = projectClustersRaw as ProjectClusters;
export const services = servicesRaw as Services;
export const uiComponents = hasRuntimeUiComponents(uiComponentsRaw)
  ? uiComponentsRaw
  : fallbackUiComponents;
export const heroSceneBlueprint = {
  ...(heroSceneBlueprintRaw as HeroSceneBlueprint),
  clusterOrder: projectClusters.order,
} as HeroSceneBlueprint;
export const visualEffects = visualEffectsRaw as VisualEffects;
