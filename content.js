const DEFAULT_TERMS = [
  "gta 6", "gta6", "gta vi", "grand theft auto vi", "grand theft auto 6",
  "lucia", "jason duval", "jason", "vice city", "leonida",
  "gta 6 leak", "gta vi leak", "gta 6 ending", "gta 6 gameplay",
  "gta 6 mission", "gta 6 story", "gta 6 trailer", "gta 6 spoiler"
];

const SITE_SELECTORS = {
  youtube: "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-comment-view-model, ytd-comment-thread-renderer",
  facebook: "[role='article'], [data-pagelet^='FeedUnit'], [role='feed'] > div",
  reddit: "shreddit-post, .thing, article, [data-testid='post-container'], [data-testid='comment']",
  google: "#search .MjjYud, #rso > div, .g",
  x: "article[data-testid='tweet']",
  tiktok: "[data-e2e='recommend-list-item-container'], [data-e2e='search-card-video'], [data-e2e='comment-item']",
  discord: '[id^="chat-messages-"], [class*="messageListItem"], [class*="messageContent"]'
};

let terms = DEFAULT_TERMS;
let enabled = true;
const processed = new WeakSet();

function normalize(s) {
  return (s || "").toLocaleLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ").trim();
}
function currentSite() {
  const h = location.hostname;
  if (h.includes("youtube")) return "youtube";
  if (h.includes("facebook")) return "facebook";
  if (h.includes("reddit")) return "reddit";
  if (h.includes("google")) return "google";
  if (h === "x.com" || h.includes("twitter")) return "x";
  if (h.includes("tiktok")) return "tiktok";
  if (h === "discord.com" || h.endsWith(".discord.com")) return "discord";
  return "";
}
function matchesTerm(text) {
  const t = normalize(text);
  return terms.some(term => {
    const q = normalize(term);
    return q && t.includes(q);
  });
}
function bestContainer(node, site) {
  let el = node;
  const selectors = SITE_SELECTORS[site];
  if (!selectors) return node;
  const target = node.closest(selectors);
  if (target) return target;
  for (let i = 0; el && i < 5; i++, el = el.parentElement) {
    if (el.matches("article, [role='article'], ytd-rich-item-renderer, ytd-video-renderer, .g, [class*='messageListItem'], [id^='chat-messages-']")) return el;
  }
  return node;
}
function hideElement(el, term) {
  if (!el || el.dataset.gtaShieldHidden === "1") return;
  if (el.closest("[data-gta-shield-ui]")) return;
  el.dataset.gtaShieldHidden = "1";
  el.classList.add("gta-shield-hidden");
  const panel = document.createElement("div");
  panel.className = "gta-shield-panel";
  panel.dataset.gtaShieldUi = "1";
  const label = document.createElement("span");
  label.textContent = "GTA 6 Spoiler Shield hid this content";
  const reason = document.createElement("small");
  reason.textContent = `Matched: ${term}`;
  const reveal = document.createElement("button");
  reveal.type = "button";
  reveal.textContent = "Reveal once";
  reveal.addEventListener("click", () => {
    el.classList.remove("gta-shield-hidden");
    panel.remove();
    el.dataset.gtaShieldRevealed = "1";
  });
  panel.append(label, reason, reveal);
  el.insertBefore(panel, el.firstChild);
}
function scan() {
  if (!enabled) return;
  const site = currentSite();
  const selector = SITE_SELECTORS[site];
  if (!selector) return;
  document.querySelectorAll(selector).forEach(node => {
    if (processed.has(node) || node.dataset.gtaShieldRevealed === "1") return;
    processed.add(node);
    const text = normalize(node.innerText || node.textContent || "");
    const term = terms.find(x => text.includes(normalize(x)));
    if (term) hideElement(bestContainer(node, site), term);
  });
}
function start() {
  chrome.storage.sync.get({ enabled: true, terms: DEFAULT_TERMS }, data => {
    enabled = data.enabled;
    terms = Array.isArray(data.terms) && data.terms.length ? data.terms : DEFAULT_TERMS;
    scan();
    const observer = new MutationObserver(() => scan());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    chrome.storage.onChanged.addListener(changes => {
      if (changes.enabled) enabled = changes.enabled.newValue;
      if (changes.terms) terms = changes.terms.newValue || DEFAULT_TERMS;
      if (enabled) scan();
      else document.querySelectorAll(".gta-shield-hidden").forEach(el => {
        el.classList.remove("gta-shield-hidden");
        el.querySelector(":scope > .gta-shield-panel")?.remove();
      });
    });
  });
}
start();
