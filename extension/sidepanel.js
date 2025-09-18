const out = document.getElementById("out");
const btn = document.getElementById("analyze");

function log(msg) {
  out.textContent = String(msg);
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function getPageText(tabId) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  const resp = await chrome.tabs.sendMessage(tabId, { type: "GET_PAGE_TEXT" });
  return resp?.text ?? "";
}

async function summarizeLocally(text) {
  const hasAI = typeof window !== "undefined" && "ai" in window && window.ai?.summarizer;
  if (!hasAI) {
    return { summary: null, note: "Built-in AI not available. Hello world fallback." };
  }
  try {
    const summarizer = await window.ai.summarizer.create({
      type: "key-points"
    });
    const clipped = text.slice(0, 8000);
    const result = await summarizer.summarize(clipped);
    return { summary: result, note: "On-device summary (Summarizer API)." };
  } catch (e) {
    console.error(e);
    return { summary: null, note: "Failed to create/use Summarizer." };
  }
}

btn.addEventListener("click", async () => {
  log("Working...");
  try {
    const tabId = await getActiveTabId();
    if (!tabId) return log("No active tab.");

    const text = await getPageText(tabId);
    if (!text) return log("Couldn't extract page text.");

    const { summary, note } = await summarizeLocally(text);

    if (summary) {
      log(`✅ ${note}\n\n${summary}`);
    } else {
      const words = text.split(/\s+/).filter(Boolean).length;
      const preview = text.slice(0, 400);
      log(`ℹ️ ${note}\n\nWords detected: ${words}\n\nPreview:\n${preview}…`);
    }
  } catch (e) {
    console.error(e);
    log("Execution error. Check the extension console.");
  }
});
