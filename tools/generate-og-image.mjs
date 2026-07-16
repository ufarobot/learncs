import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const width = 1200;
const height = 630;

const hero = await sharp(path.join(root, 'assets/hero-student-organic.png'))
  .resize({
    width: 520,
    height: 580,
    fit: 'contain',
    withoutEnlargement: true,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toBuffer();

const logo = await sharp(path.join(root, 'assets/logo-icon-white-on-black.png'))
  .resize(64, 64)
  .png()
  .toBuffer();

const layout = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <rect x="730" width="470" height="630" fill="#111111"/>
  <rect x="729" width="1" height="630" fill="#e8dccb"/>

  <g font-family="Arial, Helvetica, sans-serif">
    <text x="158" y="106" fill="#111111" font-size="34" font-weight="700">learncs.ru</text>
    <text x="76" y="182" fill="#526170" font-size="24">Онлайн-занятия с преподавателем</text>

    <text x="76" y="274" fill="#111111" font-size="68" font-weight="700">Олимпиадная</text>
    <text x="76" y="350" fill="#111111" font-size="68" font-weight="700">информатика</text>
    <text x="76" y="403" fill="#1f2933" font-size="31">для школьников 5–11 классов</text>

    <rect x="76" y="452" width="566" height="1" fill="#e8dccb"/>
    <circle cx="84" cy="492" r="5" fill="#155d96"/>
    <text x="103" y="500" fill="#1f2933" font-size="23">Индивидуальная траектория</text>
    <circle cx="84" cy="533" r="5" fill="#155d96"/>
    <text x="103" y="541" fill="#1f2933" font-size="23">Задачи с автопроверкой</text>

    <text x="76" y="591" fill="#526170" font-size="22">онлайн в Zoom</text>
    <circle cx="257" cy="584" r="3" fill="#806044"/>
    <text x="276" y="591" fill="#526170" font-size="22">3000 ₽ за занятие</text>
  </g>
</svg>
`);

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: '#ffffff'
  }
})
  .composite([
    { input: layout, left: 0, top: 0 },
    { input: hero, left: 675, top: 25 },
    { input: logo, left: 76, top: 61 }
  ])
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, 'assets/og-image.png'));
