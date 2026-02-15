// ============================================
// Generates PWA icon PNGs (192x192 & 512x512)
// Uses pure Node.js – no external dependencies.
// Run: node scripts/generate-icons.mjs
// ============================================
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');

if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });

/**
 * Creates a minimal valid PNG file with a branded icon.
 * Uses raw PNG encoding with zlib (built into Node).
 */
import zlib from 'zlib';

function createPNG(width, height, renderFn) {
  // Build raw RGBA pixel data
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = renderFn(x, y, width, height);
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = a;
    }
  }

  // PNG filter: prepend 0 (None) to each row
  const filtered = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (width * 4 + 1)] = 0; // filter type None
    pixels.copy(filtered, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(filtered, { level: 9 });

  // Build PNG file
  const chunks = [];

  // Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(pngChunk('IHDR', ihdr));

  // IDAT
  chunks.push(pngChunk('IDAT', compressed));

  // IEND
  chunks.push(pngChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuffer, data, crc]);
}

// CRC32 for PNG
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ─── Icon Renderer ─────────────────────────────────────
function renderIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.45;
  const innerRadius = w * 0.38;

  // Distance from center
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Dark Slate #0F172A
  const bgR = 15, bgG = 23, bgB = 42;
  // Gold: #D4AF37
  const goldR = 212, goldG = 175, goldB = 55;
  // Purple: #2E1A47
  const purpR = 46, purpG = 26, purpB = 71;

  // Outside circle = transparent
  if (dist > radius + 1) return [0, 0, 0, 0];

  // Anti-aliased edge
  if (dist > radius - 1) {
    const alpha = Math.max(0, Math.min(255, (radius + 1 - dist) * 127));
    return [bgR, bgG, bgB, Math.round(alpha)];
  }

  // Gold ring
  if (dist > innerRadius && dist <= radius) {
    const ringPos = (dist - innerRadius) / (radius - innerRadius);
    if (ringPos > 0.85 || ringPos < 0.05) {
      const blend = ringPos > 0.85 ? (ringPos - 0.85) / 0.15 : (0.05 - ringPos) / 0.05;
      return [
        Math.round(goldR * (1 - blend) + bgR * blend),
        Math.round(goldG * (1 - blend) + bgG * blend),
        Math.round(goldB * (1 - blend) + bgB * blend),
        255
      ];
    }
    return [goldR, goldG, goldB, 255];
  }

  // Inner area — gradient from purple to dark
  const innerDist = dist / innerRadius;
  const gradT = Math.min(1, innerDist * 1.2);
  return [
    Math.round(purpR * (1 - gradT) + bgR * gradT),
    Math.round(purpG * (1 - gradT) + bgG * gradT),
    Math.round(purpB * (1 - gradT) + bgB * gradT),
    255
  ];
}

// ─── Generate Icons ────────────────────────────────────
console.log('Generating icon-192.png ...');
const icon192 = createPNG(192, 192, renderIcon);
writeFileSync(join(ICONS_DIR, 'icon-192.png'), icon192);
console.log(`  ✓ icon-192.png (${icon192.length} bytes)`);

console.log('Generating icon-512.png ...');
const icon512 = createPNG(512, 512, renderIcon);
writeFileSync(join(ICONS_DIR, 'icon-512.png'), icon512);
console.log(`  ✓ icon-512.png (${icon512.length} bytes)`);

console.log('\nDone! Icons written to public/icons/');
