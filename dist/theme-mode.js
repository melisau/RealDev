(function () {
  const storageKey = 'realdev-theme';
  let theme = 'light';

  try {
    theme = localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
  } catch (_) {
    // The page still works with the default light theme if storage is blocked.
  }

  function applyTheme(nextTheme) {
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    const button = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    const label = window.realdevLocale === 'en'
      ? (theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme')
      : (theme === 'dark' ? 'Açık temayı aç' : 'Koyu temayı aç');
    if (button) {
      button.setAttribute('aria-label', label);
      button.title = label;
    }
    if (icon) icon.textContent = theme === 'dark' ? '☼' : '◐';
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = theme === 'dark' ? '#22262c' : '#f3f3ed';
  }

  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(theme);
    const button = document.getElementById('themeToggle');
    if (!button) return;
    button.addEventListener('click', function () {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch (_) {
        // The current page theme can still be switched for this session.
      }
    });
  });
})();
