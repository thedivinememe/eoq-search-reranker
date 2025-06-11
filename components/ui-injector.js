// UI Injector - Handles all visual elements and overlays for the EOQ extension
class UIInjector {
  constructor() {
    this.isInjected = false;
    this.comparisonPanelOpen = false;
  }

  // Main injection method
  inject() {
    if (this.isInjected) {
      console.log('UI already injected, skipping');
      return;
    }

    this.injectToggleButton();
    this.injectComparisonPanel();
    this.setupEventListeners();
    this.isInjected = true;
    
    console.log('EOQ UI components injected successfully');
  }

  // Inject the main toggle button
  injectToggleButton() {
    // Remove existing toggle if present
    const existing = document.getElementById('eoq-toggle-container');
    if (existing) existing.remove();

    const toggleHtml = `
      <div id="eoq-toggle-container" class="eoq-toggle-container">
        <div class="eoq-toggle-header">
          <span class="eoq-logo">🌟</span>
          <span class="eoq-title">EOQ Ranking</span>
        </div>
        <label class="eoq-toggle">
          <input type="checkbox" id="eoq-toggle" checked>
          <span class="eoq-toggle-slider"></span>
        </label>
        <div class="eoq-toggle-actions">
          <button id="eoq-info-btn" class="eoq-info-btn" title="What is EOQ?">?</button>
          <button id="eoq-compare-btn" class="eoq-compare-btn" title="Compare Rankings">⚖️</button>
        </div>
        <div id="eoq-status" class="eoq-status">
          <span class="eoq-status-text">Calculating scores...</span>
          <div class="eoq-progress-bar">
            <div class="eoq-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      </div>
    `;
    
    // Insert the toggle button
    document.body.insertAdjacentHTML('beforeend', toggleHtml);
  }

  // Inject score overlay on individual search results
  injectScoreOverlay(element, eoqScore) {
    // Remove existing overlay
    const existing = element.querySelector('.eoq-score-overlay');
    if (existing) existing.remove();

    const method = eoqScore.method || 'unknown';
    const methodIcon = method === 'openai' ? '🤖' : '📊';
    const methodText = method === 'openai' ? 'AI Analysis' : 'Heuristic';

    const overlayHtml = `
      <div class="eoq-score-overlay">
        <div class="eoq-score-header">
          <div class="eoq-score-badge" style="background-color: ${this.getScoreColor(eoqScore.total)}">
            <span class="eoq-score-value">EOQ: ${(eoqScore.total * 100).toFixed(0)}%</span>
            <span class="eoq-method" title="${methodText}">${methodIcon}</span>
          </div>
          <button class="eoq-expand-btn" title="Show details">▼</button>
        </div>
        
        <div class="eoq-score-details" style="display: none;">
          <div class="eoq-components-grid">
            <div class="eoq-component" title="Empathy Contribution (40% weight)">
              <span class="eoq-icon">❤️</span>
              <span class="eoq-label">Empathy</span>
              <span class="eoq-value">${(eoqScore.components.empathy * 100).toFixed(0)}%</span>
              <div class="eoq-bar">
                <div class="eoq-bar-fill" style="width: ${eoqScore.components.empathy * 100}%; background-color: #E91E63;"></div>
              </div>
            </div>
            
            <div class="eoq-component" title="Certainty Management (25% weight)">
              <span class="eoq-icon">🎯</span>
              <span class="eoq-label">Certainty</span>
              <span class="eoq-value">${(eoqScore.components.certainty * 100).toFixed(0)}%</span>
              <div class="eoq-bar">
                <div class="eoq-bar-fill" style="width: ${eoqScore.components.certainty * 100}%; background-color: #2196F3;"></div>
              </div>
            </div>
            
            <div class="eoq-component" title="Boundary Permeability (20% weight)">
              <span class="eoq-icon">🌉</span>
              <span class="eoq-label">Bridges</span>
              <span class="eoq-value">${(eoqScore.components.boundary * 100).toFixed(0)}%</span>
              <div class="eoq-bar">
                <div class="eoq-bar-fill" style="width: ${eoqScore.components.boundary * 100}%; background-color: #FF9800;"></div>
              </div>
            </div>
            
            <div class="eoq-component" title="Refinement Velocity (15% weight)">
              <span class="eoq-icon">🌱</span>
              <span class="eoq-label">Growth</span>
              <span class="eoq-value">${(eoqScore.components.refinement * 100).toFixed(0)}%</span>
              <div class="eoq-bar">
                <div class="eoq-bar-fill" style="width: ${eoqScore.components.refinement * 100}%; background-color: #4CAF50;"></div>
              </div>
            </div>
          </div>
          
          ${this.generateEmpathyBreakdown(eoqScore.breakdown)}
        </div>
      </div>
    `;
    
    element.insertAdjacentHTML('beforeend', overlayHtml);
    
    // Add click handler for expand button
    const expandBtn = element.querySelector('.eoq-expand-btn');
    const details = element.querySelector('.eoq-score-details');
    
    if (expandBtn && details) {
      expandBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isVisible = details.style.display !== 'none';
        details.style.display = isVisible ? 'none' : 'block';
        expandBtn.textContent = isVisible ? '▼' : '▲';
        expandBtn.title = isVisible ? 'Show details' : 'Hide details';
      });
    }
  }

  // Generate empathy breakdown section
  generateEmpathyBreakdown(breakdown) {
    if (!breakdown || !breakdown.empathy) return '';

    const empathy = breakdown.empathy;
    
    return `
      <div class="eoq-empathy-breakdown">
        <h4 class="eoq-breakdown-title">Empathy Breakdown:</h4>
        <div class="eoq-empathy-rules">
          <div class="eoq-rule" title="Reciprocity - treating others as you'd want to be treated">
            <span class="eoq-rule-icon">🥇</span>
            <span class="eoq-rule-name">Golden Rule</span>
            <span class="eoq-rule-value">${(empathy.golden * 100).toFixed(0)}%</span>
          </div>
          <div class="eoq-rule" title="Non-harm - avoiding causing harm to others">
            <span class="eoq-rule-icon">🥈</span>
            <span class="eoq-rule-name">Silver Rule</span>
            <span class="eoq-rule-value">${(empathy.silver * 100).toFixed(0)}%</span>
          </div>
          <div class="eoq-rule" title="Other-centeredness - considering others' actual needs">
            <span class="eoq-rule-icon">🏆</span>
            <span class="eoq-rule-name">Platinum Rule</span>
            <span class="eoq-rule-value">${(empathy.platinum * 100).toFixed(0)}%</span>
          </div>
          <div class="eoq-rule" title="Universal care - promoting collective flourishing">
            <span class="eoq-rule-icon">💝</span>
            <span class="eoq-rule-name">Universal Love</span>
            <span class="eoq-rule-value">${(empathy.love * 100).toFixed(0)}%</span>
          </div>
        </div>
        ${breakdown.empathy.reasoning ? `<p class="eoq-reasoning">${breakdown.empathy.reasoning}</p>` : ''}
      </div>
    `;
  }

  // Get color based on EOQ score
  getScoreColor(score) {
    if (score >= 0.8) return '#4CAF50';      // Green - Excellent
    if (score >= 0.6) return '#8BC34A';      // Light Green - Good
    if (score >= 0.4) return '#FFC107';      // Amber - Fair
    if (score >= 0.2) return '#FF9800';      // Orange - Poor
    return '#F44336';                         // Red - Very Poor
  }

  // Inject comparison panel
  injectComparisonPanel() {
    // Remove existing panel
    const existing = document.getElementById('eoq-comparison-panel');
    if (existing) existing.remove();

    const panelHtml = `
      <div id="eoq-comparison-panel" class="eoq-comparison-panel" style="display: none;">
        <div class="eoq-panel-header">
          <h3>EOQ vs Traditional Ranking Comparison</h3>
          <button id="eoq-close-comparison" class="eoq-close-btn">✕</button>
        </div>
        
        <div class="eoq-comparison-stats">
          <div class="eoq-stat">
            <span class="eoq-stat-value" id="eoq-moved-count">0</span>
            <span class="eoq-stat-label">Results Moved</span>
          </div>
          <div class="eoq-stat">
            <span class="eoq-stat-value" id="eoq-avg-change">0</span>
            <span class="eoq-stat-label">Avg Position Change</span>
          </div>
          <div class="eoq-stat">
            <span class="eoq-stat-value" id="eoq-top-score">0%</span>
            <span class="eoq-stat-label">Highest EOQ Score</span>
          </div>
        </div>
        
        <div class="eoq-comparison-content">
          <div class="eoq-ranking-column">
            <h4>🌟 EOQ Optimized</h4>
            <div class="eoq-ranking-description">
              Ranked by human flourishing potential
            </div>
            <ol id="eoq-ranking-list" class="eoq-ranking-list"></ol>
          </div>
          
          <div class="traditional-ranking-column">
            <h4>🔍 Traditional Google</h4>
            <div class="eoq-ranking-description">
              Ranked by relevance and authority
            </div>
            <ol id="traditional-ranking-list" class="eoq-ranking-list"></ol>
          </div>
        </div>
        
        <div class="eoq-panel-footer">
          <div class="eoq-legend">
            <div class="eoq-legend-item">
              <span class="eoq-legend-color" style="background-color: #4CAF50;"></span>
              <span>Excellent (80%+)</span>
            </div>
            <div class="eoq-legend-item">
              <span class="eoq-legend-color" style="background-color: #8BC34A;"></span>
              <span>Good (60-79%)</span>
            </div>
            <div class="eoq-legend-item">
              <span class="eoq-legend-color" style="background-color: #FFC107;"></span>
              <span>Fair (40-59%)</span>
            </div>
            <div class="eoq-legend-item">
              <span class="eoq-legend-color" style="background-color: #FF9800;"></span>
              <span>Poor (20-39%)</span>
            </div>
            <div class="eoq-legend-item">
              <span class="eoq-legend-color" style="background-color: #F44336;"></span>
              <span>Very Poor (0-19%)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div id="eoq-comparison-backdrop" class="eoq-comparison-backdrop" style="display: none;"></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', panelHtml);
  }

  // Show comparison panel with data
  showComparisonPanel(scoredResults, originalOrder) {
    const panel = document.getElementById('eoq-comparison-panel');
    const backdrop = document.getElementById('eoq-comparison-backdrop');
    
    if (!panel || !backdrop) {
      console.error('Comparison panel elements not found');
      return;
    }

    // Populate comparison data
    this.populateComparisonData(scoredResults, originalOrder);
    
    // Show panel
    panel.style.display = 'block';
    backdrop.style.display = 'block';
    this.comparisonPanelOpen = true;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  // Hide comparison panel
  hideComparisonPanel() {
    const panel = document.getElementById('eoq-comparison-panel');
    const backdrop = document.getElementById('eoq-comparison-backdrop');
    
    if (panel) panel.style.display = 'none';
    if (backdrop) backdrop.style.display = 'none';
    
    this.comparisonPanelOpen = false;
    document.body.style.overflow = '';
  }

  // Populate comparison panel with data
  populateComparisonData(scoredResults, originalOrder) {
    if (!scoredResults || scoredResults.length === 0) return;

    // Sort by EOQ score for EOQ ranking
    const eoqSorted = [...scoredResults].sort((a, b) => {
      const scoreA = a.eoqScore ? a.eoqScore.total : 0;
      const scoreB = b.eoqScore ? b.eoqScore.total : 0;
      return scoreB - scoreA;
    });

    // Calculate statistics
    let totalChange = 0;
    let moved = 0;
    let topScore = 0;

    eoqSorted.forEach((result, newIndex) => {
      const change = Math.abs(result.originalPosition - (newIndex + 1));
      if (change > 0) {
        moved++;
        totalChange += change;
      }
      if (result.eoqScore && result.eoqScore.total > topScore) {
        topScore = result.eoqScore.total;
      }
    });

    // Update statistics
    document.getElementById('eoq-moved-count').textContent = moved;
    document.getElementById('eoq-avg-change').textContent = moved > 0 ? (totalChange / moved).toFixed(1) : '0';
    document.getElementById('eoq-top-score').textContent = `${(topScore * 100).toFixed(0)}%`;

    // Populate EOQ ranking list
    const eoqList = document.getElementById('eoq-ranking-list');
    eoqList.innerHTML = eoqSorted.map((result, index) => {
      const score = result.eoqScore ? result.eoqScore.total : 0;
      const change = result.originalPosition - (index + 1);
      const changeIcon = change > 0 ? '↑' : change < 0 ? '↓' : '→';
      const changeColor = change > 0 ? '#4CAF50' : change < 0 ? '#FF9800' : '#666';
      
      return `
        <li class="eoq-comparison-item">
          <div class="eoq-item-header">
            <span class="eoq-position-change" style="color: ${changeColor};">
              ${changeIcon} ${Math.abs(change)}
            </span>
            <span class="eoq-item-score" style="background-color: ${this.getScoreColor(score)};">
              ${(score * 100).toFixed(0)}%
            </span>
          </div>
          <div class="eoq-item-title">${this.truncateText(result.title, 60)}</div>
          <div class="eoq-item-domain">${result.domain}</div>
        </li>
      `;
    }).join('');

    // Populate traditional ranking list
    const traditionalList = document.getElementById('traditional-ranking-list');
    traditionalList.innerHTML = originalOrder.map((result, index) => {
      const score = result.eoqScore ? result.eoqScore.total : 0;
      
      return `
        <li class="eoq-comparison-item">
          <div class="eoq-item-header">
            <span class="eoq-item-score" style="background-color: ${this.getScoreColor(score)};">
              ${(score * 100).toFixed(0)}%
            </span>
          </div>
          <div class="eoq-item-title">${this.truncateText(result.title, 60)}</div>
          <div class="eoq-item-domain">${result.domain}</div>
        </li>
      `;
    }).join('');
  }

  // Update progress bar
  updateProgress(current, total) {
    const progressFill = document.querySelector('.eoq-progress-fill');
    const statusText = document.querySelector('.eoq-status-text');
    
    if (progressFill && statusText) {
      const percentage = (current / total) * 100;
      progressFill.style.width = `${percentage}%`;
      statusText.textContent = `Calculating scores... ${current}/${total}`;
    }
  }

  // Show completion status
  showCompletionStatus(totalResults, method) {
    const statusText = document.querySelector('.eoq-status-text');
    const progressFill = document.querySelector('.eoq-progress-fill');
    
    if (statusText && progressFill) {
      progressFill.style.width = '100%';
      const methodText = method === 'openai' ? 'AI analysis' : 'heuristic analysis';
      statusText.textContent = `✓ Scored ${totalResults} results using ${methodText}`;
      
      // Hide status after delay
      setTimeout(() => {
        const status = document.getElementById('eoq-status');
        if (status) status.style.display = 'none';
      }, 3000);
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Toggle button
    const toggle = document.getElementById('eoq-toggle');
    if (toggle) {
      toggle.addEventListener('change', (e) => {
        this.handleToggleChange(e.target.checked);
      });
    }

    // Info button
    const infoBtn = document.getElementById('eoq-info-btn');
    if (infoBtn) {
      infoBtn.addEventListener('click', () => {
        this.showInfoTooltip();
      });
    }

    // Compare button
    const compareBtn = document.getElementById('eoq-compare-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        // This will be handled by the main content script
        window.dispatchEvent(new CustomEvent('eoq-show-comparison'));
      });
    }

    // Close comparison panel
    const closeBtn = document.getElementById('eoq-close-comparison');
    const backdrop = document.getElementById('eoq-comparison-backdrop');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideComparisonPanel();
      });
    }
    
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        this.hideComparisonPanel();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.comparisonPanelOpen) {
        this.hideComparisonPanel();
      }
    });
  }

  // Handle toggle change
  handleToggleChange(enabled) {
    // Dispatch custom event for main content script to handle
    window.dispatchEvent(new CustomEvent('eoq-toggle-change', {
      detail: { enabled }
    }));
    
    // Update visual state
    const overlays = document.querySelectorAll('.eoq-score-overlay');
    overlays.forEach(overlay => {
      overlay.style.display = enabled ? 'block' : 'none';
    });
  }

  // Show info tooltip
  showInfoTooltip() {
    // Remove any existing tooltip first
    const existingTooltip = document.querySelector('.eoq-info-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement('div');
    tooltip.className = 'eoq-info-tooltip';
    tooltip.innerHTML = `
      <div class="eoq-tooltip-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0;">Existence Optimization Quotient (EOQ)</h4>
          <button class="eoq-tooltip-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
        </div>
        <p>EOQ measures content based on its potential to promote human flourishing:</p>
        <ul>
          <li><strong>Empathy (40%)</strong>: Considers collective benefit and wellbeing</li>
          <li><strong>Certainty (25%)</strong>: Appropriately handles uncertainty and limitations</li>
          <li><strong>Boundaries (20%)</strong>: Builds bridges rather than creating divisions</li>
          <li><strong>Growth (15%)</strong>: Promotes learning and positive development</li>
        </ul>
        <p>Higher scores indicate content more likely to contribute to human flourishing.</p>
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          Click anywhere to close this tooltip
        </div>
      </div>
    `;
    
    document.body.appendChild(tooltip);
    
    // Position tooltip safely
    const infoBtn = document.getElementById('eoq-info-btn');
    if (infoBtn) {
      const rect = infoBtn.getBoundingClientRect();
      const tooltipWidth = 350; // max-width from CSS
      const tooltipHeight = 300; // estimated height
      
      // Calculate position to keep tooltip on screen
      let top = rect.bottom + 10;
      let right = 20;
      
      // Adjust if tooltip would go off bottom of screen
      if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - 10;
      }
      
      // Adjust if tooltip would go off left side of screen
      if (window.innerWidth - right < tooltipWidth) {
        right = window.innerWidth - tooltipWidth - 20;
      }
      
      tooltip.style.position = 'fixed';
      tooltip.style.top = `${Math.max(10, top)}px`;
      tooltip.style.right = `${Math.max(10, right)}px`;
      tooltip.style.zIndex = '10002';
    }
    
    // Remove tooltip function
    const removeTooltip = (event) => {
      // Don't remove if clicking inside the tooltip
      if (event && tooltip.contains(event.target)) {
        return;
      }
      
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
      
      // Clean up event listeners
      document.removeEventListener('click', removeTooltip);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    // Handle keyboard events
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        removeTooltip();
      }
    };
    
    // Add close button functionality
    const closeBtn = tooltip.querySelector('.eoq-tooltip-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', removeTooltip);
    }
    
    // Auto-remove after 10 seconds (increased from 5)
    setTimeout(removeTooltip, 10000);
    
    // Remove on outside click (with small delay to prevent immediate removal)
    setTimeout(() => {
      document.addEventListener('click', removeTooltip);
      document.addEventListener('keydown', handleKeydown);
    }, 100);
    
    console.log('EOQ info tooltip displayed');
  }

  // Utility function to truncate text
  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // Show/hide all overlays
  toggleOverlays(show) {
    const overlays = document.querySelectorAll('.eoq-score-overlay');
    overlays.forEach(overlay => {
      overlay.style.display = show ? 'block' : 'none';
    });
  }

  // Clean up injected elements
  cleanup() {
    const elements = [
      '#eoq-toggle-container',
      '#eoq-comparison-panel',
      '#eoq-comparison-backdrop',
      '.eoq-score-overlay',
      '.eoq-info-tooltip'
    ];
    
    elements.forEach(selector => {
      const els = document.querySelectorAll(selector);
      els.forEach(el => el.remove());
    });
    
    this.isInjected = false;
    this.comparisonPanelOpen = false;
    document.body.style.overflow = '';
  }
}
