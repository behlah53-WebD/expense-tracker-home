import type { MetadataRoute } from "next";

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
    theme_color: "#7C5CFF",
    categories: ["finance", "productivity"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
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
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Transactions",
        short_name: "History",
        description: "View your transaction history",
        url: "/transactions",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Reports",
        short_name: "Reports",
        description: "View financial reports and insights",
        url: "/reports",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
