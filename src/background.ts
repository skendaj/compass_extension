// Background Service Worker for Chrome Extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TeamSystem Navify installed!');
  
  // Initialize storage with default values
  chrome.storage.local.set({
    firstRun: true,
    installDate: new Date().toISOString(),
  });
  
  // Context menu integration (optional enhancement)
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

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openTeamsChat') {
    // Open Microsoft Teams chat
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openEmail') {
    // Open email client
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  if (request.action === 'openDocumentation') {
    // Open documentation link
    chrome.tabs.create({
      url: request.url,
    });
    sendResponse({ success: true });
  }
  
  return true;
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'searchKnowledge' && info.selectionText) {
    // Store selected text and open popup
    chrome.storage.local.set({
      pendingSearch: info.selectionText,
    });
    chrome.action.openPopup();
  }
});

// Badge notification for new knowledge entries (future enhancement)
function updateBadge(count: number) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Export for TypeScript
export {};

