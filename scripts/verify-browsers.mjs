// Cross-browser responsive and feature audit against a running preview server (BASE, default
// http://localhost:4400). Playwright is supplied externally, as in verify-themes.mjs:
//   PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node scripts/verify-browsers.mjs <chromium|firefox|webkit> [wsEndpoint]
// Pass a ws endpoint to drive a browser in Playwright's Docker image (see .agents/notes/verification.md).
const pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const name = process.argv[2];
const ws = process.argv[3];
const base = process.env.BASE || 'http://localhost:4400';
const type = pw[name];
const b = ws ? await type.connect(ws) : await type.launch(name === 'chromium' ? { executablePath: '/usr/bin/chromium' } : {});
console.log(`== ${name} ${b.version()}`);
const out = `artifacts/browsers/${name}`;
const fs = await import('node:fs'); fs.mkdirSync(out, { recursive: true });
const ctxOpts = (w, h, extra = {}) => ({ viewport: { width: w, height: h }, hasTouch: w < 800, ...(name !== 'firefox' && { isMobile: w < 800 }), ...(w < 800 && name === 'webkit' && { userAgent: pw.devices['iPhone 15'].userAgent, deviceScaleFactor: 3 }), ...extra });

// ---- A: layout across sizes and pages (reduced motion keeps captures settled)
const pages = ['/', '/work/rendro/', '/work/zace/', '/work/zevium/', '/blog/', '/blog/beyond-page-objects/', '/nope-404/'];
const sizes = [[320,640],[360,740],[390,844],[844,390],[768,1024],[1024,768],[1280,800],[1536,864],[1920,1080],[2560,1440]];
const shotSizes = new Set(['320x640', '390x844', '768x1024', '1280x800', '1920x1080']);
const shotPages = new Set(['/', '/blog/', '/blog/beyond-page-objects/', '/work/rendro/']);
let problems = 0;
for (const [w, h] of process.env.SKIP_LAYOUT ? [] : sizes) {
  const ctx = await b.newContext(ctxOpts(w, h, { reducedMotion: 'reduce' }));
  for (const path of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push('pageerror ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push('console ' + m.text().slice(0, 140)); });
    const res = await p.goto(base + path, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const wide = [];
      for (const el of document.querySelectorAll('body *')) {
        const rc = el.getBoundingClientRect();
        if (!rc.width || !(rc.right > vw + 1 || rc.left < -1)) continue;
        if (getComputedStyle(el).position === 'fixed' || el.closest('[aria-hidden="true"],dialog:not([open]),.sr-only,pre')) continue;
        wide.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} [${Math.round(rc.left)}→${Math.round(rc.right)}]`);
      }
      const small = [];
      for (const el of document.querySelectorAll('a,button,input')) {
        const rc = el.getBoundingClientRect(); const cs = getComputedStyle(el);
        if (!rc.width || cs.visibility === 'hidden' || el.closest('.sr-only,dialog:not([open]),[hidden]')) continue;
        if (rc.height < 24 || rc.width < 24) small.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${el.textContent.trim().slice(0, 18)}" ${Math.round(rc.width)}x${Math.round(rc.height)}`);
      }
      const footer = document.querySelector('footer.site-footer');
      const fb = footer ? Math.round(footer.getBoundingClientRect().bottom + scrollY) : null;
      return { sw: document.documentElement.scrollWidth, vw, sh: document.documentElement.scrollHeight, fb, wide: wide.slice(0, 5), small: small.slice(0, 6) };
    });
    const issues = [];
    if (r.sw > r.vw) issues.push(`OVERFLOW scrollWidth=${r.sw} viewport=${r.vw}`);
    if (r.wide.length) issues.push('wide: ' + r.wide.join(' | '));
    if (w < 800 && r.small.length) issues.push('small targets: ' + r.small.join(' | '));
    if (r.fb !== null && Math.abs(r.fb - r.sh) > 2) issues.push(`footer bottom ${r.fb} != page height ${r.sh}`);
    if (errs.length) issues.push('errors: ' + errs.join(' | '));
    if (res.status() >= 400 && path !== '/nope-404/') issues.push('status ' + res.status());
    if (issues.length) { problems++; console.log(`${w}x${h} ${path}\n   ${issues.join('\n   ')}`); }
    if (shotSizes.has(`${w}x${h}`) && shotPages.has(path)) {
      await p.screenshot({ path: `${out}/${w}x${h}${path.replaceAll('/', '_') || '_'}.png`, fullPage: true, scale: 'css' });
    }
    await p.close();
  }
  await ctx.close();
}
console.log(`layout: ${problems} page/size combinations with issues`);

// ---- B: features with motion on
const check = (label, ok, detail = '') => console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ' — ' + detail : ''}`);
for (const [w, h] of [[1280, 800], [390, 844]]) {
  const ctx = await b.newContext(ctxOpts(w, h));
  // Headless Chromium freezes on cross-document view transitions; opt out there only.
  if (name === 'chromium') await ctx.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '@view-transition { navigation: none; }'; document.head.append(s); }));
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  console.log(`-- features ${w}x${h}`);
  await p.goto(base + '/');
  const introStart = await p.evaluate(() => document.documentElement.dataset.intro ?? null);
  await p.waitForTimeout(6000);
  const after = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const header = q('[data-site-header] .capsule') || q('[data-site-header]');
    const name = q('.hero-name-ink');
    const cs = name ? getComputedStyle(name) : null;
    return {
      intro: document.documentElement.dataset.intro ?? null,
      done: document.documentElement.hasAttribute('data-intro-done'),
      navOpacity: [...document.querySelectorAll('.nav-links li, .menu-button')].filter((e) => e.getBoundingClientRect().width).map((e) => getComputedStyle(e).opacity).join(','),
      logoFill: getComputedStyle(document.querySelector('.nav-logo .logo-fill')).opacity,
      socials: [...document.querySelectorAll('.hero-socials li')].map((e) => getComputedStyle(e).opacity).join(','),
      nameClip: cs ? (cs.backgroundClip || cs.webkitBackgroundClip) : 'n/a',
      nameFill: cs ? (cs.webkitTextFillColor || cs.color) : 'n/a',
      backdrop: header ? (getComputedStyle(header).backdropFilter || getComputedStyle(header).webkitBackdropFilter || 'none') : 'n/a',
      blaze: q('[data-blaze]')?.dataset.ready ?? 'no canvas',
      vt: { api: 'startViewTransition' in document, cls: CSS.supports('view-transition-class: a'), types: typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype },
      svh: CSS.supports('height: 100svh'), colorMix: CSS.supports('color: color-mix(in srgb, red, blue)'),
    };
  });
  check('intro plays on first visit', introStart === 'playing');
  check('intro finishes, logo fills, nav and socials visible', !after.intro && after.done && after.logoFill === '1' && !after.navOpacity.split(',').some((o) => o !== '1') && !after.socials.split(',').some((o) => o !== '1'), `nav=${after.navOpacity} logo=${after.logoFill} socials=${after.socials}`);
  check('gradient name text', /text/.test(after.nameClip), `clip=${after.nameClip} fill=${after.nameFill}`);
  console.log(`info backdrop=${after.backdrop} webgl=${after.blaze} viewTransitions=${JSON.stringify(after.vt)} svh=${after.svh} color-mix=${after.colorMix}`);
  // Theme switch from the hero logo
  await p.click('.nav-logo');
  await p.waitForTimeout(700);
  const theme = await p.evaluate(() => [document.documentElement.dataset.theme, localStorage.getItem('theme'), getComputedStyle(document.body).backgroundColor]);
  check('logo click cycles theme', theme[0] === 'blue' && theme[1] === 'blue', theme.join(' '));
  await p.click('.nav-logo'); await p.waitForTimeout(700);
  for (let i = 0; i < 3; i++) { await p.click('.nav-logo'); await p.waitForTimeout(700); }
  check('cycle returns to graphite', await p.evaluate(() => document.documentElement.dataset.theme) === 'graphite');
  // Scroll → solid header
  await p.evaluate(() => scrollTo(0, innerHeight * 1.2)); await p.waitForTimeout(600);
  check('header turns solid on scroll', await p.evaluate(() => document.querySelector('[data-site-header]').hasAttribute('data-solid')));
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
  if (w < 800) {
    await p.click('[data-menu-button]'); await p.waitForTimeout(600);
    const m = await p.evaluate(() => { const el = document.querySelector('[data-mobile-menu]'); const r = el.getBoundingClientRect(); return { hidden: el.hidden, h: Math.round(r.height), links: el.querySelectorAll('a').length }; });
    check('mobile menu opens', !m.hidden && m.h > 50, JSON.stringify(m));
    await p.screenshot({ path: `${out}/feature-mobile-menu.png` });
    await p.click('[data-menu-button]'); await p.waitForTimeout(500);
  } else {
    await p.keyboard.press(name === 'webkit' ? 'Meta+k' : 'Control+k'); await p.waitForTimeout(500);
    let open = await p.evaluate(() => document.querySelector('[data-command]')?.open);
    if (!open) { await p.keyboard.press('Control+k'); await p.waitForTimeout(500); open = await p.evaluate(() => document.querySelector('[data-command]')?.open); }
    await p.keyboard.type('blog'); await p.waitForTimeout(300);
    const visible = await p.evaluate(() => [...document.querySelectorAll('[data-command-item]')].filter((a) => a.offsetParent).length);
    check('⌘K menu opens and filters', open && visible > 0, `open=${open} matches=${visible}`);
    await p.screenshot({ path: `${out}/feature-command.png` });
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  }
  // Blog: list → post → back
  await p.goto(base + '/blog/'); await p.waitForTimeout(400);
  await p.click('.post-list a, a.post'); await p.waitForURL(/\/blog\/.+/, { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(1200);
  const post = await p.evaluate(() => ({ url: location.pathname, h1: document.querySelector('h1')?.textContent.trim().slice(0, 30), op: getComputedStyle(document.querySelector('h1')).opacity, progress: !!document.querySelector('[data-progress], .progress, .reading-progress') }));
  check('blog post opens', post.url.startsWith('/blog/') && post.url.length > 7 && post.op === '1', JSON.stringify(post));
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight / 2)); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/feature-post-${w}.png` });
  await p.goBack(); await p.waitForTimeout(1200);
  check('back returns to the list', await p.evaluate(() => location.pathname) === '/blog/');
  // Home via logo from the list: no intro
  await p.click('.nav-logo'); await p.waitForURL(base + '/', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(300);
  check('home from logo skips intro', await p.evaluate(() => location.pathname === '/' && !document.documentElement.hasAttribute('data-intro')));
  if (errs.length) check('no page errors', false, errs.join(' | '));
  else check('no page errors', true);
  await ctx.close();
}
await b.close();
