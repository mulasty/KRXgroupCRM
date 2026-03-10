import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

const vertexShader = `
  uniform float time;
  uniform float progress;
  uniform float distortionStrength;
  varying vec2 vUv;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float pulse = sin(time * 1.8 + uv.y * 8.0) * 0.015;
    float warp = progress * distortionStrength;

    transformed += normal * pulse * warp;
    transformed.z += (1.0 - uv.y) * 0.04 * warp;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float progress;
  uniform float distortionStrength;
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

  void main() {
    vec2 centered = vUv - 0.5;
    float radius = length(centered) * 2.0;
    float swirl = atan(centered.y, centered.x);
    float warp = progress * distortionStrength;
    float lens = smoothstep(0.92, 0.18, radius);
    float innerCore = 1.0 - smoothstep(0.0, 0.28, radius);
    float ring = smoothstep(0.48, 0.22, abs(radius - 0.42));
    float turbulence = noise(centered * 8.0 + vec2(time * 0.06, -time * 0.08));
    float horizon = smoothstep(0.55, 0.12, radius + sin(swirl * 4.0 + time * 0.9) * 0.03 * warp);

    vec3 color = mix(vec3(0.01, 0.015, 0.03), vec3(0.12, 0.36, 0.72), ring * 0.55);
    color = mix(color, vec3(0.88, 0.96, 1.0), ring * 0.38 + turbulence * 0.08);
    color *= horizon * (0.7 + warp * 0.18);

    float alpha = lens * 0.72 + ring * warp * 0.4;
    alpha *= 1.0 - innerCore * 0.94;
    alpha = clamp(alpha, 0.0, 0.95);

    if (alpha < 0.01) {
      discard;
    }

    gl_FragColor = vec4(color, alpha);
  }
`;

export const BlackHoleMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    distortionStrength: 1,
  },
  vertexShader,
  fragmentShader,
);

extend({ BlackHoleMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    blackHoleMaterial: any;
  }
}
