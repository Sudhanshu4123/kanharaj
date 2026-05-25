import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const input = path.join(root, 'src', 'app', 'icon.png');

if (!fs.existsSync(input)) {
  console.error('Missing src/app/icon.png');
  process.exit(1);
}

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer()
  )
);

const ico = await toIco(pngBuffers);

const targets = [
  path.join(root, 'public', 'favicon.ico'),
  path.join(root, 'src', 'app', 'favicon.ico'),
];

for (const target of targets) {
  fs.writeFileSync(target, ico);
  console.log('Wrote', target);
}

await sharp(input)
  .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toFile(path.join(root, 'public', 'favicon-32x32.png'));

console.log('Done.');
