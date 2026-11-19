import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment.
  // This copies only the files Next.js needs to run into .next/standalone/,
  // drastically reducing the Docker image size.
  output: "standalone",

  // Disable Next.js telemetry in production builds
  // (can also be done via NEXT_TELEMETRY_DISABLED=1 env var)
};

export default nextConfig;
