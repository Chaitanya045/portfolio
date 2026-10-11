# Motion

## Home intro and header reveal

0. Gating (inline script in `BaseLayout.astro`): it reads `performance.getEntriesByType('navigation')[0].type` and `document.referrer`. A `pagehide` listener saves `sessionStorage['hero-in-view']` (scrollY < half the viewport) so a reload knows where the visitor was. When the intro is skipped, neither `data-intro` nor `data-intro-done` is set, so the logo and nav show immediately.
1. `BaseLayout.astro` sets `html[data-intro="playing"]` before the first paint. `HeroIntro.astro` then runs the 1.6-second ignition: a vertical line rotates flat, widens and dissolves while the shutters open.
2. When the intro ends, `src/scripts/interactions.ts` sets `data-intro-done`. The logo traces its outline (about 1.1 s) and fills in (done by about 1.35 s).
3. The nav links slide in from their own side, nearest the logo first: `--reveal-order`, `calc(1.3s + order × 90ms)`.

The hero content starts at an opacity of .01, not 0. That keeps the hero name eligible as the Largest Contentful Paint (LCP).

## View transitions (cross-document)

`@view-transition { navigation: auto }` is turned off under reduced motion.

| Name | Where | Effect |
| --- | --- | --- |
| `title-<id>`, `cover-<id>` | home page → case study | the project morphs into its case study |
| `post-title-<id>`, `post-date-<id>` (class `post-morph`) | blog list ↔ post | the row's title and date glide into place |
| `site-logo` | header logo ↔ the post's top-bar logo | the logo slides between centre and left |
| `site-header` | header capsule | fades out going to a post, fades in coming back |

- Going to a post, a `pagereveal` script adds the `reading` type; `html:active-view-transition-type(reading)` makes the article rise in.
- Lesson: `::view-transition-group(site-logo)` needs `z-index: 1`. Without it, the `site-header` group paints over the travelling logo on the way back to the list, and the logo dims and blinks as it lands. The logo moves as a single image: its old view is hidden and its new view isn't animated. The header fade-in, `.35s` after a `.2s` delay, ends as the logo lands.
- `post-morph` snapshots use `height: 100%; width: auto; object-fit: none; object-position: left top`. Without these, text stretches when the title's size or wrapping changes between pages.
