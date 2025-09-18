// Opens the side panel when you click the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
    await chrome.sidePanel.setOptions({ tabId: tab.id, path: "sidepanel.html" });
  } catch (e) {
    console.error(e);
  }
});
