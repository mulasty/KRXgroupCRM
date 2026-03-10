"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Vec3Like = {
  x: number;
  y: number;
  z: number;
};

type SpatialEmitterOptions = {
  active: boolean;
  intensity?: number;
  position?: Vec3Like;
};

type AudioEngineContextValue = {
  ready: boolean;
  supported: boolean;
  ensureReady: () => Promise<AudioContext | null>;
  startAmbientLoop: (url: string, volume?: number) => Promise<void>;
  setFlightIntensity: (amount: number) => void;
  playCameraFlightSound: (strength?: number) => void;
  playHoverProjectSound: (strength?: number) => void;
  playFocusProjectSound: (strength?: number) => void;
  setSpatialEmitter: (options: SpatialEmitterOptions) => void;
  setListenerTransform: (position: Vec3Like, forward: Vec3Like, up: Vec3Like) => void;
};

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null);

type AmbientHandle = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

type FlightHandle = {
  gain: GainNode;
  filter: BiquadFilterNode;
  low: OscillatorNode;
  high: OscillatorNode;
};

type SpatialHandle = {
  gain: GainNode;
  filter: BiquadFilterNode;
  panner: PannerNode;
  oscillator: OscillatorNode;
};

function setParamTarget(param: AudioParam, value: number, currentTime: number, lag = 0.18) {
  param.cancelScheduledValues(currentTime);
  param.setTargetAtTime(value, currentTime, lag);
}

function createProceduralAmbientBuffer(context: AudioContext) {
  const lengthSeconds = 12;
  const buffer = context.createBuffer(2, context.sampleRate * lengthSeconds, context.sampleRate);

  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    let noiseA = 0;
    let noiseB = 0;

    for (let index = 0; index < data.length; index += 1) {
      noiseA = noiseA * 0.986 + (Math.random() * 2 - 1) * 0.014;
      noiseB = noiseB * 0.997 + (Math.random() * 2 - 1) * 0.0035;
      const t = index / context.sampleRate;
      const carrier =
        Math.sin(t * Math.PI * 2 * 58 + channel * 0.4) * 0.012 +
        Math.sin(t * Math.PI * 2 * 91 + channel * 0.18) * 0.007 +
        Math.sin(t * Math.PI * 2 * 137 + channel * 0.32) * 0.004;
      const fadeIn = Math.min(1, t / 2.4);
      const fadeOut = Math.min(1, (lengthSeconds - t) / 2.4);
      data[index] = (noiseA + noiseB + carrier) * fadeIn * fadeOut;
    }
  }

  return buffer;
}

function getAudioContextCtor() {
  if (typeof window === "undefined") {
    return null;
  }

  const win = window as Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

export function AudioEngineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<AmbientHandle | null>(null);
  const flightRef = useRef<FlightHandle | null>(null);
  const spatialRef = useRef<SpatialHandle | null>(null);
  const bufferCacheRef = useRef(new Map<string, Promise<AudioBuffer>>());
  const [ready, setReady] = useState(false);
  const supported = Boolean(getAudioContextCtor());

  const ensureGraph = useCallback((context: AudioContext) => {
    if (!masterGainRef.current) {
      const masterGain = context.createGain();
      masterGain.gain.value = 0.82;
      masterGain.connect(context.destination);
      masterGainRef.current = masterGain;
    }

    if (!flightRef.current && masterGainRef.current) {
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const low = context.createOscillator();
      const high = context.createOscillator();

      gain.gain.value = 0;
      filter.type = "lowpass";
      filter.frequency.value = 540;
      filter.Q.value = 0.22;

      low.type = "triangle";
      low.frequency.value = 76;

      high.type = "sine";
      high.frequency.value = 118;

      low.connect(filter);
      high.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
      low.start();
      high.start();

      flightRef.current = {
        gain,
        filter,
        low,
        high,
      };
    }

    if (!spatialRef.current && masterGainRef.current) {
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const panner = context.createPanner();
      const oscillator = context.createOscillator();

      gain.gain.value = 0;
      filter.type = "bandpass";
      filter.frequency.value = 960;
      filter.Q.value = 0.18;
      panner.panningModel = "HRTF";
      panner.distanceModel = "inverse";
      panner.refDistance = 8;
      panner.maxDistance = 44;
      panner.rolloffFactor = 1.15;
      panner.coneInnerAngle = 360;
      panner.coneOuterAngle = 0;

      oscillator.type = "sine";
      oscillator.frequency.value = 228;

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(masterGainRef.current);
      oscillator.start();

      spatialRef.current = {
        gain,
        filter,
        panner,
        oscillator,
      };
    }
  }, []);

  const ensureReady = useCallback(async () => {
    const AudioContextCtor = getAudioContextCtor();

    if (!AudioContextCtor) {
      return null;
    }

    if (!contextRef.current) {
      contextRef.current = new AudioContextCtor();
      ensureGraph(contextRef.current);
    }

    const context = contextRef.current;

    if (context.state === "suspended") {
      await context.resume();
    }

    setReady(true);
    return context;
  }, [ensureGraph]);

  const loadBuffer = useCallback(
    async (url: string) => {
      const context = await ensureReady();

      if (!context) {
        throw new Error("AudioContext unavailable.");
      }

      const cached = bufferCacheRef.current.get(url);

      if (cached) {
        return cached;
      }

      const pending = fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load audio asset: ${url}`);
          }

          return response.arrayBuffer();
        })
        .then((buffer) => context.decodeAudioData(buffer.slice(0)));

      bufferCacheRef.current.set(url, pending);
      return pending;
    },
    [ensureReady],
  );

  const startAmbientLoop = useCallback(
    async (url: string, volume = 0.18) => {
      const context = await ensureReady();

      if (!context || !masterGainRef.current) {
        return;
      }

      if (ambientRef.current) {
        setParamTarget(ambientRef.current.gain.gain, volume, context.currentTime, 1.4);
        return;
      }

      let buffer: AudioBuffer;

      try {
        buffer = await loadBuffer(url);
      } catch {
        buffer = createProceduralAmbientBuffer(context);
      }

      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();

      source.buffer = buffer;
      source.loop = true;
      filter.type = "lowpass";
      filter.frequency.value = 1200;
      filter.Q.value = 0.16;
      gain.gain.value = 0.0001;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
      source.start();

      ambientRef.current = {
        source,
        gain,
        filter,
      };

      setParamTarget(gain.gain, volume, context.currentTime, 1.8);
    },
    [ensureReady, loadBuffer],
  );

  const playEnvelopeTone = useCallback(
    async ({
      startFrequency,
      endFrequency,
      duration,
      peak,
      type,
      filterFrequency,
      detune = 0,
    }: {
      startFrequency: number;
      endFrequency: number;
      duration: number;
      peak: number;
      type: OscillatorType;
      filterFrequency: number;
      detune?: number;
    }) => {
      const context = await ensureReady();

      if (!context || !masterGainRef.current) {
        return;
      }

      const oscillator = context.createOscillator();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const startTime = context.currentTime;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(Math.max(10, startFrequency), startTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(10, endFrequency),
        startTime + duration,
      );
      oscillator.detune.value = detune;

      filter.type = "lowpass";
      filter.frequency.value = filterFrequency;
      filter.Q.value = 0.18;

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainRef.current);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.04);

      oscillator.onended = () => {
        oscillator.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    },
    [ensureReady],
  );

  const setFlightIntensity = useCallback((amount: number) => {
    const context = contextRef.current;
    const flight = flightRef.current;

    if (!context || !flight) {
      return;
    }

    const clamped = Math.min(1, Math.max(0, amount));
    setParamTarget(flight.gain.gain, clamped * 0.028, context.currentTime, 0.28);
    setParamTarget(flight.filter.frequency, 420 + clamped * 260, context.currentTime, 0.36);
  }, []);

  const playCameraFlightSound = useCallback(
    async (strength = 1) => {
      await playEnvelopeTone({
        startFrequency: 180,
        endFrequency: 92,
        duration: 0.42,
        peak: 0.012 * strength,
        type: "triangle",
        filterFrequency: 980,
        detune: -120,
      });
    },
    [playEnvelopeTone],
  );

  const playHoverProjectSound = useCallback(
    async (strength = 1) => {
      await playEnvelopeTone({
        startFrequency: 460,
        endFrequency: 280,
        duration: 0.14,
        peak: 0.008 * strength,
        type: "sine",
        filterFrequency: 1800,
        detune: 8,
      });
    },
    [playEnvelopeTone],
  );

  const playFocusProjectSound = useCallback(
    async (strength = 1) => {
      await playEnvelopeTone({
        startFrequency: 220,
        endFrequency: 96,
        duration: 0.34,
        peak: 0.016 * strength,
        type: "triangle",
        filterFrequency: 860,
        detune: -14,
      });
    },
    [playEnvelopeTone],
  );

  const setSpatialEmitter = useCallback((options: SpatialEmitterOptions) => {
    const context = contextRef.current;
    const spatial = spatialRef.current;

    if (!context || !spatial) {
      return;
    }

    const intensity = Math.min(1, Math.max(0, options.intensity ?? 1));

    if (options.active && options.position) {
      const { x, y, z } = options.position;

      spatial.panner.positionX.value = x;
      spatial.panner.positionY.value = y;
      spatial.panner.positionZ.value = z;

      setParamTarget(spatial.gain.gain, 0.01 * intensity, context.currentTime, 0.16);
      setParamTarget(spatial.filter.frequency, 780 + intensity * 380, context.currentTime, 0.22);
      setParamTarget(spatial.oscillator.frequency, 190 + intensity * 42, context.currentTime, 0.2);
      return;
    }

    setParamTarget(spatial.gain.gain, 0.0001, context.currentTime, 0.18);
  }, []);

  const setListenerTransform = useCallback(
    (position: Vec3Like, forward: Vec3Like, up: Vec3Like) => {
      const context = contextRef.current;

      if (!context) {
        return;
      }

      const listener = context.listener;

      listener.positionX.value = position.x;
      listener.positionY.value = position.y;
      listener.positionZ.value = position.z;
      listener.forwardX.value = forward.x;
      listener.forwardY.value = forward.y;
      listener.forwardZ.value = forward.z;
      listener.upX.value = up.x;
      listener.upY.value = up.y;
      listener.upZ.value = up.z;
    },
    [],
  );

  useEffect(() => {
    if (!supported) {
      return;
    }

    const unlock = () => {
      void ensureReady();
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureReady, supported]);

  useEffect(() => {
    return () => {
      ambientRef.current?.source.stop();
      flightRef.current?.low.stop();
      flightRef.current?.high.stop();
      spatialRef.current?.oscillator.stop();
      void contextRef.current?.close();
    };
  }, []);

  const value = useMemo<AudioEngineContextValue>(
    () => ({
      ready,
      supported,
      ensureReady,
      startAmbientLoop,
      setFlightIntensity,
      playCameraFlightSound,
      playHoverProjectSound,
      playFocusProjectSound,
      setSpatialEmitter,
      setListenerTransform,
    }),
    [
      ensureReady,
      playCameraFlightSound,
      playFocusProjectSound,
      playHoverProjectSound,
      ready,
      setFlightIntensity,
      setListenerTransform,
      setSpatialEmitter,
      startAmbientLoop,
      supported,
    ],
  );

  return <AudioEngineContext.Provider value={value}>{children}</AudioEngineContext.Provider>;
}

export function useAudioEngine() {
  const context = useContext(AudioEngineContext);

  if (!context) {
    throw new Error("useAudioEngine must be used within AudioEngineProvider.");
  }

  return context;
}
