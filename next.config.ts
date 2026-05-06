import type { NextConfig } from "next";

const config: NextConfig = {
  typedRoutes: true,
  // Prevent Next.js from bundling Prisma client on edge
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default config;
