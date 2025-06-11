// EOQ Search Reranker - Popup JavaScript
document.addEventListener('DOMContentLoaded', async function() {
  console.log('EOQ Popup loaded');

  // DOM elements
  const apiKeyInput = document.getElementById('api-key');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility');
  const saveKeyBtn = document.getElementById('save-key');
  const testKeyBtn = document.getElementById('test-key');
  const apiStatus = document.getElementById('api-status');
  
  const searchCountEl = document.getElementById('search-count');
  const resultsScoredEl = document.getElementById('results-scored');
  const avgImprovementEl = document.getElementById('avg-improvement');
  
  const enableEoqCheckbox = document.getElementById('enable-eoq');
  const showOverlaysCheckbox = document.getElementById('show-overlays');
  const cacheScoresCheckbox = document.getElementById('cache-scores');
  const hideSponsoredCheckbox = document.getElementById('hide-sponsored');
  const debugModeCheckbox = document.getElementById('debug-mode');
  
  const clearCacheBtn = document.getElementById('clear-cache');
  const exportDataBtn = document.getElementById('export-data');
  const resetStatsBtn = document.getElementById('reset-stats');
  
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');

  // Initialize popup
  await initializePopup();

  // Event listeners
  toggleVisibilityBtn.addEventListener('click', toggleApiKeyVisibility);
  saveKeyBtn.addEventListener('click', saveApiKey);
  testKeyBtn.addEventListener('click', testApiConnection);
  
  enableEoqCheckbox.addEventListener('change', updateSettings);
  showOverlaysCheckbox.addEventListener('change', updateSettings);
  cacheScoresCheckbox.addEventListener('change', updateSettings);
  hideSponsoredCheckbox.addEventListener('change', updateSettings);
  debugModeCheckbox.addEventListener('change', updateSettings);
  
  clearCacheBtn.addEventListener('click', clearCache);
  exportDataBtn.addEventListener('click', exportData);
  resetStatsBtn.addEventListener('click', resetStats);

  // Footer links
  document.getElementById('about-link').addEventListener('click', showAboutDialog);
  document.getElementById('privacy-link').addEventListener('click', showPrivacyDialog);
  document.getElementById('support-link').addEventListener('click', showSupportDialog);

  // Initialize popup data
  async function initializePopup() {
    try {
      showLoading('Loading settings...');
      
      // Load saved settings
      const settings = await chrome.storage.sync.get([
        'apiKey', 
        'enableEOQ', 
        'showOverlays', 
        'cacheScores',
        'hideSponsoredResults',
        'debugMode'
      ]);

      // Populate API key (masked)
      if (settings.apiKey) {
        apiKeyInput.value = maskApiKey(settings.apiKey);
        apiKeyInput.dataset.actualValue = settings.apiKey;
        showStatus('API key loaded', 'success');
      }

      // Update checkboxes
      enableEoqCheckbox.checked = settings.eoqEnabled !== false;
      showOverlaysCheckbox.checked = settings.showOverlays !== false;
      cacheScoresCheckbox.checked = settings.cacheScores !== false;
      hideSponsoredCheckbox.checked = settings.hideSponsoredResults !== false;
      debugModeCheckbox.checked = settings.debugMode === true;

      // Update statistics
      updateStatistics(settings.sessionStats);

      // Update diagnostics
      updateDiagnostics();

      hideLoading();
    } catch (error) {
      console.error('Failed to initialize popup:', error);
      showStatus('Failed to load settings', 'error');
      hideLoading();
    }
  }

  // Toggle API key visibility
  function toggleApiKeyVisibility() {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    toggleVisibilityBtn.textContent = isPassword ? '🙈' : '👁️';
    toggleVisibilityBtn.title = isPassword ? 'Hide API Key' : 'Show API Key';
  }

  // Save API key
  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format. Should start with "sk-"', 'error');
      return;
    }

    try {
      showLoading('Saving API key...');
      
      await chrome.storage.sync.set({ apiKey });
      apiKeyInput.dataset.actualValue = apiKey;
      apiKeyInput.value = maskApiKey(apiKey);
      apiKeyInput.type = 'password';
      toggleVisibilityBtn.textContent = '👁️';
      
      showStatus('API key saved successfully', 'success');
      hideLoading();
    } catch (error) {
      console.error('Failed to save API key:', error);
      showStatus('Failed to save API key', 'error');
      hideLoading();
    }
  }

  // Test API connection
  async function testApiConnection() {
    const apiKey = apiKeyInput.dataset.actualValue || apiKeyInput.value.trim();
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      showStatus('Please enter a valid API key first', 'error');
      return;
    }

    try {
      showLoading('Testing API connection...');
      
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const hasGPT4 = data.data.some(model => model.id.includes('gpt-4'));
        
        if (hasGPT4) {
          showStatus('✅ API connection successful! GPT-4 access confirmed.', 'success');
        } else {
          showStatus('⚠️ API works but no GPT-4 access. Will use available models.', 'info');
        }
      } else if (response.status === 401) {
        showStatus('❌ Invalid API key. Please check your key.', 'error');
      } else if (response.status === 429) {
        showStatus('⚠️ Rate limit exceeded. API key is valid but quota reached.', 'info');
      } else {
        showStatus(`❌ API error: ${response.status}`, 'error');
      }
      
      hideLoading();
    } catch (error) {
      console.error('API test failed:', error);
      showStatus('❌ Connection failed. Check your internet connection.', 'error');
      hideLoading();
    }
  }

  // Update settings
  async function updateSettings() {
    try {
      const settings = {
        eoqEnabled: enableEoqCheckbox.checked,
        showOverlays: showOverlaysCheckbox.checked,
        cacheScores: cacheScoresCheckbox.checked,
        hideSponsoredResults: hideSponsoredCheckbox.checked,
        debugMode: debugModeCheckbox.checked
      };

      await chrome.storage.sync.set(settings);
      
      // Send message to content scripts to update
      try {
        const tabs = await chrome.tabs.query({ url: 'https://www.google.com/search*' });
        for (const tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            settings: settings
          }).catch(() => {
            // Ignore errors for tabs without content script
          });
        }
      } catch (error) {
        console.warn('Could not update content scripts:', error);
      }

      showStatus('Settings updated', 'success');
    } catch (error) {
      console.error('Failed to update settings:', error);
      showStatus('Failed to update settings', 'error');
    }
  }

  // Clear cache
  async function clearCache() {
    if (!confirm('Are you sure you want to clear the EOQ score cache? This will remove all stored scores.')) {
      return;
    }

    try {
      showLoading('Clearing cache...');
      
      await chrome.storage.local.remove(['eoqCache']);
      showStatus('Cache cleared successfully', 'success');
      
      hideLoading();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      showStatus('Failed to clear cache', 'error');
      hideLoading();
    }
  }

  // Export data
  async function exportData() {
    try {
      showLoading('Preparing export...');
      
      const data = await chrome.storage.sync.get();
      const exportData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        settings: {
          eoqEnabled: data.eoqEnabled,
          showOverlays: data.showOverlays,
          cacheScores: data.cacheScores
        },
        sessionStats: data.sessionStats || {},
        // Don't export API key for security
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eoq-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatus('Data exported successfully', 'success');
      hideLoading();
    } catch (error) {
      console.error('Failed to export data:', error);
      showStatus('Failed to export data', 'error');
      hideLoading();
    }
  }

  // Reset statistics
  async function resetStats() {
    if (!confirm('Are you sure you want to reset all session statistics? This cannot be undone.')) {
      return;
    }

    try {
      showLoading('Resetting statistics...');
      
      const resetStats = {
        searchesEnhanced: 0,
        totalScoresCalculated: 0,
        averageImprovement: 0
      };

      await chrome.storage.sync.set({ sessionStats: resetStats });
      updateStatistics(resetStats);
      
      showStatus('Statistics reset successfully', 'success');
      hideLoading();
    } catch (error) {
      console.error('Failed to reset statistics:', error);
      showStatus('Failed to reset statistics', 'error');
      hideLoading();
    }
  }

  // Update statistics display
  function updateStatistics(stats) {
    if (!stats) {
      stats = {
        searchesEnhanced: 0,
        totalScoresCalculated: 0,
        averageImprovement: 0
      };
    }

    searchCountEl.textContent = stats.searchesEnhanced || 0;
    resultsScoredEl.textContent = stats.totalScoresCalculated || 0;
    avgImprovementEl.textContent = `${Math.round(stats.averageImprovement || 0)}%`;
  }

  // Update diagnostics display
  async function updateDiagnostics() {
    try {
      // Get current API key status
      const { apiKey } = await chrome.storage.sync.get(['apiKey']);
      const scoringMethodEl = document.getElementById('scoring-method');
      const apiFailuresEl = document.getElementById('api-failures');
      
      if (!apiKey) {
        scoringMethodEl.textContent = '📊 Heuristic (No API Key)';
        scoringMethodEl.className = 'method-value heuristic';
        apiFailuresEl.style.display = 'none';
        return;
      }

      if (!apiKey.startsWith('sk-')) {
        scoringMethodEl.textContent = '⚠️ Heuristic (Invalid API Key)';
        scoringMethodEl.className = 'method-value error';
        apiFailuresEl.style.display = 'none';
        return;
      }

      // Try to get failure stats from active tabs
      try {
        const tabs = await chrome.tabs.query({ url: 'https://www.google.com/search*' });
        let failureStats = null;
        
        for (const tab of tabs) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, {
              action: 'getFailureStats'
            });
            if (response && response.failureStats) {
              failureStats = response.failureStats;
              break;
            }
          } catch (error) {
            // Tab might not have content script loaded
            continue;
          }
        }

        if (failureStats && failureStats.total > 0) {
          scoringMethodEl.textContent = '⚠️ Mixed (API Issues Detected)';
          scoringMethodEl.className = 'method-value warning';
          
          // Show failure breakdown
          apiFailuresEl.style.display = 'block';
          document.getElementById('rate-limit-count').textContent = failureStats.rateLimits || 0;
          document.getElementById('auth-error-count').textContent = failureStats.authErrors || 0;
          document.getElementById('network-error-count').textContent = failureStats.networkErrors || 0;
          document.getElementById('parse-error-count').textContent = failureStats.parseErrors || 0;
          document.getElementById('other-error-count').textContent = failureStats.otherErrors || 0;
          
          // Show recommendations
          const recommendationsEl = document.getElementById('failure-recommendations');
          const recommendations = generateRecommendations(failureStats);
          recommendationsEl.innerHTML = recommendations;
          
        } else {
          scoringMethodEl.textContent = '🤖 OpenAI API';
          scoringMethodEl.className = 'method-value openai';
          apiFailuresEl.style.display = 'none';
        }
        
      } catch (error) {
        console.warn('Could not get failure stats from content scripts:', error);
        scoringMethodEl.textContent = '🤖 OpenAI API (Status Unknown)';
        scoringMethodEl.className = 'method-value openai';
        apiFailuresEl.style.display = 'none';
      }
      
    } catch (error) {
      console.error('Failed to update diagnostics:', error);
    }
  }

  // Generate recommendations based on failure patterns
  function generateRecommendations(failureStats) {
    const recommendations = [];
    
    if (failureStats.rateLimits > 0) {
      recommendations.push(`
        <div class="recommendation">
          <span class="rec-icon">🚫</span>
          <div class="rec-content">
            <strong>Rate Limit Issues:</strong> Your API key is hitting rate limits. 
            Consider upgrading your OpenAI plan or enabling score caching to reduce API calls.
          </div>
        </div>
      `);
    }
    
    if (failureStats.authErrors > 0) {
      recommendations.push(`
        <div class="recommendation">
          <span class="rec-icon">🔐</span>
          <div class="rec-content">
            <strong>Authentication Errors:</strong> Your API key may be invalid or expired. 
            Try testing your API connection above or check your OpenAI account.
          </div>
        </div>
      `);
    }
    
    if (failureStats.networkErrors > 0) {
      recommendations.push(`
        <div class="recommendation">
          <span class="rec-icon">🌐</span>
          <div class="rec-content">
            <strong>Network Issues:</strong> Connection problems detected. 
            Check your internet connection or try again later.
          </div>
        </div>
      `);
    }
    
    if (failureStats.parseErrors > 0) {
      recommendations.push(`
        <div class="recommendation">
          <span class="rec-icon">📝</span>
          <div class="rec-content">
            <strong>Response Parsing Errors:</strong> OpenAI API returned unexpected responses. 
            This may indicate API issues or model changes. The extension will use heuristic scoring as fallback.
          </div>
        </div>
      `);
    }
    
    if (recommendations.length === 0) {
      recommendations.push(`
        <div class="recommendation">
          <span class="rec-icon">✅</span>
          <div class="rec-content">
            <strong>All Good:</strong> No specific issues detected. 
            The extension is working as expected with your API configuration.
          </div>
        </div>
      `);
    }
    
    return recommendations.join('');
  }

  // Utility functions
  function maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) return apiKey;
    return apiKey.substring(0, 7) + '•'.repeat(Math.max(0, apiKey.length - 11)) + apiKey.substring(apiKey.length - 4);
  }

  function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `status-message ${type}`;
    apiStatus.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      apiStatus.style.display = 'none';
    }, 5000);
  }

  function showLoading(message) {
    loadingText.textContent = message;
    loadingOverlay.style.display = 'flex';
  }

  function hideLoading() {
    loadingOverlay.style.display = 'none';
  }

  // Dialog functions
  function showAboutDialog() {
    alert(`EOQ Search Reranker v1.0.0

The Existence Optimization Quotient (EOQ) framework evaluates content based on its potential to promote human flourishing rather than just engagement or profit.

Created to demonstrate how search results could be optimized for collective wellbeing and positive social impact.

Learn more about the EOQ framework and its philosophical foundations at the project repository.`);
  }

  function showPrivacyDialog() {
    alert(`Privacy Policy - EOQ Search Reranker

🔒 Your Privacy Matters:
• API keys are stored locally in your browser only
• No personal data is collected or transmitted
• Search queries are only sent to OpenAI for scoring
• No tracking, analytics, or data sharing
• All processing happens locally in your browser

🛡️ Data Security:
• API keys are encrypted in Chrome's secure storage
• Cache data is stored locally and never transmitted
• You can clear all data at any time
• Extension works offline with heuristic scoring

For questions about privacy, please contact the project maintainers.`);
  }

  function showSupportDialog() {
    alert(`Support - EOQ Search Reranker

🆘 Need Help?
• Check the extension's GitHub repository for documentation
• Report bugs or request features via GitHub issues
• Join community discussions about the EOQ framework

🔧 Troubleshooting:
• Ensure you have a valid OpenAI API key
• Check that you have GPT-4 access for best results
• Try clearing the cache if scores seem incorrect
• Disable and re-enable the extension if needed

💡 Tips:
• The extension works with heuristic scoring without an API key
• Higher EOQ scores indicate content more likely to promote human flourishing
• Use the comparison panel to see ranking differences

Thank you for helping optimize search for human flourishing!`);
  }

  // Listen for storage changes to update UI
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.sessionStats) {
      updateStatistics(changes.sessionStats.newValue);
    }
  });

  // Refresh stats periodically
  setInterval(async () => {
    try {
      const { sessionStats } = await chrome.storage.sync.get(['sessionStats']);
      updateStatistics(sessionStats);
    } catch (error) {
      console.warn('Failed to refresh stats:', error);
    }
  }, 5000);
});
