import type { Metadata, Viewport } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#7C5CFF" },
    { media: "(prefers-color-scheme: light)", color: "#5B3AE0" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Aurora Ledger — Glowing Personal Finance Tracker",
    template: "%s | Aurora Ledger",
  },
  description:
    "A dark, glowing northern-lights personal finance tracker. Track income, expenses, budgets, and reports with beautiful aurora visualizations.",
  manifest: "/manifest.webmanifest",
  applicationName: "Aurora Ledger",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aurora Ledger",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/icons/icon-192.png",
  },
  openGraph: {
    type: "website",
    title: "Aurora Ledger",
    description: "A glowing northern-lights personal finance tracker.",
    siteName: "Aurora Ledger",
  },
  twitter: {
    card: "summary",
    title: "Aurora Ledger",
    description: "A glowing northern-lights personal finance tracker.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased min-h-dvh bg-[var(--bg-base)] text-[var(--text-body)] selection:bg-[var(--primary)]/30 selection:text-white">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
