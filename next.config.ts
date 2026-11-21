import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The shared interface kit ships as TypeScript source, so Next.js compiles it with the site.
  transpilePackages: ["permalab-ui"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
