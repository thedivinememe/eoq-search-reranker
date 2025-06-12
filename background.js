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
  } else if (request.action === 'fetchContent') {
    // Handle content fetching for the ContentFetcher
    fetchContentForExtension(request.url)
      .then(content => {
        sendResponse({ success: true, content });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
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

// Content fetching function for the extension
async function fetchContentForExtension(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EOQ-Extension/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache'
      },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    
    if (!content || content.length < 100) {
      throw new Error('Insufficient content retrieved');
    }

    return content;
    
  } catch (error) {
    console.warn('Background content fetch failed:', error);
    throw error;
  }
}

// Handle tab updates to reset state if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('google.com/search')) {
    // Could inject additional logic here if needed
    console.log('Google search page loaded:', tab.url);
  }
});
