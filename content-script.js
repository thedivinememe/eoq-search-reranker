// Main content script that orchestrates the EOQ Search Reranker
(async function() {
  'use strict';
  
  console.log('EOQ Search Reranker initializing...');

  // Check if we're on a Google search page
  if (!SearchInterceptor.isGoogleSearchPage()) {
    console.log('Not a Google search page, exiting');
    return;
  }

  // Global variables
  let calculator = null;
  let interceptor = null;
  let uiInjector = null;
  let scoredResults = [];
  let isProcessing = false;

  // Utility function to sanitize text for safe processing
  function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    
    try {
      // Remove problematic Unicode characters that can cause btoa() issues
      // Keep most Unicode but remove control characters and some problematic ranges
      return text
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/[\uFFF0-\uFFFF]/g, '') // Remove specials
        .replace(/[\u2028\u2029]/g, ' ') // Replace line/paragraph separators with spaces
        .trim();
    } catch (error) {
      console.warn('Text sanitization failed:', error);
      // Fallback: keep only basic ASCII characters
      return text.replace(/[^\x20-\x7E]/g, '').trim();
    }
  }

  // Initialize the extension
  async function initialize() {
    try {
      // Get API key and settings from storage
      const { 
        apiKey, 
        eoqEnabled = true, 
        hideSponsoredResults = true,
        hideAiContent = true,
        hideImages = false,
        hideVideos = false,
        debugMode = false,
        enableContentEnhancement = true,
        preferredModel = 'gpt-4o-mini'
      } = await chrome.storage.sync.get(['apiKey', 'eoqEnabled', 'hideSponsoredResults', 'hideAiContent', 'hideImages', 'hideVideos', 'debugMode', 'enableContentEnhancement', 'preferredModel']);
      
      console.log('API key available:', !!apiKey);
      console.log('EOQ enabled:', eoqEnabled);
      console.log('Debug mode:', debugMode);
      console.log('Content enhancement enabled:', enableContentEnhancement);

      // Initialize components
      calculator = new EOQCalculator(apiKey, preferredModel, enableContentEnhancement);
      interceptor = new SearchInterceptor();
      interceptor.hideSponsoredResults = hideSponsoredResults;
      interceptor.hideAiContent = hideAiContent;
      interceptor.hideImages = hideImages;
      interceptor.hideVideos = hideVideos;
      interceptor.debugMode = debugMode;
      uiInjector = new UIInjector();

      // Extract search results first to ensure page is ready
      const results = interceptor.extractSearchResults();
      if (results.length === 0) {
        console.log('No search results found');
        return;
      }

      // Apply content filtering after we confirm search results exist
      if (results.length > 0) {
        console.log('Search results found, applying content filters...');
        interceptor.identifyAndHandleSponsoredResults();
        interceptor.identifyAndHandleAiContent();
        interceptor.identifyAndHandleImageContent();
        interceptor.identifyAndHandleVideoContent();
      }

      console.log(`Found ${results.length} search results`);

      // Inject UI elements
      uiInjector.inject();

      // Set up event listeners
      setupEventListeners();

      // Start scoring process
      if (eoqEnabled) {
        await processSearchResults(results);
      } else {
        uiInjector.showCompletionStatus(results.length, 'disabled');
      }

    } catch (error) {
      console.error('EOQ initialization error:', error);
      showErrorMessage('Failed to initialize EOQ extension');
    }
  }

  // Process and score all search results
  async function processSearchResults(results) {
    if (isProcessing) {
      console.log('Already processing results, skipping');
      return;
    }

    isProcessing = true;
    scoredResults = [];

    try {
      console.log('Starting EOQ scoring process...');
      
      // Show loading state
      showLoadingState();

      // Score results in parallel for much faster processing
      console.log('Starting parallel EOQ scoring...');
      
      const scoringPromises = results.map(async (result, i) => {
        try {
          console.log(`Processing result ${i + 1}/${results.length}: ${result.title?.substring(0, 50)}...`);
          
          // Safely extract properties to avoid DOM access issues
          let title = '';
          let snippet = '';
          let url = '';
          
          try {
            title = String(result.title || '').trim();
            snippet = String(result.snippet || '').trim();
            url = String(result.url || '').trim();
            
            // Sanitize strings to prevent encoding issues
            title = sanitizeText(title);
            snippet = sanitizeText(snippet);
            url = sanitizeText(url);
            
          } catch (accessError) {
            console.warn(`Property access error for result ${i}:`, accessError);
            // Use fallback values
            title = `Search Result ${i + 1}`;
            snippet = 'Content unavailable';
            url = 'about:blank';
          }
          
          // Create clean object without DOM references for EOQ calculation
          const cleanResult = { title, snippet, url };
          
          // Calculate EOQ score in parallel
          const eoqScore = await calculator.calculateEOQ(cleanResult);
          
          // Create scored result with safe property copying and explicit ordering
          const scoredResult = {
            index: result.index !== undefined ? result.index : i,
            element: result.element,
            title: title,
            url: url,
            snippet: snippet,
            originalPosition: result.originalPosition || (i + 1),
            domain: result.domain || '',
            eoqScore: eoqScore,
            processingOrder: i // Track the order we processed this result
          };
          
          console.log(`Result ${i + 1} scored: ${eoqScore.total.toFixed(2)} (${eoqScore.method})`);
          
          // Update progress safely (approximate since parallel)
          try {
            if (uiInjector && typeof uiInjector.updateProgress === 'function') {
              uiInjector.updateProgress(i + 1, results.length);
            }
          } catch (progressError) {
            console.warn('Progress update failed:', progressError);
          }
          
          return scoredResult;
          
        } catch (error) {
          console.warn(`Failed to score result ${i}:`, error);
          
          // Create safe fallback result
          return {
            index: i,
            element: result.element || null,
            title: `Search Result ${i + 1}`,
            url: 'about:blank',
            snippet: 'Content unavailable',
            originalPosition: i + 1,
            domain: '',
            eoqScore: { 
              total: 0.5, 
              components: { empathy: 0.5, certainty: 0.5, boundary: 0.5, refinement: 0.5 },
              breakdown: {},
              method: 'error'
            },
            processingOrder: i
          };
        }
      });

      // Wait for all scoring to complete
      scoredResults = await Promise.all(scoringPromises);
      
      // Sort by original processing order to maintain consistency
      scoredResults.sort((a, b) => a.processingOrder - b.processingOrder);
      
      console.log(`Parallel scoring completed in ${performance.now() - Date.now()}ms`);

      // Hide loading state
      hideLoadingState();

      // Add score overlays to each result
      scoredResults.forEach(result => {
        if (result.element && result.eoqScore && uiInjector && typeof uiInjector.injectScoreOverlay === 'function') {
          uiInjector.injectScoreOverlay(result.element, result.eoqScore);
        }
      });

      // Reorder results based on EOQ scores
      if (interceptor && typeof interceptor.reorderResults === 'function') {
        interceptor.reorderResults(scoredResults);
      }

      // Show completion status
      const method = scoredResults.length > 0 ? scoredResults[0].eoqScore.method : 'unknown';
      if (uiInjector && typeof uiInjector.showCompletionStatus === 'function') {
        uiInjector.showCompletionStatus(scoredResults.length, method);
      }

      // Update session statistics
      updateSessionStats(scoredResults);

      console.log('EOQ scoring completed successfully');

    } catch (error) {
      console.error('Error processing search results:', error);
      showErrorMessage('Failed to process search results');
    } finally {
      isProcessing = false;
    }
  }

  // Set up event listeners for UI interactions
  function setupEventListeners() {
    // Toggle between EOQ and original ranking
    window.addEventListener('eoq-toggle-change', (event) => {
      const enabled = event.detail.enabled;
      console.log('EOQ toggle changed:', enabled);
      
      if (enabled && scoredResults.length > 0) {
        // Show EOQ ranking
        interceptor.reorderResults(scoredResults);
        uiInjector.toggleOverlays(true);
      } else {
        // Show original ranking
        interceptor.restoreOriginalOrder();
        uiInjector.toggleOverlays(false);
      }
      
      // Save preference
      chrome.storage.sync.set({ eoqEnabled: enabled });
    });

    // Show comparison panel
    window.addEventListener('eoq-show-comparison', () => {
      if (scoredResults.length > 0) {
        uiInjector.showComparisonPanel(scoredResults, interceptor.originalOrder);
      } else {
        showErrorMessage('No scored results available for comparison');
      }
    });

    // Handle page navigation
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        if (SearchInterceptor.isGoogleSearchPage()) {
          console.log('New search detected, reinitializing...');
          cleanup();
          setTimeout(initialize, 1000); // Delay to allow page to load
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      if (SearchInterceptor.isGoogleSearchPage()) {
        console.log('Navigation detected, reinitializing...');
        cleanup();
        setTimeout(initialize, 1000);
      }
    });

    // Handle dynamic content loading (infinite scroll, etc.)
    const contentObserver = new MutationObserver((mutations) => {
      let newResultsFound = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if new search results were added
            if (node.matches && (node.matches('.g') || node.matches('.tF2Cxc') || node.matches('.hlcw0c'))) {
              newResultsFound = true;
            } else if (node.querySelector && node.querySelector('.g, .tF2Cxc, .hlcw0c')) {
              newResultsFound = true;
            }
          }
        });
      });

      if (newResultsFound && !isProcessing) {
        console.log('New search results detected, processing...');
        setTimeout(() => {
          const newResults = interceptor.extractSearchResults();
          if (newResults.length > scoredResults.length) {
            processSearchResults(newResults);
          }
        }, 500);
      }
    });

    // Observe the main search results container
    const searchContainer = document.querySelector('#search, #rso, #center_col');
    if (searchContainer) {
      contentObserver.observe(searchContainer, { childList: true, subtree: true });
    }
  }

  // Show loading state
  function showLoadingState() {
    const overlay = document.createElement('div');
    overlay.id = 'eoq-loading';
    overlay.className = 'eoq-loading-overlay';
    overlay.innerHTML = `
      <div class="eoq-loading-content">
        <div class="eoq-spinner"></div>
        <h3>Optimizing for Human Flourishing</h3>
        <p>Calculating EOQ scores to prioritize content that promotes collective wellbeing...</p>
        <div class="eoq-loading-details">
          <div class="eoq-loading-step">
            <span class="eoq-step-icon">❤️</span>
            <span>Analyzing empathy and care</span>
          </div>
          <div class="eoq-loading-step">
            <span class="eoq-step-icon">🎯</span>
            <span>Evaluating certainty handling</span>
          </div>
          <div class="eoq-loading-step">
            <span class="eoq-step-icon">🌉</span>
            <span>Assessing bridge-building</span>
          </div>
          <div class="eoq-loading-step">
            <span class="eoq-step-icon">🌱</span>
            <span>Measuring growth potential</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Hide loading state
  function hideLoadingState() {
    const overlay = document.getElementById('eoq-loading');
    if (overlay) {
      overlay.remove();
    }
  }

  // Show error message
  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'eoq-error-message';
    errorDiv.innerHTML = `
      <div class="eoq-error-content">
        <span class="eoq-error-icon">⚠️</span>
        <span class="eoq-error-text">${message}</span>
        <button class="eoq-error-close">✕</button>
      </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
    
    // Manual close
    const closeBtn = errorDiv.querySelector('.eoq-error-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      });
    }
  }

  // Update session statistics
  function updateSessionStats(results) {
    if (!results || results.length === 0) return;

    try {
      const stats = interceptor.getReorderingStats(results);
      const averageScore = results.reduce((sum, r) => sum + (r.eoqScore ? r.eoqScore.total : 0), 0) / results.length;
      
      // Send stats to background script
      chrome.runtime.sendMessage({
        action: 'updateStats',
        data: {
          searchEnhanced: true,
          scoresCalculated: results.length,
          improvement: averageScore * 100 // Convert to percentage
        }
      });

      console.log('Session stats updated:', {
        resultsProcessed: results.length,
        averageScore: averageScore,
        reorderingStats: stats
      });
    } catch (error) {
      console.warn('Failed to update session stats:', error);
    }
  }

  // Cleanup function
  function cleanup() {
    if (uiInjector) {
      uiInjector.cleanup();
    }
    
    // Remove loading overlays
    const loadingOverlay = document.getElementById('eoq-loading');
    if (loadingOverlay) loadingOverlay.remove();
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.eoq-error-message');
    errorMessages.forEach(el => el.remove());
    
    // Reset variables
    scoredResults = [];
    isProcessing = false;
    
    console.log('EOQ extension cleaned up');
  }

  // Handle page unload
  window.addEventListener('beforeunload', cleanup);

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
      const settings = message.settings;
      console.log('Settings updated:', settings);
      
      // Update interceptor settings
      if (interceptor) {
        if (settings.hideSponsoredResults !== undefined) {
          interceptor.toggleSponsoredResults(settings.hideSponsoredResults);
        }
        if (settings.hideAiContent !== undefined) {
          interceptor.toggleAiContent(settings.hideAiContent);
        }
        if (settings.hideImages !== undefined) {
          interceptor.toggleImageContent(settings.hideImages);
        }
        if (settings.hideVideos !== undefined) {
          interceptor.toggleVideoContent(settings.hideVideos);
        }
        if (settings.debugMode !== undefined) {
          interceptor.debugMode = settings.debugMode;
          console.log('Debug mode updated:', settings.debugMode);
        }
      }
      
      // Update calculator settings
      if (calculator && settings.enableContentEnhancement !== undefined) {
        calculator.setContentEnhancement(settings.enableContentEnhancement);
        console.log('Content enhancement updated:', settings.enableContentEnhancement);
      }
      
      // Handle EOQ toggle
      if (settings.eoqEnabled !== undefined) {
        if (settings.eoqEnabled && scoredResults.length > 0) {
          interceptor.reorderResults(scoredResults);
          uiInjector.toggleOverlays(true);
        } else {
          interceptor.restoreOriginalOrder();
          uiInjector.toggleOverlays(false);
        }
      }
      
      sendResponse({ success: true });
    } else if (message.action === 'getFailureStats') {
      // Return failure statistics from the calculator
      const failureStats = calculator ? calculator.getFailureStats() : { total: 0 };
      sendResponse({ failureStats });
    }
  });

  // Wait for page to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    // Page is already loaded
    setTimeout(initialize, 100);
  }

  // Expose global functions for debugging
  if (typeof window !== 'undefined') {
    window.EOQDebug = {
      getScores: () => scoredResults,
      getStats: () => interceptor ? interceptor.getReorderingStats(scoredResults) : null,
      reprocess: () => {
        if (interceptor) {
          const results = interceptor.extractSearchResults();
          return processSearchResults(results);
        }
      },
      cleanup: cleanup
    };
  }

})();
