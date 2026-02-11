import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const outputDir = join(__dirname, '../packages/shell/public/icons');

// SVG icon content
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#1e40af"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="85" fill="url(#skyGradient)"/>
  <!-- Sun -->
  <circle cx="346" cy="160" r="75" fill="#fbbf24"/>
  <g fill="#fbbf24">
    <rect x="336" y="53" width="21" height="43" rx="10"/>
    <rect x="336" y="235" width="21" height="43" rx="10"/>
    <rect x="245" y="149" width="43" height="21" rx="10"/>
    <rect x="405" y="149" width="43" height="21" rx="10"/>
    <rect x="267" y="80" width="21" height="43" rx="10" transform="rotate(45 277 101)"/>
    <rect x="405" y="80" width="21" height="43" rx="10" transform="rotate(-45 415 101)"/>
    <rect x="267" y="208" width="21" height="43" rx="10" transform="rotate(-45 277 229)"/>
    <rect x="405" y="208" width="21" height="43" rx="10" transform="rotate(45 415 229)"/>
  </g>
  <!-- Cloud -->
  <ellipse cx="187" cy="267" rx="93" ry="67" fill="white"/>
  <ellipse cx="267" cy="280" rx="80" ry="59" fill="white"/>
  <ellipse cx="147" cy="293" rx="67" ry="48" fill="white"/>
  <ellipse cx="307" cy="299" rx="59" ry="43" fill="white"/>
  <!-- Rain drops -->
  <g fill="#60a5fa">
    <ellipse cx="133" cy="387" rx="11" ry="21"/>
    <ellipse cx="187" cy="413" rx="11" ry="21"/>
    <ellipse cx="240" cy="395" rx="11" ry="21"/>
    <ellipse cx="293" cy="421" rx="11" ry="21"/>
    <ellipse cx="347" cy="400" rx="11" ry="21"/>
  </g>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }

  // Also create a favicon.ico (32x32)
  const faviconPath = join(__dirname, '../packages/shell/public/favicon.ico');
  await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));

  console.log('PWA icons generated successfully!');
}

generateIcons().catch(console.error);
