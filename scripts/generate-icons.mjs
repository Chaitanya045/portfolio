// Renders the favicon, touch and PWA icons from the logo in the default (Graphite) theme colours.
// Run with: node scripts/generate-icons.mjs
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const background = '#0a0a0a';
const stops = ['#f5f5f5', '#d4d4d4', '#8a8a8a'];
const ribbon = 'M315 150H885V280H382L220 512L382 742H693L668 705H520L384 512L525 310H885V440H593L544 512L587 574H735L945 873H315L60 512Z';

// iOS rounds the touch icon itself, so that one stays square.
const svg = ({ radius = 220, scale = 0.82 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="g" x1="60" y1="150" x2="945" y2="873" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${stops[0]}" />
      <stop offset=".5" stop-color="${stops[1]}" />
      <stop offset="1" stop-color="${stops[2]}" />
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="${radius}" fill="${background}" />
  <path transform="translate(512 512) scale(${scale}) translate(-502 -512)" fill="url(#g)" d="${ribbon}" />
</svg>
`;

const png = (source, size) => sharp(Buffer.from(source)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// A minimal ICO container holding PNG images, which every current browser accepts.
function ico(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

const icon = svg();
await writeFile('public/favicon.svg', icon);
await writeFile('public/favicon.ico', ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(icon, size) })))));
await writeFile('public/icon-192.png', await png(icon, 192));
await writeFile('public/icon-512.png', await png(icon, 512));
await writeFile('public/apple-touch-icon.png', await png(svg({ radius: 0, scale: 0.72 }), 180));
