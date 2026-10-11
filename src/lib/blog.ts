import { getCollection, type CollectionEntry } from 'astro:content';

// Drafts appear while developing and stay out of production builds.
export const getPosts = async () =>
  (await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

// Roughly 220 words a minute; code blocks count like prose, which suits technical posts.
export const readingMinutes = (post: CollectionEntry<'blog'>) =>
  Math.max(1, Math.round((post.body ?? '').split(/\s+/).filter(Boolean).length / 220));

export const formatDate = (date: Date, month: 'short' | 'long' = 'short') =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month, year: 'numeric', timeZone: 'UTC' });

// Navigation only links to the blog once something is published, so visitors never land on an
// empty page. Drafts don't count, which keeps local previews identical to production.
export const hasPublishedPosts = async () =>
  (await getCollection('blog', ({ data }) => !data.draft)).length > 0;
