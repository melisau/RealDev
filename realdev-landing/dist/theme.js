(function () {
  const storageKey = 'realdev-theme';
  let theme = 'light';
  try { theme = localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'; } catch {}
  function updateLabel() {
    const button = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const english = document.documentElement.lang === 'en';
    const label = english ? (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme') : (theme === 'dark' ? 'Açık temayı aç' : 'Koyu temayı aç');
    if (button) { button.setAttribute('aria-label', label); button.title = label; button.setAttribute('aria-pressed', String(theme === 'dark')); }
    if (icon) icon.textContent = theme === 'dark' ? '☼' : '◐';
  }
  function applyTheme(value) {
    theme = value;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#1b2028' : '#f6f8fa';
    updateLabel();
  }
  window.updateRealdevThemeLabel = updateLabel;
  applyTheme(theme);
  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(theme);
    document.getElementById('themeToggle').addEventListener('click', function () {
      applyTheme(theme === 'dark' ? 'light' : 'dark');
      try { localStorage.setItem(storageKey, theme); } catch {}
    });
  });
})();
