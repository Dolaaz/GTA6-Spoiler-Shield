const defaults = [
  "gta 6","gta6","gta vi","grand theft auto vi","grand theft auto 6",
  "lucia","jason duval","jason","vice city","leonida",
  "gta 6 leak","gta vi leak","gta 6 ending","gta 6 gameplay",
  "gta 6 mission","gta 6 story","gta 6 trailer","gta 6 spoiler"
];
const area = document.getElementById('terms');
const status = document.getElementById('status');
function load() {
  chrome.storage.sync.get({terms:defaults}, d => { area.value = (d.terms || defaults).join('\n'); });
}
document.getElementById('save').addEventListener('click', () => {
  const terms = [...new Set(area.value.split('\n').map(x=>x.trim()).filter(Boolean))];
  chrome.storage.sync.set({terms}, () => { status.textContent = `Saved ${terms.length} blocked terms.`; });
});
document.getElementById('reset').addEventListener('click', () => {
  area.value = defaults.join('\n');
  chrome.storage.sync.set({terms:defaults}, () => { status.textContent = 'Default terms restored.'; });
});
load();
