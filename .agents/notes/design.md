# Design

## Brand

- Typography: Outfit Bold for display (the hero name, headings, project and post titles), Inter for body text, and JetBrains Mono only for the small section labels (`.prompt-title`: About, Side projects, Experience…) and the terminal-style project cover. Never adopt a reference site's fonts.
- Logo: the C/S ribbon monogram (`src/components/Logo.astro`). Its gradient runs `--accent-pale` → `--hero-name` → `--accent-strong`, so it follows the theme.
- Graphite is the default theme. `scripts/generate-icons.mjs` bakes the Graphite logo colours into the favicon, touch and app icons. `public/og.png` was rendered in the old Blue theme and hasn't been regenerated.

## Below the hero

- No screenshots or images, and no card or bento grids. The owner rejected a large-screenshot gallery, a bento grid and editorial chapter bands.
- The impact comes from type, rhythm, motion and the theme's light, in a developer-tool style: a `~/projects` index, `~/experience` and contact.
- No big-number stat rows. Case studies had an at-a-glance row ("3 typed tools", "$1 buys 10,000 credits", "Diffed / Atomic / Sandboxed") that the owner found cringe: config values, product pricing and adjectives set as if they were metrics. Put facts in the prose as decisions. Only show a number if it measures a result of the owner's work.

## Reference sites

A shared reference is inspiration only, even when the owner says "make it look like X". Two past mistakes:
- Copying sharath.ai's fonts, layout and timeline.
- Copying t3.gg/blog's all-monospace look and paraphrasing its tagline.

Borrow structure (row layout, hover behaviour), keep this site's fonts and voice, and don't echo the reference's copy. For larger design asks, look at several comparable sites, name the patterns you're borrowing, and offer two or three directions with a recommendation.
- Anything with a hover cue must be clickable across its whole area. Each project row is one link: the title link's `::after` covers the row, so the summary, dates and stack all open the case study, and keyboard focus outlines the whole row.
