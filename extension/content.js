// Simple readable text extractor
function getCleanText() {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll("script,style,noscript").forEach(n => n.remove());
  const text = clone.innerText || "";
  return text.replace(/\s+\n/g, "\n").replace(/\n{2,}/g, "\n\n").trim();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "GET_PAGE_TEXT") {
    sendResponse({ text: getCleanText().slice(0, 20000) });
  }
  return true;
});
