import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '../assets');

const svgPath = 'C:/Users/User/Downloads/MAZA LOGOS SVG/Maza_Logo-01-azul.svg';
const svgBuffer = fs.readFileSync(svgPath);

// Render at 2x for retina — target display width ~280px so source 560px
const logoBuffer = await sharp(svgBuffer)
  .resize(560, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const outFile = path.join(assetsDir, 'maza-logo-azul.png');
fs.writeFileSync(outFile, logoBuffer);
console.log('✅ maza-logo-azul.png written');
