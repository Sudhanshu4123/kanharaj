/**
 * Regenerate favicon assets from public/icon.png (Kanharaj brand icon).
 * Run: node scripts/generate-favicons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const input = path.join(root, 'public', 'icon.png');

if (!fs.existsSync(input)) {
  console.error('Missing public/icon.png');
  process.exit(1);
}

const resizeOpts = { fit: 'cover', position: 'center' };

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(input).resize(size, size, resizeOpts).png().toBuffer()
  )
);

const ico = await toIco(pngBuffers);

const copies = [
  path.join(root, 'public', 'favicon.ico'),
  path.join(root, 'src', 'app', 'favicon.ico'),
  path.join(root, 'public', 'favicon-32x32.png'),
  path.join(root, 'src', 'app', 'icon.png'),
  path.join(root, 'public', 'apple-icon.png'),
  path.join(root, 'src', 'app', 'apple-icon.png'),
];

fs.writeFileSync(copies[0], ico);
fs.writeFileSync(copies[1], ico);
console.log('Wrote favicon.ico');

await sharp(input).resize(32, 32, resizeOpts).png().toFile(copies[2]);
console.log('Wrote favicon-32x32.png');

await sharp(input).resize(512, 512, resizeOpts).png().toFile(copies[3]);
fs.copyFileSync(copies[3], copies[4]);
fs.copyFileSync(copies[3], copies[5]);
console.log('Synced icon.png and apple-icon.png');

console.log('Done — all icons from public/icon.png');
