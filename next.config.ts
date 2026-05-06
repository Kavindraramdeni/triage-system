import type { NextConfig } from "next";
const config: NextConfig = {
  experimental: { typedRoutes: true },
  // Prevent Next.js from bundling Prisma client on edge
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};
export default config;
