import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  // Permet d'importer des modules Node.js dans les API routes (chiffrement, fs)
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
