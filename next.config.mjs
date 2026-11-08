/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    // Avoid the wildcard `hostname: '**'` — it disables image optimization.
    // Add specific domains you actually use below.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days for remote images
  },

  // ── Compiler ──────────────────────────────────────────────────────────────
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // ── Experimental ─────────────────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "@reduxjs/toolkit",
      "framer-motion",
    ],
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/api/auth/signin",
        destination: "/login",
        permanent: false,
      },
    ];
  },

  // ── Headers ───────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Service worker: no-cache so updates are picked up immediately
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // PWA icons — long-lived immutable cache (versioned by content hash)
        source: "/icons/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // API routes: no caching by default; individual routes can override
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        // All routes — security headers
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Strict CSP — tighten further once you know all your CDN origins
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
