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
  }),
});

export const collections = { blog, work };
