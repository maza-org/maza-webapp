import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../assets');

// The white icon SVG (figure only, no text)
const svgPath = 'C:/Users/User/Downloads/MAZA LOGOS SVG/Maza_Icon-02-branco.svg';
const svgBuffer = fs.readFileSync(svgPath);

// Maza brand blue - matching the app/splash
const BLUE = { r: 41, g: 182, b: 246, alpha: 1 }; // #29B6F6

async function makeIcon(size, padding, outFile, opaque = false) {
  const logoSize = Math.round(size * padding);
  
  const logoBuffer = await sharp(svgBuffer)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  let img = sharp({
    create: { width: size, height: size, channels: 4, background: BLUE }
  }).composite([{ input: logoBuffer, gravity: 'center' }]);

  // iOS requires no alpha channel in icon.png
  if (opaque) img = img.flatten({ background: BLUE });

  const result = await img.png().toBuffer();
  fs.writeFileSync(outFile, result);
  console.log(`✅ ${path.basename(outFile)} (${size}x${size})`);
}

// icon.png — used by iOS App Store & Expo (1024x1024, must be opaque for iOS)
await makeIcon(1024, 0.72, path.join(assetsDir, 'icon.png'), true);

// adaptive-icon.png — Android foreground (1024x1024, figure fits within the 66% safe zone)
await makeIcon(1024, 0.55, path.join(assetsDir, 'adaptive-icon.png'));

// favicon.png — web (48x48)
await makeIcon(48, 0.72, path.join(assetsDir, 'favicon.png'));

console.log('\nAll icons generated!');
