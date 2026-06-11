import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../assets');

// White horizontal logo (for dark backgrounds like the story screen)
const logoWhiteBuffer = fs.readFileSync('C:/Users/User/Downloads/MAZA LOGOS SVG/Maza_Logo-01-branco.svg');
const iconWhiteBuffer = fs.readFileSync('C:/Users/User/Downloads/MAZA LOGOS SVG/Maza_Icon-02-branco.svg');

// Horizontal white logo — 560px wide
const logoOut = await sharp(logoWhiteBuffer)
  .resize(560, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
fs.writeFileSync(path.join(assetsDir, 'maza-logo-branco.png'), logoOut);
console.log('✅ maza-logo-branco.png');

// White icon only (circular figure) — for badge
const iconOut = await sharp(iconWhiteBuffer)
  .resize(200, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
fs.writeFileSync(path.join(assetsDir, 'maza-icon-branco.png'), iconOut);
console.log('✅ maza-icon-branco.png');
