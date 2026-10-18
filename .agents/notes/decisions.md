# Decisions

Each item is a choice the owner made or confirmed. Don't reverse one without asking.

## Settled

- The hero shows the first name only. The owner chose this deliberately; leave it alone.
- The intro plays on a first visit from outside the site (a typed URL, LinkedIn, Google…) and on a reload while the hero is in view. It skips navigation within the site (same-origin referrer, such as clicking the logo or Home), back/forward, reloads after scrolling past the hero, deep links (any hash other than `#top`) and reduced motion. Playing it once per session was tried and rejected.
- The scrolling role line under the name (`RoleScroller.astro`) stays. Its roles are Software, Backend, Test Automation and Applied AI Engineer: "Vibe Coder" and "Full Stack" were dropped (2026-10-17) so the roles tell one story, a backend engineer who's strong at testing.
- The home page has no Writing section, because the blog covers it.
- Blog posts have no site header: a top bar holds the logo (linking home) and "← All posts". The blog list and posts keep the site footer, which pins to the bottom on short pages.
- Paper (light) theme: the WebGL canvas is hidden and paused, and the hero keeps only its CSS gradient. A colour-inverted shader was tried and looked muddy.
- Hero motion was trimmed (2026-10-17): the intro, the WebGL glow and the role scroller stay; the cursor-following light and the moving sheen on the name were removed, and the social icons now fade in with the nav links instead of one by one. A line of text under the name was offered and declined.
- Section labels are plain words (About, Side projects, Experience, Contact, Blog), not `~/` paths, and the About bar has no visible "Jump to… ⌘K" button; the ⌘K menu still opens from the keyboard (2026-10-18). Both read as developer cosplay on a one-page site.
- Clicking the header logo while the hero is in view cycles the theme. On other pages it goes home.
- Themes switch instantly. A 3D ripple reveal from the logo (a view transition with a WebGL wave, plus lifted layers so the hero sparks kept moving) was tried and dropped: the owner saw too much flicker, especially at phone sizes.
- The hero social icons are GitHub, LinkedIn and X (`@chrx_chaitanya`), filled with `--hero-name` on hover.
- The code is MIT-licensed. `LICENSE` stays the unmodified MIT text, so GitHub still detects it. The README's License section keeps the personal content (src/content, resume.ts, the résumé PDF, screenshots, logo and its renders, docs/hero.png) all rights reserved.

## Open: ask before acting

- Remove the "← Back to home" link from the blog list, and hide the footer's Blog link on blog pages.
- Regenerate `public/og.png` in Graphite.
- Vercel deployment: either Git import on vercel.com (recommended, as `develop` is the default branch) or a CLI login on this server. The CLI isn't logged in, and the owner stopped a `vercel login` attempt.

## Ways of working

- Commit and push only when the owner asks.
- Delegate through the T3 orchestrator: Codex GPT-6 Astra at high reasoning, in threads or worktrees. Don't use native subagents.
