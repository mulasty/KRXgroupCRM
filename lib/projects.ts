import { portfolioProjects, siteData } from "@/lib/site-data";

export type { PortfolioProjectRecord as Project, ProjectCluster, ProjectModel } from "@/lib/site-data";

export const designer = siteData.designer;
export const projects = portfolioProjects;
export const experiments = siteData.playground.experiments;

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
