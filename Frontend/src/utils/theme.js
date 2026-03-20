const THEME_KEY = 'gurukul-theme';

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function applyTheme(theme) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.documentElement.style.colorScheme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  return nextTheme;
}

export function toggleTheme() {
  return applyTheme(getStoredTheme() === 'dark' ? 'light' : 'dark');
}
