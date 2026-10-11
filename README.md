# Portfolio

Astro portfolio with strict TypeScript, Tailwind CSS, Motion (build-time springs only), MDX, Zod, and the Vercel adapter. No UI framework is shipped to the browser.

## Development

Use Node.js 24 and pnpm. The exact pnpm version is recorded in `package.json`.

```sh
pnpm install
pnpm dev
```

The development site runs at http://localhost:4321. For an agent-managed background server, use `pnpm dev --background`; manage it with `pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop`.

```sh
pnpm check       # Astro and TypeScript diagnostics
pnpm build       # Production output for Vercel
```

## Structure

- `src/pages/`: file-based routes. The home page is the hero followed by the intro, selected work, experience and contact; `work/[slug].astro` renders each case study.
- `src/data/resume.ts`: profile and experience content, taken from the résumé. `public/Chaitanya_Sanapala_Resume.pdf` is the linked web copy, built from the job-search résumé script without the phone number.
- `src/content/work/`: one MDX case study per project; screenshots live in `src/assets/work/`.
- `src/components/SiteHeader.astro`: centred C/S logo (`Logo.astro`), section links, Bangalore clock and social links.
- `src/scripts/interactions.ts`: shared micro-interactions (scroll reveals, copy-to-clipboard, logo draw after the intro).
- `src/layouts/BaseLayout.astro`: shared document metadata and global styles.
- `src/components/`: reusable Astro components.
- `src/styles/global.css`: Tailwind import, theme tokens, and base styles.
- `src/content/blog/`: Markdown and MDX posts.
- `src/content.config.ts`: Zod-validated blog metadata.

`@/` resolves to `src/`. If a page ever needs a framework component, add the matching Astro integration (for example `@astrojs/react`) and a `client:*` directive.

Below the hero, the home page uses a developer-tool style with no images: a short introduction, a `~/projects` index, `~/experience` and contact. Headings use the hero's self-hosted Outfit Bold, body text uses Inter, and JetBrains Mono appears in the prompt labels and the terminal-style project cover. All three are under the SIL Open Font License (see `licenses/`).

Each project title types itself in once, the first time it scrolls into view, and turns blue on hover or keyboard focus. Case studies can list up to three `highlights` (value and label) in their front matter, shown as an at-a-glance row under the cover. `⌘K` / `Ctrl K`, or the "Jump to…" button, opens a searchable menu of projects, roles and contact links (`src/components/home/CommandMenu.astro`). A project can carry a `badge` in its front matter, such as Zace's "Proof of concept"; it appears beside the project type on the home page and the case study. Clicking a project title morphs it into its case study with cross-document view transitions where supported.

The hero name uses self-hosted Outfit Bold, a geometric sans with subtle letter spacing. Only the 700-weight Latin WOFF2 file is loaded, preloaded on the home page. Its SIL Open Font License is retained in `licenses/outfit.txt`.

Below the name, a single static line shows the title from `profile.title`.

On a fine pointer, the name has a small magnetic drift and a warm highlight that follows the pointer. Motion generates the spring CSS at build time; no animation library is shipped for this interaction. Pointer updates run at most once per animation frame and stop on leave. Pointer effects are disabled for touch, reduced motion, and the motion pause control.

Interaction references: [Motion CSS springs](https://motion.dev/docs/spring) and [Aceternity Text Hover Effect](https://ui.aceternity.com/components/text-hover-effect). [GSAP quickTo](https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/) and [Anime.js scopes](https://animejs.com/documentation/scope/) were also reviewed; the existing Motion dependency can generate the spring during the build for this small effect.

## Ambient background

The home page uses a background-only adaptation of [Canvas UI Blaze](https://canvasui.dev/docs/components/blaze). The original license is retained in `licenses/canvas-ui.txt`.

The shader loads after the page is painted, renders in one WebGL pass with at most about 420,000 pixels, and caps animation at 30 FPS on desktop or 24 FPS on smaller screens. It pauses when hidden, off-screen, or manually paused. With a mouse or trackpad, the cursor acts as a force field on the sparks only (the smoke is unaffected): nearby sparks are pushed aside, dragged along in its wake and brightened, and the effect fades out after a short pause. Rendering rises to 60 FPS only while the pointer is shaping the field. Reduced-motion preferences and unavailable WebGL use the static CSS background. There are no external texture assets or rendering dependencies.

The home page also has a 1.6-second ignition intro: a vertical glowing blue line rotates, expands horizontally, and dissolves into a soft glow as the background opens with feathered edges. It plays on every page load and reload, and skips for reduced motion. Keyboard or pointer interaction skips the intro immediately, and a timeout ensures it cannot block the page. The intro uses CSS animation and adds no runtime dependency.

## Writing

`src/content/blog/post-template.mdx` is a draft template, visible only in development at `/blog/post-template`. Drafts are excluded from production routes. To publish a post, set `draft: false` in its frontmatter; use `title`, `description`, `publishedAt`, and optional `tags`. The Blog links in the header, footer and ⌘K menu appear automatically once at least one post is published; until then the empty blog index is marked `noindex` and left out of the sitemap.

## Deployment

Import the repository into Vercel with the Astro framework preset, `pnpm build` as the build command, and Node.js 24. Pages are prerendered by default. The Vercel adapter is configured so future server endpoints, such as the contact form, can opt into on-demand execution with `export const prerender = false`.

Canonical URLs, Open Graph tags, `robots.txt` and the sitemap use Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) automatically. To use a custom domain, set a `SITE_URL` environment variable such as `https://example.com`. `vercel.json` adds security headers and long-lived caching for the self-hosted fonts.

The social preview image is `public/og.png` (1200×630). Icons and the web manifest live alongside it in `public/`.

The hero's WebGL background starts only after the page is idle, pauses offscreen, steps down its resolution on devices that can't keep up, and is skipped entirely on software renderers, which show the CSS glow instead.

The contact form, email provider, and database are future feature work.
