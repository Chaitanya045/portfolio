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

// Read blog front matter up front: the blog index is noindex until a post is published, and posts
// republished from elsewhere (with a canonicalUrl) belong to their original URL, not this sitemap.
const blogDir = new URL('./src/content/blog/', import.meta.url);
const posts = existsSync(blogDir)
  ? readdirSync(blogDir)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => ({ slug: file.replace(/\.mdx?$/, ''), source: readFileSync(new URL(file, blogDir), 'utf8') }))
  : [];
const published = posts.filter(({ source }) => !/^draft:\s*true\s*$/m.test(source));
const republished = new Set(published.filter(({ source }) => /^canonicalUrl:/m.test(source)).map(({ slug }) => `/blog/${slug}/`));
/** @param {string} page */
const inSitemap = (page) => {
  const { pathname } = new URL(page);
  if (pathname === '/blog/') return published.length > 0;
  return !republished.has(pathname);
};

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  integrations: [mdx(), sitemap({ filter: inSitemap })],
  markdown: { shikiConfig: { theme: 'tokyo-night' } },
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
});
