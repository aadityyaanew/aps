/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@aws-sdk/client-s3", "mysql2", "bcryptjs"],
  experimental: {
    cpus: 4,
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
