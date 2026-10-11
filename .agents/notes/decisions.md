# Decisions

Each item is a choice the owner made or confirmed. Don't reverse one without asking.

## Settled

- The hero shows the first name only. The owner chose this deliberately; leave it alone.
- The intro plays on every load of the home page, reloads included. It skips only for deep links (any hash other than `#top`) and reduced motion. Playing it once per session was tried and rejected.
- The scrolling role line under the name (`RoleScroller.astro`) stays.
- The home page has no Writing section, because the blog covers it.
- Blog posts have no site header: a top bar holds the logo (linking home) and "← All posts". The blog list and posts keep the site footer, which pins to the bottom on short pages.
- Paper (light) theme: the WebGL canvas is hidden and paused, and the hero keeps only its CSS gradient. A colour-inverted shader was tried and looked muddy.
- Clicking the header logo while the hero is in view cycles the theme. On other pages it goes home.
- The hero social icons are GitHub, LinkedIn and X (`@chrx_chaitanya`), filled with `--hero-name` on hover.
- The code is MIT-licensed. `LICENSE` stays the unmodified MIT text, so GitHub still detects it. The README's License section keeps the personal content (src/content, resume.ts, the résumé PDF, screenshots, logo and its renders, docs/hero.gif) all rights reserved.

## Open: ask before acting

- Remove the "← Back to home" link from the blog list, and hide the footer's Blog link on blog pages.
- Regenerate `public/og.png` in Graphite.
- Drop the "Vibe Coder" role.
- Vercel deployment: either Git import on vercel.com (recommended, as `develop` is the default branch) or a CLI login on this server. The CLI isn't logged in, and the owner stopped a `vercel login` attempt.

## Ways of working

- Commit and push only when the owner asks.
- Delegate through the T3 orchestrator: Codex GPT-6 Astra at high reasoning, in threads or worktrees. Don't use native subagents.
