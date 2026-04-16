/**
 * Generates placeholder PWA icons using pure Node.js + Canvas API.
 * Run once:  node scripts/generate-icons.mjs
 *
 * Requires:  npm install -D canvas
 * Or swap out with any icon PNG you prefer placed at:
 *   public/icons/icon-192.png
 *   public/icons/icon-512.png
 *   public/icons/icon-180.png   (Apple touch icon)
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background — primary purple
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#5B21B6');
  bg.addColorStop(1, '#7C3AED');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Letter "L"
  const pad  = size * 0.22;
  const sw   = size * 0.09;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth   = sw;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  ctx.beginPath();
  ctx.moveTo(pad + sw / 2, pad);
  ctx.lineTo(pad + sw / 2, size - pad);
  ctx.lineTo(size - pad,   size - pad);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

for (const size of [180, 192, 512]) {
  const buf  = drawIcon(size);
  const name = size === 180 ? 'icon-180.png' : `icon-${size}.png`;
  writeFileSync(join(outDir, name), buf);
  console.log(`✓ public/icons/${name}`);
}
