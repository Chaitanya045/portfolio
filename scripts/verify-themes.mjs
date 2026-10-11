import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

const base = 'http://localhost:4337';
const output = 'artifacts/themes';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const errors = [];
const results = [];
const record = (message) => { results.push(message); console.log(message); };
const watch = (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
};
const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
};
const theme = (page) => page.evaluate(() => document.documentElement.dataset.theme);
try {
  for (const id of ['blue', 'green', 'rust', 'paper', 'graphite']) {
    for (const [size, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      watch(page);
      await page.addInitScript((id) => {
        localStorage.setItem('theme', id);
        // Sample every pre-paint frame, including frames before deferred scripts run.
        window.paintThemes = [];
        const sample = () => {
          window.paintThemes.push(document.documentElement.dataset.theme);
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }, id);
      for (const [route, path] of [['hero', '/'], ['section', '/#experience'], ['blog', '/blog/beyond-page-objects/']]) {
        await page.goto(base + path); await settle(page);
        assert.equal(await theme(page), id);
        assert.deepEqual(await page.evaluate(() => [...new Set(window.paintThemes)]), [id]);
        await page.screenshot({ path: `${output}/${id}-${size}-${route}.png` });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${id} ${route} overflow`);
        if (id === 'paper' && route === 'blog') {
          const pre = page.locator('pre').first();
          assert.equal(await pre.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(26, 27, 38)');
          await pre.scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${output}/paper-${size}-code.png` });
        }
      }
      record(`${id} ${size}: hero, section, article, pre-paint persistence, no overflow`);
      await page.close();
    }
  }

  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion });
    const page = await context.newPage();
    watch(page);
    await page.addInitScript(() => {
      sessionStorage.setItem('intro-played', '1');
      window.transitionCalls = 0;
      const original = document.startViewTransition?.bind(document);
      if (original) document.startViewTransition = (...args) => { window.transitionCalls++; return original(...args); };
    });
    await page.goto(base); await settle(page);
    const logo = page.locator('.nav-logo');
    assert.equal(await logo.getAttribute('aria-label'), 'Switch colour theme (current: Blue)');
    for (const name of ['Green', 'Rust', 'Paper', 'Graphite', 'Blue']) {
      await logo.click();
      await page.waitForFunction((id) => document.documentElement.dataset.theme === id, name.toLowerCase());
      assert.equal(await logo.getAttribute('aria-label'), `Switch colour theme (current: ${name})`);
      assert.equal(await page.locator('[data-theme-label]').textContent(), name);
      assert.equal(await page.locator('[data-theme-status]').textContent(), `${name} theme`);
      assert.equal(await page.locator('[data-theme-status]').getAttribute('aria-live'), 'polite');
      assert.equal(new URL(page.url()).hash, '');
      assert.equal(await page.evaluate(() => localStorage.getItem('theme')), name.toLowerCase());
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), name === 'Paper' ? 'light' : 'dark');
      assert.equal(await page.locator('meta[name="theme-color"]').getAttribute('content'), await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()));
      await page.waitForTimeout(300);
      assert.equal(await page.locator('[data-theme-label]').evaluate((el) => getComputedStyle(el).opacity), '1');
    }
    assert.equal(await page.evaluate(() => window.transitionCalls), reducedMotion === 'reduce' ? 0 : 5);
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('[data-theme-label]').evaluate((el) => getComputedStyle(el).opacity), '0');
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-site-header]').hasAttribute('data-solid'));
    assert.equal(await logo.getAttribute('aria-label'), 'Chaitanya Sanapala, home');
    await logo.click();
    assert.equal(new URL(page.url()).hash, '#top');
    assert.equal(await theme(page), 'blue');
    await page.waitForFunction(() => !document.querySelector('[data-site-header]').hasAttribute('data-solid'));
    await logo.click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'green');
    await page.reload(); await settle(page);
    assert.equal(await theme(page), 'green');
    for (const path of ['/blog/', '/work/rendro/', '/blog/beyond-page-objects/']) {
      const destination = await page.context().newPage(); watch(destination);
      await destination.goto(base + path); await settle(destination);
      assert.equal(await theme(destination), 'green');
      const home = destination.getByRole('link', { name: 'Chaitanya Sanapala, home', exact: true }).first();
      assert.equal(await home.getAttribute('href'), '/');
      await home.click(); await destination.waitForURL(base + '/'); await settle(destination);
      assert.equal(await theme(destination), 'green');
      await destination.close();
    }
    record(`${reducedMotion}: cycle, label, live region, accessible names, transition calls, #top, reload and all home links pass`);
    await context.close();
  }

  // Unsupported View Transitions and denied storage still allow an in-memory switch.
  const fallback = await browser.newPage(); watch(fallback);
  await fallback.addInitScript(() => {
    document.startViewTransition = undefined;
    const get = Storage.prototype.getItem;
    const set = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'theme') throw new DOMException('denied', 'SecurityError');
      return get.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'theme') throw new DOMException('denied', 'SecurityError');
      return set.call(this, key, value);
    };
  });
  await fallback.goto(base); await settle(fallback);
  await fallback.locator('.nav-logo').click();
  assert.equal(await theme(fallback), 'green');
  record('Unsupported transitions + denied storage: switch succeeds');
  await fallback.close();
  assert.deepEqual(errors, []);
  record('No console errors or uncaught page errors');
  await writeFile(`${output}/browser-results.json`, JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
