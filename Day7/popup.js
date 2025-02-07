document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('darkModeToggle');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');

  // Load saved state
  chrome.storage.sync.get(['darkModeEnabled', 'schedule'], function (data) {
    toggle.checked = data.darkModeEnabled || false;
    if (data.schedule) {
      startTime.value = data.schedule.start || '00:00';
      endTime.value = data.schedule.end || '08:00';
    }
  });

  // Save schedule on change
  function saveSchedule() {
    chrome.storage.sync.set({
      schedule: {
        start: startTime.value,
        end: endTime.value,
      },
    });
  }

  startTime.addEventListener('change', saveSchedule);
  endTime.addEventListener('change', saveSchedule);

  // Save state on change
  toggle.addEventListener('change', function () {
    chrome.storage.sync.set({ darkModeEnabled: toggle.checked });

    // Apply to current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        darkMode: toggle.checked,
      });
    });
  });

  // Add site whitelist/blacklist functionality
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = new URL(tabs[0].url).hostname;
    const siteToggle = document.getElementById('siteToggle');

    chrome.storage.sync.get(['siteSettings'], function (data) {
      const sites = data.siteSettings || {};
      siteToggle.checked = sites[currentUrl]?.enabled ?? true;
    });
  });
});
