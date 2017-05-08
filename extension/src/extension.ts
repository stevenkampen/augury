const CHROME_APP_ID = 'eaffpceojnlfkhkjpadlemhdjjgaafhe';

chrome.browserAction.onClicked.addListener(tab =>
  chrome.runtime.sendMessage(CHROME_APP_ID, tab.url));
