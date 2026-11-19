import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public pages moved to Romanian URLs; permanent redirects keep old links and search results working.
  async redirects() {
    return [
      { source: "/news", destination: "/stiri", permanent: true },
      { source: "/reviews", destination: "/recenzii", permanent: true },
      { source: "/article/:slug", destination: "/articol/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
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
