## Browser Automation

Use open-browser-use as the primary BrowserUse/browser automation tool.
Prefer the `open-browser-use` MCP server for browser tasks. Check `browser_status`
before the first browser action, use the `js` tool for browser automation, and
keep browser state continuous with persistent `globalThis.browser` / `globalThis.tab`
handles. On this host, acquire the connected backend with
`await agent.browsers.get("chromium")`; the `"chrome"` alias does not match it.
Prefer `browser.tabs.current()` for same-task continuation, and do not
open repeated search tabs once a page has an authoritative success/cart/result signal.
For new workflows, create the first task tab with the target URL and avoid opening
`about:blank` as a bootstrap step.
Use `browser.yieldControl()` / `browser.resumeControl()` for human takeover without
destroying the current task tab.

Use one clearly labeled tab per concurrent agent or task; never navigate or close another agent's tab. Stop before passwords, MFA, CAPTCHA, consent, payments, or ambiguous account selection, identify the exact tab for the user, and yield control. Never expose cookies, tokens, browser history, or storage in chat or tool output.
Run `~/.obu/bin/obu verify --agent=<agent-id> --browser=<browser> --channel=<channel> --extension-id=<extension-id>` if setup appears stale.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
