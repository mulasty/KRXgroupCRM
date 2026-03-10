"use client";

import { useEffect, useRef } from "react";

import { useExperienceDirector } from "@/systems/ExperienceDirector";
import { useAudioEngine } from "@/systems/audio/AudioEngine";

export function InteractionSounds() {
  const experience = useExperienceDirector();
  const {
    ready,
    setFlightIntensity,
    playCameraFlightSound,
    playFocusProjectSound,
  } = useAudioEngine();
  const previousStage = useRef(experience.stage);
  const previousSelection = useRef(experience.selectionActive);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const amount =
      experience.stage === "explore"
        ? 0.62
        : experience.stage === "focus"
          ? experience.selectionActive
            ? 0.22
            : 0.34
          : 0;

    setFlightIntensity(amount);
  }, [experience.selectionActive, experience.stage, ready, setFlightIntensity]);

  useEffect(() => {
    if (!ready) {
      previousStage.current = experience.stage;
      return;
    }

    if (previousStage.current !== experience.stage && experience.stage === "explore") {
      void playCameraFlightSound(0.9);
    }

    previousStage.current = experience.stage;
  }, [experience.stage, playCameraFlightSound, ready]);

  useEffect(() => {
    if (!ready) {
      previousSelection.current = experience.selectionActive;
      return;
    }

    if (experience.selectionActive && !previousSelection.current) {
      void playFocusProjectSound(1);
    }

    previousSelection.current = experience.selectionActive;
  }, [experience.selectionActive, playFocusProjectSound, ready]);

  return null;
}
