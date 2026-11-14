/**
 * Aurora Ledger PWA Icon Generator
 * Single source: public/logo.svg (+ logo-maskable.svg, logo-monochrome.svg, favicon.svg)
 * Run with: npx tsx scripts/generate-icons.ts
 * Requires: sharp
 */

import fs from "fs";
import path from "path";

const ICONS_DIR = path.join(process.cwd(), "public", "icons");
const SPLASH_DIR = path.join(process.cwd(), "public", "splash");

if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });
if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });

const read = (file: string) => Buffer.from(fs.readFileSync(path.join(process.cwd(), "public", file), "utf-8"));

const LOGO = read("logo.svg");
const MASKABLE = read("logo-maskable.svg");
const MONOCHROME = read("logo-monochrome.svg");
const FAVICON = read("favicon.svg");

async function generateIcons() {
  const sharp = (await import("sharp")).default;

  const png = (buf: Buffer, size: number) => sharp(buf).resize(size, size).png();

  const tasks: Array<{ name: string; size: number; buf: Buffer; dir?: string }> = [
    { name: "icon-192.png", size: 192, buf: LOGO },
    { name: "icon-512.png", size: 512, buf: LOGO },
    { name: "icon-maskable-512.png", size: 512, buf: MASKABLE },
    { name: "apple-touch-icon.png", size: 180, buf: LOGO },
    { name: "icon-monochrome.png", size: 512, buf: MONOCHROME },
    { name: "shortcut-add.png", size: 96, buf: LOGO },
    { name: "shortcut-history.png", size: 96, buf: LOGO },
    { name: "shortcut-reports.png", size: 96, buf: LOGO },
  ];

  for (const task of tasks) {
    await png(task.buf, task.size).toFile(path.join(ICONS_DIR, task.name));
    console.log(`✅ /public/icons/${task.name}`);
  }

  // favicon.ico (16, 32, 48) — embed PNGs in an ICO container
  const favSizes = [16, 32, 48];
  const favBuffers: Buffer[] = [];
  for (const s of favSizes) {
    favBuffers.push(await png(FAVICON, s).toBuffer());
  }
  const entries: Buffer[] = [];
  let offset = 6 + favSizes.length * 16;
  for (let i = 0; i < favSizes.length; i++) {
    const s = favSizes[i];
    const data = favBuffers[i];
    const entry = Buffer.alloc(16);
    entry[0] = s >= 256 ? 0 : s; // width
    entry[1] = s >= 256 ? 0 : s; // height
    entry[2] = 0; // color count
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(data.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += data.length;
  }
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(2, 2); // type = icon
  header.writeUInt16LE(favSizes.length, 4); // count
  await fs.promises.writeFile(path.join(ICONS_DIR, "favicon.ico"), Buffer.concat([header, ...entries, ...favBuffers]));
  console.log(`✅ /public/icons/favicon.ico (${favSizes.join(",")})`);

  // favicon.svg (copy source)
  fs.copyFileSync(path.join(process.cwd(), "public", "favicon.svg"), path.join(ICONS_DIR, "favicon.svg"));
  console.log(`✅ /public/icons/favicon.svg`);

  // iOS splash screens (logo on brand gradient)
  const splashSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070A1A"/>
        <stop offset="50%" stop-color="#1A183C"/>
        <stop offset="100%" stop-color="#0A0F2A"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#g)"/>
    <circle cx="256" cy="256" r="230" fill="#1A183C" opacity="0.5"/>
    <path d="M130 438 L112 422 L238 142 L274 158 Z" fill="#FFFFFF"/>
    <path d="M256 108 L232 150 L280 150 Z" fill="#FFFFFF"/>
    <path d="M238 158 L274 142 L398 422 L362 438 Z" fill="#FFFFFF"/>
    <path d="M380 470 L356 430 L404 430 Z" fill="#FFFFFF"/>
    <rect x="185" y="286" width="142" height="28" rx="14" fill="#FFFFFF"/>
  </svg>`;
  const splashBuf = Buffer.from(splashSVG);
  const splashSizes = [
    { name: "splash-390x844.png", w: 390, h: 844 },
    { name: "splash-828x1792.png", w: 828, h: 1792 },
    { name: "splash-1170x2436.png", w: 1170, h: 2436 },
    { name: "splash-1242x2208.png", w: 1242, h: 2208 },
  ];
  for (const s of splashSizes) {
    await sharp(splashBuf).resize(s.w, s.h).png().toFile(path.join(SPLASH_DIR, s.name));
    console.log(`✅ /public/splash/${s.name}`);
  }

  console.log("\n🚀 All PWA icons generated.");
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
