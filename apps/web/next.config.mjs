/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@wrenchly/engine", "@wrenchly/types"],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
