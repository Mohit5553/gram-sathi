import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public', 'favicon.svg');
const outDir = path.resolve('public');

const sizes = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('favicon.svg not found in public folder');
    return;
  }

  for (const size of sizes) {
    // Generate PWA icons
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `pwa-${size}x${size}.png`));
    
    console.log(`Generated pwa-${size}x${size}.png`);
  }

  // Generate Maskable Icon (same size but optimized with padding if needed)
  await sharp(svgPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(outDir, `maskable-icon-512x512.png`));
  console.log(`Generated maskable-icon-512x512.png`);

  // Generate Apple Touch Icon
  await sharp(svgPath)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(outDir, `apple-touch-icon-180x180.png`));
  console.log(`Generated apple-touch-icon-180x180.png`);
}

generateIcons().catch(console.error);
