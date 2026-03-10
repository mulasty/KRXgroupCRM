"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import interactionRulesRaw from "@/ai-context/interaction_rules.json";
import { useInteractionProvider } from "@/components/providers/interaction-provider";
import { heroSceneBlueprint, portfolioProjects } from "@/lib/site-data";
import type { Project } from "@/lib/projects";
import { setExperienceSelection } from "@/systems/ExperienceDirector";
import {
  generateGalaxyLayout,
  type GalaxyLayout,
  type GalaxyNode,
} from "@/three/universe/GalaxyGenerator";

type InteractionRules = {
  cursor_gravity: {
    enabled: boolean;
    strength: number;
    radius: number;
  };
  hover_focus: {
    scale: number;
    light_boost: number;
  };
  camera_parallax: {
    enabled: boolean;
    strength: number;
  };
};

const interactionRules = interactionRulesRaw as InteractionRules;

export type PortfolioEngineState = {
  projects: Project[];
  layout: GalaxyLayout;
  nodes: GalaxyNode[];
  hoveredSlug: string | null;
  selectedSlug: string | null;
  hoveredNode: GalaxyNode | null;
  selectedNode: GalaxyNode | null;
  interaction: {
    cursorGravityEnabled: boolean;
    cursorGravityStrength: number;
    cursorGravityRadius: number;
    hoverScale: number;
    focusLightBoost: number;
    cameraParallaxEnabled: boolean;
    cameraParallaxStrength: number;
  };
  setHoveredSlug: (slug: string | null) => void;
  selectNode: (node: GalaxyNode) => void;
  clearSelection: () => void;
};

export function usePortfolioEngine(): PortfolioEngineState {
  const { setCursorOverride } = useInteractionProvider();
  const projects = portfolioProjects;
  const layout = useMemo(() => generateGalaxyLayout(projects, heroSceneBlueprint), [projects]);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const hoveredNode = useMemo(
    () => layout.nodes.find((node) => node.project.slug === hoveredSlug) ?? null,
    [hoveredSlug, layout.nodes],
  );
  const selectedNode = useMemo(
    () => layout.nodes.find((node) => node.project.slug === selectedSlug) ?? null,
    [layout.nodes, selectedSlug],
  );

  useEffect(() => {
    setExperienceSelection(
      Boolean(selectedNode),
      selectedNode
        ? [selectedNode.position.x, selectedNode.position.y, selectedNode.position.z]
        : null,
    );
  }, [selectedNode]);

  useEffect(() => {
    return () => {
      setExperienceSelection(false, null);
    };
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      setCursorOverride("zoom");
      return;
    }

    setCursorOverride(hoveredSlug ? "view_project" : null);

    return () => {
      setCursorOverride(null);
    };
  }, [hoveredSlug, selectedSlug, setCursorOverride]);

  const selectNode = useCallback((node: GalaxyNode) => {
    setSelectedSlug(node.project.slug);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  return {
    projects,
    layout,
    nodes: layout.nodes,
    hoveredSlug,
    selectedSlug,
    hoveredNode,
    selectedNode,
    interaction: {
      cursorGravityEnabled: interactionRules.cursor_gravity.enabled,
      cursorGravityStrength: interactionRules.cursor_gravity.strength,
      cursorGravityRadius: interactionRules.cursor_gravity.radius,
      hoverScale: interactionRules.hover_focus.scale,
      focusLightBoost: interactionRules.hover_focus.light_boost,
      cameraParallaxEnabled: interactionRules.camera_parallax.enabled,
      cameraParallaxStrength: interactionRules.camera_parallax.strength,
    },
    setHoveredSlug,
    selectNode,
    clearSelection,
  };
}
