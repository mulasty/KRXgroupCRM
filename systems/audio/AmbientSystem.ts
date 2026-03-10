"use client";

import { useEffect } from "react";

import { useAudioEngine } from "@/systems/audio/AudioEngine";

export function AmbientSystem() {
  const { ready, startAmbientLoop } = useAudioEngine();

  useEffect(() => {
    if (!ready) {
      return;
    }

    void startAmbientLoop("/audio/ambient-space.mp3", 0.19);
  }, [ready, startAmbientLoop]);

  return null;
}
