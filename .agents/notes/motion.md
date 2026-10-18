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
| `title-<id>` (on the `.project-name` span, not the row-wide link), `cover-<id>` | home page → case study | the project morphs into its case study |
| `post-title-<id>-<n>` (one per word), `post-date-<id>` (class `post-morph`) | blog list ↔ post | the title travels word by word, 35 ms apart, and the date glides into place |
| `site-logo` | header logo ↔ the post's top-bar logo | the logo slides between centre and left |
| `site-header` | header capsule | fades out going to a post, fades in coming back |

- Going to a post, a `pagereveal` script adds the `reading` type; `html:active-view-transition-type(reading)` makes the article rise in.
- Lesson: `::view-transition-group(site-logo)` needs `z-index: 1`. Without it, the `site-header` group paints over the travelling logo on the way back to the list, and the logo dims and blinks as it lands. The logo moves as a single image: its old view is hidden and its new view isn't animated. The header fade-in, `.35s` after a `.2s` delay, ends as the logo lands.
- Word-by-word titles: `src/components/blog/MorphWords.astro` wraps each word in an inline-block span named `post-title-<id>-<n>` with view-transition classes `post-word`, `post-word-large` (the post's heading, `large` prop) or `post-word-small` (the list), and a stagger class `w1`…`w10`. The stagger is pure CSS (30 ms per word, capped at 300 ms) in `global.css`; `data-morph-delay` repeats it for `page-morph.ts`. Both pages must render the title through `MorphWords` so the names match.
- Only the sharp (large) snapshot of each word moves, in both directions, with no crossfade: the class comes from the page being arrived at, so arriving at a post shows the new snapshot and hides the old, and arriving at the list keeps the old and hides the new. Tried and rejected (2026-10-18): `object-fit: none` snapshots (words popped between two fixed sizes instead of scaling) and a crossfade of both snapshots (the small one scaled up blurred into a halo). A JS `pagereveal` handler that delayed animations through `getAnimations()` also worked but was replaced by CSS classes so it doesn't depend on script timing.
- Words take different paths when the title wraps differently on the two pages, so some cross mid-flight. That's inherent to the effect.
- `post-morph` (now just the date) snapshots use `height: 100%; width: auto; object-fit: none; object-position: left top`. Without these, text stretches when the title's size or wrapping changes between pages.

## Firefox fallback (scripted morph)

Firefox 151 supports only same-document view transitions: there's no `@view-transition` rule and no `pagereveal`. `src/scripts/page-morph.ts` stands in for the cross-page morphs there:
- **Leaving a page:** on `pagehide`, it saves the on-screen rectangles of named elements to `sessionStorage['page-morph']`. That includes the `[style*=view-transition-name]` elements, the header and `.logo`.
- **Arriving:** the next page animates the matching elements from those rectangles (translate plus scale, 550 ms, the same easing as the transitions) and fades in everything else.
- **Before first paint:** an inline head script in `BaseLayout.astro` sets `html[data-morph]` (body hidden) until the morph is placed, with a 600 ms safety timeout.
- **Where it runs:** only when `!('onpagereveal' in window)`, and never under reduced motion. Chrome and Safari keep their native transitions. Once Firefox ships cross-document transitions, the fallback turns itself off.
- **Text scale:** text scales by font-size ratio, capped so a title that rewraps wider can't run off the screen.
- **Signal to components:** it sets `data-morphed` and dispatches `pagemorph`. Any entrance effect that would fight a morph should listen for both.

