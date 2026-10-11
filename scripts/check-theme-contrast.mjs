import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const catalog = readFileSync(new URL('../src/lib/themes.ts', import.meta.url), 'utf8');
const themes = [...catalog.matchAll(/id: '([^']+)', name: '([^']+)'/g)];
const tokens = (body) => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(([, key, value]) => [key, value]));
const defaults = tokens(css.match(/:root\s*\{([^}]+)\}/)[1]);
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(first, second) {
  const a = luminance(first), b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
let failed = false;
console.log('| Theme | Background | Text | Body | Muted | Accent |');
console.log('| --- | --- | ---: | ---: | ---: | ---: |');
for (const [, id, name] of themes) {
  const block = css.match(new RegExp(`:root\\[data-theme="${id}"\\]\\s*\\{([^}]+)\\}`));
  const palette = { ...defaults, ...tokens(block?.[1] ?? '') };
  for (const background of ['bg', 'surface']) {
    const ratios = ['text', 'body', 'muted', 'accent'].map((foreground) => contrast(palette[foreground], palette[background]));
    if (ratios.some((ratio) => ratio < 4.5)) failed = true;
    console.log(`| ${name} | ${background} (${palette[background]}) | ${ratios.map((ratio) => ratio.toFixed(2) + ':1').join(' | ')} |`);
  }
}
if (failed) { console.error('FAIL: every ratio must reach 4.5:1.'); process.exitCode = 1; }
else console.log('\nPASS: all 40 foreground/background pairs meet WCAG AA (4.5:1).');
