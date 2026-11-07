/**
 * Aurora Ledger PWA Icon Generator
 * Run with: npx tsx scripts/generate-icons.ts
 * Requires: sharp (npm install --save-dev sharp @types/node)
 */

import fs from "fs";
import path from "path";

const SVG_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0E1230"/>
      <stop offset="100%" stop-color="#070A1A"/>
    </radialGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFF"/>
      <stop offset="50%" stop-color="#38D5FF"/>
      <stop offset="100%" stop-color="#2EF2B0"/>
    </linearGradient>
    <linearGradient id="glow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF5C8A"/>
      <stop offset="100%" stop-color="#7C5CFF"/>
    </linearGradient>
    <filter id="gf">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Background circle -->
  <circle cx="256" cy="256" r="256" fill="url(#bg)"/>
  <!-- Glow blobs -->
  <ellipse cx="200" cy="200" rx="120" ry="80" fill="#7C5CFF" opacity="0.25" filter="url(#gf)"/>
  <ellipse cx="320" cy="300" rx="100" ry="70" fill="#38D5FF" opacity="0.2" filter="url(#gf)"/>
  <ellipse cx="240" cy="340" rx="90" ry="60" fill="#2EF2B0" opacity="0.15" filter="url(#gf)"/>
  <!-- Sparkle mark -->
  <g transform="translate(256,256)">
    <!-- Main sparkle star -->
    <path d="M0,-80 L12,-12 L80,0 L12,12 L0,80 L-12,12 L-80,0 L-12,-12 Z"
          fill="url(#glow)" opacity="0.95"/>
    <!-- Secondary smaller star rotated 45deg -->
    <path d="M0,-52 L8,-8 L52,0 L8,8 L0,52 L-8,8 L-52,0 L-8,-8 Z"
          fill="url(#glow2)" opacity="0.6" transform="rotate(45)"/>
    <!-- Center dot -->
    <circle cx="0" cy="0" r="10" fill="white" opacity="0.9"/>
  </g>
</svg>`;

const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0E1230"/>
      <stop offset="100%" stop-color="#070A1A"/>
    </radialGradient>
    <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFF"/>
      <stop offset="50%" stop-color="#38D5FF"/>
      <stop offset="100%" stop-color="#2EF2B0"/>
    </linearGradient>
    <linearGradient id="glow2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF5C8A"/>
      <stop offset="100%" stop-color="#7C5CFF"/>
    </linearGradient>
    <filter id="gf">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Full bleed background (safe zone is 40% of size = 204px inset 154px) -->
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- Glow blobs -->
  <ellipse cx="200" cy="200" rx="140" ry="100" fill="#7C5CFF" opacity="0.25" filter="url(#gf)"/>
  <ellipse cx="320" cy="300" rx="120" ry="90" fill="#38D5FF" opacity="0.2" filter="url(#gf)"/>
  <!-- Sparkle mark -->
  <g transform="translate(256,256)">
    <path d="M0,-80 L12,-12 L80,0 L12,12 L0,80 L-12,12 L-80,0 L-12,-12 Z"
          fill="url(#glow)" opacity="0.95"/>
    <path d="M0,-52 L8,-8 L52,0 L8,8 L0,52 L-8,8 L-52,0 L-8,-8 Z"
          fill="url(#glow2)" opacity="0.6" transform="rotate(45)"/>
    <circle cx="0" cy="0" r="10" fill="white" opacity="0.9"/>
  </g>
</svg>`;

async function generateIcons() {
  let sharp: any;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("❌ sharp not installed. Run: npm install --save-dev sharp");
    process.exit(1);
  }

  const iconsDir = path.join(process.cwd(), "public", "icons");
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const svgBuffer = Buffer.from(SVG_ICON);
  const maskBuffer = Buffer.from(MASKABLE_SVG);

  const tasks = [
    { name: "icon-192.png", size: 192, buf: svgBuffer },
    { name: "icon-512.png", size: 512, buf: svgBuffer },
    { name: "icon-maskable-512.png", size: 512, buf: maskBuffer },
    { name: "apple-touch-icon.png", size: 180, buf: svgBuffer },
    { name: "shortcut-add.png", size: 96, buf: svgBuffer },
    { name: "shortcut-history.png", size: 96, buf: svgBuffer },
    { name: "shortcut-reports.png", size: 96, buf: svgBuffer },
  ];

  for (const task of tasks) {
    await sharp(task.buf)
      .resize(task.size, task.size)
      .png()
      .toFile(path.join(iconsDir, task.name));
    console.log(`✅ Generated /public/icons/${task.name}`);
  }

  console.log("\n🚀 All icons generated! Run npm run dev to verify.");
}

generateIcons().catch(console.error);
