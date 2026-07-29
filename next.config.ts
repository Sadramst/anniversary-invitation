import type { NextConfig } from "next";

/**
 * The invitation is mounted as a sub-path of the main Appilico site:
 *   https://www.appilico.com.au/inviteaniversery/<slug>
 *
 * Change ONE value here (or set NEXT_PUBLIC_BASE_PATH) to move it,
 * e.g. "/anniversary" or "" to serve it from the domain root.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/inviteaniversery";

const nextConfig: NextConfig = {
  basePath: BASE_PATH === "" ? undefined : BASE_PATH,
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,

  images: {
    // Local photos only – no remote sources.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        // Guest links must never be indexed or listed publicly.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
