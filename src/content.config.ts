import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    // Where the post was first published, such as Medium. It becomes the page's canonical URL so
    // search engines credit the original instead of treating this copy as duplicate content.
    canonicalUrl: z.url().optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    kind: z.string(),
    summary: z.string(),
    period: z.string(),
    order: z.number(),
    // A short label such as "Proof of concept", shown beside the title.
    badge: z.string().optional(),
    role: z.string(),
    stack: z.array(z.string()),
    url: z.url(),
    linkLabel: z.string(),
    // Projects without a screenshot get a typographic cover.
    cover: image().optional(),
    coverAlt: z.string().optional(),
    // Up to three headline facts shown under the cover, such as "<40s" / "CI push to live docs".
    highlights: z.array(z.object({ value: z.string(), label: z.string() })).max(3).optional(),
  }),
});

export const collections = { blog, work };
