import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the SVG file
const svgPath = 'C:/Users/User/Downloads/MAZA LOGOS SVG/Maza_Icon-03-Vertical-branco.svg';
const svgBuffer = fs.readFileSync(svgPath);

// Output paths
const splashOut = path.join(__dirname, '../assets/splash-icon.png');

// Target size for Expo splash (1284x2778 is iPhone max, 1080x1920 for Android)
// We'll use 1242x2688 - a common Expo recommended size
const W = 1242;
const H = 2688;
const LOGO_SIZE = 600; // logo will be ~600px wide, centered

console.log('Converting SVG to PNG for splash...');

// Convert the SVG logo to a properly sized PNG (white on transparent)
const logoBuffer = await sharp(svgBuffer)
  .resize(LOGO_SIZE, Math.round(LOGO_SIZE * 1761 / 1321), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

// Compose: blue background + centered logo
const splashBuffer = await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 41, g: 182, b: 246, alpha: 1 } // Maza blue #29B6F6
  }
})
  .composite([{
    input: logoBuffer,
    gravity: 'center'
  }])
  .png()
  .toBuffer();

fs.writeFileSync(splashOut, splashBuffer);
console.log('✅ splash-icon.png written to:', splashOut);
console.log('   Size:', W, 'x', H);
