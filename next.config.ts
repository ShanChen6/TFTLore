import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ảnh đã được tối ưu sẵn sang .webp bởi scripts/fetch-assets.mjs.
  images: { unoptimized: true },
  /* config options here */
};

export default nextConfig;
