import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  devIndicators: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pjhiawnksazqkzvjucfg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
