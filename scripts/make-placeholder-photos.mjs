#!/usr/bin/env node
/**
 * One-off helper: creates 10 warm placeholder photos so the site builds and
 * looks presentable before the real photos arrive.
 *
 * Run:  node scripts/make-placeholder-photos.mjs
 *
 * To use the REAL photos, just overwrite public/photos/01.jpg .. 10.jpg
 * and redeploy. Do not run this script again afterwards - it would overwrite them.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "photos");

const PALETTES = [
  ["#2b1a1d", "#7d4a4f", "#c8737a"],
  ["#1f1a17", "#6d5334", "#c9a96e"],
  ["#241a1f", "#8a5a63", "#e0b3a3"],
  ["#1c1a20", "#5b4a63", "#b98ea0"],
  ["#2a1e18", "#8a6242", "#d8b384"],
  ["#191b1c", "#4c5a5c", "#a8b6ac"],
  ["#2d1c22", "#93555f", "#dba1a1"],
  ["#211d16", "#75633c", "#d3c08a"],
  ["#251a1c", "#7f4954", "#cf8f93"],
  ["#1b1718", "#5f4147", "#c2989a"],
];

function svg(index, [dark, mid, light]) {
  const w = 1600;
  const h = 1200;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="55%" stop-color="${mid}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${300 + index * 90}" cy="${420 + (index % 3) * 120}" r="${260 + index * 14}" fill="#ffffff" opacity="0.05"/>
  <circle cx="${1250 - index * 60}" cy="${820 - (index % 4) * 90}" r="${190 + index * 10}" fill="#ffffff" opacity="0.045"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="150"
        fill="#ffffff" opacity="0.30" letter-spacing="14">${String(index + 1).padStart(2, "0")}</text>
  <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="34"
        fill="#ffffff" opacity="0.42" letter-spacing="9">PLACEHOLDER PHOTO</text>
</svg>`;
}

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.error("`sharp` is not installed. Run `npm install` first.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  for (let i = 0; i < PALETTES.length; i += 1) {
    const target = join(OUT_DIR, `${String(i + 1).padStart(2, "0")}.jpg`);
    if (existsSync(target) && !process.argv.includes("--force")) {
      console.log(`   skip ${target} (already exists - pass --force to overwrite)`);
      continue;
    }
    const buf = await sharp(Buffer.from(svg(i, PALETTES[i])))
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    writeFileSync(target, buf);
    console.log(`   wrote ${target} (${(buf.length / 1024).toFixed(0)} kB)`);
  }

  console.log("\n  Placeholder photos ready. Overwrite public/photos/NN.jpg with the real ones.\n");
}

main();
