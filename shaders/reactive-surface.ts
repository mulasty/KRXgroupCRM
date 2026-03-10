import { extend } from "@react-three/fiber";
import { Color, Vector2 } from "three";
import { shaderMaterial } from "@react-three/drei";

const vertexShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float dist = distance(uv, uPointer);
    float ring = sin(12.0 * dist - uTime * 2.4);
    float wave = sin(position.x * 2.2 + uTime * 0.8) * 0.16;
    wave += cos(position.y * 3.4 - uTime * 1.1) * 0.12;
    wave += ring * smoothstep(0.45, 0.0, dist) * 0.28;

    transformed.z += wave;
    vWave = wave;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    float stripes = sin((vUv.y * 26.0 + uTime * 0.5) + vWave * 9.0) * 0.5 + 0.5;
    float glow = smoothstep(0.95, 0.15, distance(vUv, vec2(0.5)));
    vec3 color = mix(uColorA, uColorB, vUv.x + stripes * 0.25);
    color += glow * 0.08;

    gl_FragColor = vec4(color, 0.92);
  }
`;

export const ReactiveSurfaceMaterial = shaderMaterial(
  {
    uTime: 0,
    uPointer: new Vector2(0.5, 0.5),
    uColorA: new Color("#0d1620"),
    uColorB: new Color("#8cc8ff"),
  },
  vertexShader,
  fragmentShader,
);

extend({ ReactiveSurfaceMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    reactiveSurfaceMaterial: any;
  }
}
