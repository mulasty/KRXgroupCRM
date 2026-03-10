import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color } from "three";

const vertexShader = `
  uniform float time;
  uniform float progress;
  uniform float intensity;
  varying vec2 vUv;
  varying float vWarp;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    vec2 centered = uv * 2.0 - 1.0;
    float radial = 1.0 - clamp(length(centered), 0.0, 1.0);
    float waveA = sin(position.x * 5.4 + time * 1.1);
    float waveB = cos(position.y * 6.2 - time * 0.85);
    float wave = waveA * waveB;
    float warpStrength = progress * intensity;

    transformed.z += (wave * 0.16 + radial * 0.52) * warpStrength;
    transformed.x += sin(position.y * 3.2 + time * 0.9) * 0.028 * warpStrength;
    transformed.y += cos(position.x * 3.8 - time * 0.75) * 0.028 * warpStrength;

    vWarp = wave * 0.5 + 0.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float progress;
  uniform float intensity;
  uniform vec3 colorA;
  uniform vec3 colorB;
  uniform vec3 colorC;
  varying vec2 vUv;
  varying float vWarp;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.03 + vec2(4.2, -1.9);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 centered = vUv * 2.0 - 1.0;
    float radius = length(centered);
    float veil = smoothstep(0.02, 0.24, progress);
    float closure = smoothstep(0.54, 1.0, progress);
    float swirl = atan(centered.y, centered.x);
    vec2 warpedUv = centered;
    warpedUv += vec2(cos(swirl * 2.0 + time * 0.4), sin(swirl * 2.0 - time * 0.45)) * 0.05 * progress * intensity;
    warpedUv += centered * (0.08 + vWarp * 0.06) * progress * intensity;

    float field = fbm(warpedUv * 2.3 + vec2(time * 0.07, -time * 0.05));
    float wisps = fbm(warpedUv * 4.4 - vec2(time * 0.12, time * 0.06));
    float ring = smoothstep(0.88 - progress * 0.38, 0.08, radius);

    vec3 color = mix(colorA, colorB, field);
    color = mix(color, colorC, wisps * 0.55 + closure * 0.35);

    float alpha = (0.1 + field * 0.2 + wisps * 0.12) * veil;
    alpha += ring * closure * 0.82;
    alpha *= 0.86 + intensity * 0.16;
    alpha = clamp(alpha, 0.0, 0.94);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export const LiquidWarpMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    intensity: 1,
    colorA: new Color("#05070b"),
    colorB: new Color("#163a64"),
    colorC: new Color("#eef5ff"),
  },
  vertexShader,
  fragmentShader,
);

extend({ LiquidWarpMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    liquidWarpMaterial: any;
  }
}
