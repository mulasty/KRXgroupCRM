/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["framer-motion", "gsap", "@react-three/drei"]
  }
};

export default nextConfig;
