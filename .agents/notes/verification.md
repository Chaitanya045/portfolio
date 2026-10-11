# Verification

## Tooling on this server

- There's no global Playwright. Use `playwright-core` from `/home/chaitanya/.npm/_npx/e41f203b7505f1fb/node_modules/` through `createRequire`, with `executablePath: '/usr/bin/chromium'`.
- The owner views previews from a Mac over Tailscale. Start servers with `--host` and use the Tailscale IP, not localhost.
- Test the production build with `pnpm build && pnpm astro preview --port 4400`. Stop it with `pnpm astro preview stop`.
- `scripts/check-theme-contrast.mjs` checks the 4.5:1 contrast for every theme. `scripts/verify-themes.mjs` runs the browser theme checks.

## Limits of headless Chromium

- **Cross-document view transitions can't be captured here.** They freeze both in headless mode and in headed mode on Xvfb `:99`. Headed runs also need `--ozone-platform=x11` and an environment without `WAYLAND_DISPLAY`.
  - Workaround: replay the transition inside one page. Fetch the destination page, add its stylesheets, call `document.startViewTransition()` with a body swap, record a Chrome DevTools Protocol (CDP) screencast and measure frame brightness with PIL.
  - Say that it was verified this way, and ask the owner to confirm in a real browser.
- **There's no GPU.** Chromium reports SwiftShader, so `src/lib/blaze/renderer.ts` deliberately skips the WebGL hero and the CSS glow shows instead.
  - For captures only, an init script can drop `failIfMajorPerformanceCaveat` and spoof `UNMASKED_RENDERER_WEBGL`. Launch with `--enable-unsafe-swiftshader --use-angle=swiftshader`.
  - `docs/hero.png` (the README screenshot) was made this way: 1440×810 at 2x, with a same-site `referer` so the intro skips and the hero is settled. Never ship this override.
  - A GIF of the intro was tried and rejected: on GitHub it flashed white between frames and stalled, so the README uses a still screenshot.

## Baselines

Lighthouse (2026-10-11):
- Home: 97/100/100/100 on mobile and 100 across the board on desktop.
- Blog post: 98/100/100/100.

Responsiveness was checked at 10 widths, from 320 px to 2560 px, in every theme.
