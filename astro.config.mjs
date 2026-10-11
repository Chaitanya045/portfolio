// @ts-check
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Canonical URLs, Open Graph tags and the sitemap need an absolute origin. Set SITE_URL for a
// custom domain; otherwise Vercel's production domain is used, falling back to local dev.
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercelDomain ? `https://${vercelDomain}` : 'http://localhost:4321');

// The blog index is marked noindex until a post is published, so keep it out of the sitemap too.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const hasPublishedPosts = existsSync(blogDir) && readdirSync(blogDir)
  .filter((file) => /\.mdx?$/.test(file))
  .some((file) => !/^draft:\s*true\s*$/m.test(readFileSync(new URL(file, blogDir), 'utf8')));

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  integrations: [mdx(), sitemap({ filter: (page) => hasPublishedPosts || !page.endsWith('/blog/') })],
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
});
