// Background service worker for EOQ Search Reranker
console.log('EOQ Search Reranker background service worker loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('EOQ Search Reranker installed:', details.reason);
  
  // Initialize default settings
  chrome.storage.sync.set({
    eoqEnabled: true,
    sessionStats: {
      searchesEnhanced: 0,
      totalScoresCalculated: 0,
      averageImprovement: 0
    }
  });
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateStats') {
    updateSessionStats(request.data);
  } else if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey });
    });
    return true; // Keep message channel open for async response
  }
});

// Update session statistics
function updateSessionStats(data) {
  chrome.storage.sync.get(['sessionStats'], (result) => {
    const stats = result.sessionStats || {
      searchesEnhanced: 0,
      totalScoresCalculated: 0,
      averageImprovement: 0
    };
    
    if (data.searchEnhanced) {
      stats.searchesEnhanced++;
    }
    
    if (data.scoresCalculated) {
      stats.totalScoresCalculated += data.scoresCalculated;
    }
    
    if (data.improvement) {
      // Calculate running average improvement
      const totalSearches = stats.searchesEnhanced;
      stats.averageImprovement = ((stats.averageImprovement * (totalSearches - 1)) + data.improvement) / totalSearches;
    }
    
    chrome.storage.sync.set({ sessionStats: stats });
  });
}

// Handle tab updates to reset state if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('google.com/search')) {
    // Could inject additional logic here if needed
    console.log('Google search page loaded:', tab.url);
  }
});
