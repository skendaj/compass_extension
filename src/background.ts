chrome.runtime.onInstalled.addListener((details) => {
  console.log('TeamSystem Navify installed!');
  
  chrome.storage.local.set({
    firstRun: true,
    installDate: new Date().toISOString(),
  });
  
  try {
    chrome.contextMenus.create({
      id: 'searchKnowledge',
      title: 'Search in Knowledge Base',
      contexts: ['selection'],
    });
  } catch (e) {
    console.log('Context menu already exists or error:', e);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openTeamsChat') {
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openEmail') {
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openDocumentation') {
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  return true;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchKnowledge' && info.selectionText) {
    chrome.storage.local.set({
      pendingSearch: info.selectionText,
    });
    chrome.action.openPopup();
  }
});

function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

export {};

