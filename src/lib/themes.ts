// The first theme is the default; the logo cycles through them in this order.
export const themes = [
  { id: 'graphite', name: 'Graphite', background: '#0a0a0a', scheme: 'dark' },
  { id: 'blue', name: 'Blue', background: '#070b16', scheme: 'dark' },
  { id: 'green', name: 'Green', background: '#06100c', scheme: 'dark' },
  { id: 'rust', name: 'Rust', background: '#120a08', scheme: 'dark' },
  { id: 'paper', name: 'Paper', background: '#f6f6f4', scheme: 'light' },
] as const;

export type Theme = (typeof themes)[number];

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme.id;
  document.documentElement.style.colorScheme = theme.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme.scheme);
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function getThemeInitScript() {
  return `(() => {
  const themes = ${JSON.stringify(themes)};
  let saved;
  try { saved = localStorage.getItem('theme'); } catch {}
  const theme = themes.find((item) => item.id === saved) || themes[0];
  (${applyTheme.toString()})(theme);
})();`;
}
