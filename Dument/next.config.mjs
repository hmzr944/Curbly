// Static export so the site can be served by GitHub Pages (or any static host).
// NEXT_PUBLIC_BASE_PATH is the sub-path the site lives under, e.g. "/Curbly" on hmzr944.github.io/Curbly.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
