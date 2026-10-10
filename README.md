# Portfolio

Astro portfolio foundation with React, strict TypeScript, Tailwind CSS, Motion, MDX, Zod, and the Vercel adapter.

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

- `src/pages/`: file-based routes; the home page shows Chaitanya centered over the ambient background.
- `src/layouts/BaseLayout.astro`: shared document metadata and global styles.
- `src/components/`: interactive React components and reusable Astro components.
- `src/styles/global.css`: Tailwind import, theme tokens, and base styles.
- `src/content/blog/`: Markdown and MDX posts.
- `src/content.config.ts`: Zod-validated blog metadata.

`@/` resolves to `src/`. Add an Astro `client:*` directive only when a React component needs browser interactivity. `WaveButton.tsx` is a removable Motion example with a reduced-motion policy.

The hero name uses self-hosted Outfit Bold, a geometric sans with subtle letter spacing. Only the 700-weight Latin WOFF2 file is loaded, preloaded on the home page. Its SIL Open Font License is retained in `licenses/outfit.txt`.

Below the name, `RoleScroller.astro` cycles through resume-backed roles with a feathered vertical scroll every four seconds. Roles softly blur and fade during each slide; a thin copper progress line fills over the same four-second interval. Text and progress pause together during the intro, when the tab is hidden, on hover, and with the keyboard-accessible motion control. It uses CSS animation without React hydration or additional dependencies. Reduced motion shows a static role and hides the progress line. Screen readers receive the complete role list as static text.

On a fine pointer, the name has a small magnetic drift and a warm highlight that follows the pointer. Motion generates the spring CSS at build time; no animation library is shipped for this interaction. Pointer updates run at most once per animation frame and stop on leave. Hovering over the role line holds a complete role for reading. Pointer effects are disabled for touch, reduced motion, and the motion pause control.

Interaction references: [Motion CSS springs](https://motion.dev/docs/spring) and [Aceternity Text Hover Effect](https://ui.aceternity.com/components/text-hover-effect). [GSAP quickTo](https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/) and [Anime.js scopes](https://animejs.com/documentation/scope/) were also reviewed; the existing Motion dependency can generate the spring during the build for this small effect.

## Ambient background

The home page uses a background-only adaptation of [Canvas UI Blaze](https://canvasui.dev/docs/components/blaze). The original license is retained in `licenses/canvas-ui.txt`.

The shader loads after the page is painted, renders in one WebGL pass with at most about 420,000 pixels, and caps animation at 30 FPS on desktop or 24 FPS on smaller screens. It pauses when hidden, off-screen, or manually paused. Reduced-motion preferences and unavailable WebGL use the static CSS background. There are no external texture assets or rendering dependencies.

The home page also has a 1.6-second ignition intro: a vertical ember line rotates, expands horizontally, and dissolves into a soft glow as the background opens with feathered edges. It plays on every page load and reload, and skips for reduced motion. Keyboard or pointer interaction skips the intro immediately, and a timeout ensures it cannot block the page. The intro uses CSS animation and adds no runtime dependency.

## Writing

The sample draft is available in development at `/blog/a-new-beginning`. Drafts are excluded from production routes. To publish a post, set `draft: false` in its frontmatter; use `title`, `description`, `publishedAt`, and optional `tags`.

## Deployment

Import the repository into Vercel with the Astro framework preset, `pnpm build` as the build command, and Node.js 24. Pages are prerendered by default. The Vercel adapter is configured so future server endpoints, such as the contact form, can opt into on-demand execution with `export const prerender = false`.

Set Astro's `site` option in `astro.config.mjs` once the production domain is known. The contact form, email provider, and database are future feature work.
