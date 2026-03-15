/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["css-tree", "sharp", "@libsql/client", "@prisma/adapter-libsql"],
  },
};
module.exports = nextConfig;
