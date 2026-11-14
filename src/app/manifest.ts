import type { MetadataRoute } from "next";

const VERSION = "2";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aurora Ledger",
    short_name: "Aurora",
    description:
      "A glowing northern-lights personal finance tracker. Track income, expenses, budgets, and reports with beautiful aurora visualizations.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#070A1A",
    theme_color: "#4F46E5",
    categories: ["finance", "productivity"],
    lang: "en",
    icons: [
      {
        src: `/icons/favicon.ico?v=${VERSION}`,
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      {
        src: `/icons/favicon.svg?v=${VERSION}`,
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: `/icons/icon-192.png?v=${VERSION}`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icons/icon-512.png?v=${VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `/icons/icon-maskable-512.png?v=${VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `/icons/icon-monochrome.png?v=${VERSION}`,
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
      {
        src: `/icons/apple-touch-icon.png?v=${VERSION}`,
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Add Transaction",
        short_name: "Add",
        description: "Quickly add a new income or expense",
        url: "/dashboard?action=add",
        icons: [{ src: `/icons/icon-192.png?v=${VERSION}`, sizes: "192x192" }],
      },
      {
        name: "Transactions",
        short_name: "History",
        description: "View your transaction history",
        url: "/transactions",
        icons: [{ src: `/icons/icon-192.png?v=${VERSION}`, sizes: "192x192" }],
      },
      {
        name: "Reports",
        short_name: "Reports",
        description: "View financial reports and insights",
        url: "/reports",
        icons: [{ src: `/icons/icon-192.png?v=${VERSION}`, sizes: "192x192" }],
      },
    ],
  };
}
