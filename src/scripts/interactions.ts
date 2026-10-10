// Small, user-driven interactions shared by every page. Content never depends on them:
// without JavaScript, or with reduced motion, everything renders in its final state.

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');

// Let the logo draw itself once the hero intro has finished.
if (root.hasAttribute('data-intro')) {
  new MutationObserver((_, observer) => {
    if (root.hasAttribute('data-intro')) return;
    root.setAttribute('data-intro-done', '');
    observer.disconnect();
  }).observe(root, { attributes: true, attributeFilter: ['data-intro'] });
}

// Reveal blocks and headings as they first enter the viewport.
const revealTargets = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.setAttribute('data-revealed', '');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  root.setAttribute('data-reveal-ready', '');
  revealTargets.forEach((target) => observer.observe(target));
}

// A label pill trails the pointer over [data-cursor] areas, easing toward it each frame.
const cursorAreas = document.querySelectorAll<HTMLElement>('[data-cursor]');
if (cursorAreas.length) {
  const pill = document.createElement('div');
  pill.className = 'cursor-pill';
  pill.setAttribute('aria-hidden', 'true');
  document.body.append(pill);
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;

  const follow = () => {
    x += (targetX - x) * .2;
    y += (targetY - y) * .2;
    pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    frame = Math.abs(targetX - x) + Math.abs(targetY - y) > .3 ? requestAnimationFrame(follow) : 0;
  };

  cursorAreas.forEach((area) => {
    area.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches || reducedMotion.matches) return;
      pill.textContent = area.dataset.cursor ?? '';
      x = targetX = event.clientX;
      y = targetY = event.clientY;
      pill.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pill.setAttribute('data-visible', '');
    });
    area.addEventListener('pointermove', (event) => {
      if (!pill.hasAttribute('data-visible')) return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!frame) frame = requestAnimationFrame(follow);
    });
    area.addEventListener('pointerleave', () => pill.removeAttribute('data-visible'));
  });
  addEventListener('scroll', () => pill.removeAttribute('data-visible'), { passive: true });
}

// Copy buttons swap their label briefly and announce the result.
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
  const label = button.querySelector<HTMLElement>('[data-copy-label]');
  const status = button.parentElement?.querySelector<HTMLElement>('[data-copy-status]');
  let timer = 0;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy!);
    } catch {
      return;
    }
    clearTimeout(timer);
    button.setAttribute('data-copied', '');
    if (label) label.textContent = 'Copied';
    if (status) status.textContent = 'Email address copied';
    timer = window.setTimeout(() => {
      button.removeAttribute('data-copied');
      if (label) label.textContent = 'Copy';
      if (status) status.textContent = '';
    }, 1800);
  });
});
