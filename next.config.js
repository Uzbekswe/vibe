/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["css-tree", "sharp"],
  },
};
module.exports = nextConfig;
