import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ảnh đã được tối ưu sẵn sang .webp bởi scripts/fetch-assets.mjs.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        // Tên file ảnh không chứa hash nên không dùng immutable: cache 1 ngày, phục vụ bản cũ tới 1 tuần.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
