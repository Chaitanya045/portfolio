import { getCollection } from 'astro:content';

// Drafts appear while developing and stay out of production builds.
export const getPosts = async () =>
  (await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

// Navigation only links to the blog once something is published, so visitors never land on an
// empty page. Drafts don't count, which keeps local previews identical to production.
export const hasPublishedPosts = async () =>
  (await getCollection('blog', ({ data }) => !data.draft)).length > 0;
