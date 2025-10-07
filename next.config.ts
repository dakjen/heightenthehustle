import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: "postgresql://neondb_owner:npg_N7XohdTWfF5D@ep-odd-breeze-adu973kv-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
    JWT_SECRET: "your_jwt_secret_goes_here",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;