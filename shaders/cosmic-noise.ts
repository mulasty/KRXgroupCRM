import { extend } from "@react-three/fiber";
import { Color } from "three";
import { shaderMaterial } from "@react-three/drei";

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

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
      p *= 2.03;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = uTime * 0.05;
    float field = fbm(uv * 2.2 + vec2(t, -t * 0.35));
    float wisps = fbm(uv * 4.4 - vec2(t * 0.55, t * 0.22));
    float vignette = smoothstep(1.35, 0.18, length(uv));
    vec3 color = mix(uColorA, uColorB, field);
    color = mix(color, uColorC, wisps * 0.45);
    float alpha = (field * 0.58 + wisps * 0.22) * vignette * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const CosmicNoiseMaterial = shaderMaterial(
  {
    uTime: 0,
    uOpacity: 0.2,
    uColorA: new Color("#06080c"),
    uColorB: new Color("#0c1620"),
    uColorC: new Color("#153040"),
  },
  vertexShader,
  fragmentShader,
);

extend({ CosmicNoiseMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    cosmicNoiseMaterial: any;
  }
}
