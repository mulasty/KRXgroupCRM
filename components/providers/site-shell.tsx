"use client";

import { Header } from "@/components/common/header";
import { InteractionProvider } from "@/components/providers/interaction-provider";
import { RouteTransition } from "@/components/common/route-transition";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { AmbientSystem } from "@/systems/audio/AmbientSystem";
import { AudioEngineProvider } from "@/systems/audio/AudioEngine";
import { InteractionSounds } from "@/systems/audio/InteractionSounds";
import { SpaceWarp } from "@/three/navigation/SpaceWarp";
import {
  TransitionNavigationBridge,
  TransitionSelectionBridge,
} from "@/three/transitions/TransitionManager";
import { WarpTransition } from "@/three/transitions/WarpTransition";

export function SiteShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScrollProvider>
      <AudioEngineProvider>
        <AmbientSystem />
        <InteractionSounds />
        <TransitionSelectionBridge />
        <TransitionNavigationBridge />
        <InteractionProvider>
          <Header />
          <SpaceWarp />
          <WarpTransition />
          <RouteTransition>{children}</RouteTransition>
        </InteractionProvider>
      </AudioEngineProvider>
    </SmoothScrollProvider>
  );
}
