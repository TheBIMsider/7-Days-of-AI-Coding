// Check if page already has dark mode
function hasNativeDarkMode() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  const darkModeClass =
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark-mode');

  return (
    mediaQuery.matches ||
    (metaThemeColor &&
      metaThemeColor.content.match(/(#000|#111|#222|black)/i)) ||
    darkModeClass
  );
}

// Apply dark mode
function applyDarkMode(enable) {
  if (enable && !hasNativeDarkMode()) {
    document.documentElement.classList.add('extension-dark-mode');
  } else {
    document.documentElement.classList.remove('extension-dark-mode');
  }
}

// Listen for toggle events
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  applyDarkMode(request.darkMode);
});

// Check saved state on page load
chrome.storage.sync.get('darkModeEnabled', function (data) {
  applyDarkMode(data.darkModeEnabled);
});

// Add color customization functionality
function applyCustomDarkMode(enable, settings = {}) {
  if (enable && !hasNativeDarkMode()) {
    const colors = {
      background: settings.background || '#1a1a1a',
      text: settings.text || '#e8e8e8',
      links: settings.links || '#3391ff',
    };
    document.documentElement.style.setProperty(
      '--dm-background',
      colors.background
    );
    document.documentElement.style.setProperty('--dm-text', colors.text);
    document.documentElement.style.setProperty('--dm-links', colors.links);
    document.documentElement.classList.add('extension-dark-mode');
  } else {
    document.documentElement.classList.remove('extension-dark-mode');
  }
}
