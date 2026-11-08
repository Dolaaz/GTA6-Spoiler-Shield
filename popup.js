const toggle = document.getElementById('enabled');
const status = document.getElementById('status');
chrome.storage.sync.get({enabled:true}, d => {
  toggle.checked = d.enabled;
  status.textContent = d.enabled ? 'Protection is ON' : 'Protection is OFF';
});
toggle.addEventListener('change', () => {
  chrome.storage.sync.set({enabled:toggle.checked});
  status.textContent = toggle.checked ? 'Protection is ON' : 'Protection is OFF';
});
document.getElementById('settings').addEventListener('click', () => chrome.runtime.openOptionsPage());
