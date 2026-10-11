// Chrome and Safari morph shared elements between pages with cross-document view transitions
// (`@view-transition` in global.css). Firefox only has same-document transitions, so its pages
// would swap instantly. There, the page being left records where its named elements were, and the
// next page animates the matching elements from those spots (FLIP) while the rest fades in.

const KEY = 'page-morph';
// How long after leaving a page its snapshot may still be replayed.
const FRESH_MS = 2000;
const EASE = 'cubic-bezier(.22, 1, .36, 1)';

type Box = { x: number; y: number; w: number; font: number; text: boolean };
type Snapshot = { from: string; at: number; boxes: Record<string, Box> };

const root = document.documentElement;
const nativeSupport = 'onpagereveal' in window;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Titles and dates name themselves inline; the logo and header are named in CSS.
function namedElements() {
  const found = new Map<string, HTMLElement>();
  for (const el of document.querySelectorAll<HTMLElement>('[style*="view-transition-name"], [data-site-header], .logo')) {
    const name = getComputedStyle(el).viewTransitionName;
    if (!name || name === 'none' || found.has(name)) continue;
    const box = el.getBoundingClientRect();
    if (box.width && box.bottom > 0 && box.top < innerHeight) found.set(name, el);
  }
  return found;
}

function record() {
  const boxes: Record<string, Box> = {};
  for (const [name, el] of namedElements()) {
    const box = el.getBoundingClientRect();
    boxes[name] = { x: box.left, y: box.top, w: box.width, font: parseFloat(getComputedStyle(el).fontSize), text: !!el.textContent?.trim() };
  }
  try { sessionStorage.setItem(KEY, JSON.stringify({ from: location.href, at: Date.now(), boxes } satisfies Snapshot)); } catch {}
}

function take(): Snapshot | null {
  let snapshot: Snapshot | null = null;
  try {
    snapshot = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
    sessionStorage.removeItem(KEY);
  } catch {}
  if (!snapshot || Date.now() - snapshot.at > FRESH_MS || snapshot.from === location.href) return null;
  return snapshot;
}

function play(snapshot: Snapshot) {
  const moving: HTMLElement[] = [];
  for (const [name, el] of namedElements()) {
    const old = snapshot.boxes[name];
    if (!old) continue;
    // Transforms don't apply to inline boxes, such as the post date.
    if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
    const box = el.getBoundingClientRect();
    // Text scales with its font size so a wrapped title doesn't squash; anything else by width.
    // Text that wraps onto fewer, longer lines here would overshoot the screen at the old size.
    const scale = old.text
      ? Math.min(old.font / parseFloat(getComputedStyle(el).fontSize), Math.max(1, (innerWidth - 16 - old.x) / box.width))
      : old.w / box.width;
    const from = { translate: `${old.x - box.left}px ${old.y - box.top}px`, scale: String(scale), transformOrigin: 'left top' };
    if (Math.abs(old.x - box.left) < 1 && Math.abs(old.y - box.top) < 1 && Math.abs(scale - 1) < .01) continue;
    const animation = el.animate([from, { translate: '0 0', scale: '1', transformOrigin: 'left top' }], { duration: 550, easing: EASE });
    animation.finished.then(() => el.style.removeProperty('display'), () => {});
    moving.push(el);
  }
  if (!moving.length) return;
  // Lets components settle entrance effects that would fight the morph, as `pagereveal` does.
  root.setAttribute('data-morphed', '');
  dispatchEvent(new Event('pagemorph'));

  // Fade in everything else, stepping into any branch that holds a moving element.
  const fadeIn = (parent: Element) => {
    for (const child of parent.children) {
      if (!(child instanceof HTMLElement) || moving.includes(child) || child.matches('script, style')) continue;
      if (moving.some((el) => child.contains(el))) fadeIn(child);
      else child.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 150, easing: 'ease', fill: 'backwards' });
    }
  };
  fadeIn(document.body);
}

if (!nativeSupport) {
  addEventListener('pagehide', () => { if (!reducedMotion.matches) record(); });
  const arrive = () => {
    const snapshot = take();
    if (snapshot && !reducedMotion.matches) play(snapshot);
    delete root.dataset.morph;
  };
  arrive();
  // Pages restored from the back-forward cache don't run scripts again.
  addEventListener('pageshow', (event) => { if (event.persisted) arrive(); });
}
