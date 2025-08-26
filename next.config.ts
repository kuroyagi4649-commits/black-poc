import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname }, // ルートを明示
};

export default nextConfig;
