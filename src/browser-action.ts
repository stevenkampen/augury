chrome.browserAction.onClicked.addListener(function(tab) {
  console.debug('Browser action triggered.');
  chrome.tabs.executeScript({
    code: `alert('wooo!')`,
  });
});
