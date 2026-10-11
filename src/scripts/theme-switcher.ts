import { applyTheme, themes } from '@/lib/themes';

export function setupThemeSwitcher(header: HTMLElement) {
  const logo = header.querySelector<HTMLAnchorElement>('.nav-logo');
  const label = header.querySelector<HTMLElement>('[data-theme-label]');
  const status = header.querySelector<HTMLElement>('[data-theme-status]');
  if (!logo || !label || !status) return;

  const current = () => themes.find((theme) => theme.id === document.documentElement.dataset.theme) ?? themes[0];
  const available = () => location.pathname === '/' && header.hasAttribute('data-over-hero') && !header.hasAttribute('data-solid');
  let chosen = current();
  let timer = 0;
  let revision = 0;
  let transition: ViewTransition | undefined;
  const updateName = () => {
    logo.setAttribute('aria-label', available()
      ? `Switch colour theme (current: ${current().name})`
      : 'Chaitanya Sanapala, home');
  };
  new MutationObserver(updateName).observe(header, { attributes: true, attributeFilter: ['data-solid'] });
  document.addEventListener('themechange', () => { chosen = current(); updateName(); });
  updateName();

  logo.addEventListener('click', (event) => {
    if (!available() || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    chosen = themes[(themes.indexOf(chosen) + 1) % themes.length]!;
    const theme = chosen;
    const request = ++revision;
    const apply = () => {
      if (request !== revision) return;
      applyTheme(theme);
      try { localStorage.setItem('theme', theme.id); } catch {}
      clearTimeout(timer);
      label.textContent = theme.name;
      label.setAttribute('data-visible', '');
      status.textContent = `${theme.name} theme`;
      timer = window.setTimeout(() => label.removeAttribute('data-visible'), 1200);
    };
    transition?.skipTransition();
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      transition = document.startViewTransition(apply);
    } else {
      apply();
    }
  });
}
