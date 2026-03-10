import { extend } from "@react-three/fiber";
import { Color, Texture } from "three";
import { shaderMaterial } from "@react-three/drei";

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform float uPointSize;
  attribute vec3 aStart;
  attribute float aScatter;
  varying vec2 vSampleUv;
  varying float vAlpha;

  void main() {
    float progress = smoothstep(0.0, 1.0, uProgress);
    vec3 current = mix(aStart, position, progress);
    float lift = (1.0 - progress);

    current.x += sin(uTime * 1.4 + aScatter * 18.0) * 0.12 * lift;
    current.y += cos(uTime * 1.2 + aScatter * 12.0) * 0.12 * lift;
    current.z += sin((uv.x + uv.y + aScatter) * 18.0 + uTime * 1.1) * 0.55 * lift;

    vec4 mvPosition = modelViewMatrix * vec4(current, 1.0);

    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * (320.0 / -mvPosition.z) * (0.7 + progress * 0.9);

    vSampleUv = uv;
    vAlpha = smoothstep(0.02, 0.15, progress) * (1.0 - smoothstep(0.88, 1.0, progress) * 0.55);
  }
`;

const fragmentShader = `
  uniform sampler2D uMap;
  uniform vec3 uTint;
  varying vec2 vSampleUv;
  varying float vAlpha;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float falloff = smoothstep(0.25, 0.02, dot(centered, centered));
    vec4 sampleColor = texture2D(uMap, vSampleUv);
    vec3 color = mix(uTint, sampleColor.rgb, 0.9);
    float alpha = sampleColor.a * falloff * vAlpha;

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const AssemblyParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0,
    uPointSize: 2.75,
    uMap: null as Texture | null,
    uTint: new Color("#ffffff"),
  },
  vertexShader,
  fragmentShader,
);

extend({ AssemblyParticlesMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    assemblyParticlesMaterial: any;
  }
}
