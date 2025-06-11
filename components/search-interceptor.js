// Search Interceptor - Handles Google search result extraction and reordering
class SearchInterceptor {
  constructor() {
    this.searchResults = [];
    this.originalOrder = [];
    this.isEOQMode = true;
    this.hideSponsoredResults = true; // Default to hiding sponsored results
    this.sponsoredResults = [];
  }

  // Extract search results from Google's DOM
  extractSearchResults() {
    const results = [];
    this.sponsoredResults = [];
    
    // First, identify and handle sponsored results
    this.identifyAndHandleSponsoredResults();
    
    // Google's main search results are in divs with class 'g'
    // We need to handle different Google layouts and result types
    const resultSelectors = [
      '.g:not(.g-blk)', // Standard results, excluding knowledge panels
      '.hlcw0c',        // Alternative layout
      '.tF2Cxc'         // Another common layout
    ];

    let resultElements = [];
    
    // Try different selectors to find results
    for (const selector of resultSelectors) {
      resultElements = document.querySelectorAll(selector);
      if (resultElements.length > 0) {
        console.log(`Found ${resultElements.length} results using selector: ${selector}`);
        break;
      }
    }

    if (resultElements.length === 0) {
      console.warn('No search results found with any selector');
      return results;
    }
    
    resultElements.forEach((element, index) => {
      const result = this.parseResultElement(element, index);
      if (result) {
        // Check if this is a sponsored result
        if (this.isSponsoredResult(element)) {
          result.isSponsored = true;
          this.sponsoredResults.push(result);
          
          // If hiding sponsored results, hide the element but don't add to results
          if (this.hideSponsoredResults) {
            this.hideSponsoredElement(element);
            console.log('EOQ: Hiding sponsored result:', result.title.substring(0, 50));
            // Don't add to results array - skip this iteration
          } else {
            // Not hiding sponsored results, so add to results
            results.push(result);
            console.log('EOQ: Including sponsored result:', result.title.substring(0, 50));
          }
        } else {
          // This is a regular (non-sponsored) result - always add it
          results.push(result);
          console.log('EOQ: Including organic result:', result.title.substring(0, 50));
        }
      }
    });
    
    this.searchResults = results;
    this.originalOrder = [...results];
    
    console.log(`Extracted ${results.length} search results (${this.sponsoredResults.length} sponsored filtered)`);
    return results;
  }

  // Parse individual result element with comprehensive error handling
  parseResultElement(element, index) {
    try {
      // Safety check: ensure element is still in DOM and accessible
      if (!element || !element.isConnected || !element.parentNode) {
        console.warn('Skipping disconnected element at index', index);
        return null;
      }

      // Try different selectors for title
      const titleSelectors = [
        'h3',
        '.LC20lb',
        '.DKV0Md',
        '[role="heading"]'
      ];

      // Try different selectors for links
      const linkSelectors = [
        'a[href]:not([href^="#"])',
        '.yuRUbf a',
        '.g a[href]'
      ];

      // Try different selectors for snippets
      const snippetSelectors = [
        '.VwiC3b',
        '.yXK7lf',
        '.s3v9rd',
        '.st',
        '.IsZvec'
      ];

      let titleElement = null;
      let linkElement = null;
      let snippetElement = null;

      // Find title with error handling
      for (const selector of titleSelectors) {
        try {
          titleElement = element.querySelector(selector);
          if (titleElement && this.safeGetTextContent(titleElement)) break;
        } catch (error) {
          console.warn(`Error querying title selector ${selector}:`, error);
          continue;
        }
      }

      // Find link with error handling
      for (const selector of linkSelectors) {
        try {
          linkElement = element.querySelector(selector);
          if (linkElement && this.safeGetHref(linkElement)) break;
        } catch (error) {
          console.warn(`Error querying link selector ${selector}:`, error);
          continue;
        }
      }

      // Find snippet with error handling
      for (const selector of snippetSelectors) {
        try {
          snippetElement = element.querySelector(selector);
          if (snippetElement && this.safeGetTextContent(snippetElement)) break;
        } catch (error) {
          console.warn(`Error querying snippet selector ${selector}:`, error);
          continue;
        }
      }

      // Validate we have minimum required elements
      if (!titleElement || !linkElement) {
        console.warn('Skipping result - missing title or link:', {
          hasTitle: !!titleElement,
          hasLink: !!linkElement,
          index: index
        });
        return null;
      }

      const title = this.safeGetTextContent(titleElement);
      const url = this.safeGetHref(linkElement);
      const snippet = snippetElement ? this.safeGetTextContent(snippetElement) : '';

      // Skip invalid results
      if (!title || !url || url.startsWith('javascript:') || url.startsWith('#')) {
        console.warn('Skipping invalid result:', { title: !!title, url: url?.substring(0, 50) });
        return null;
      }

      return {
        index: index,
        element: element,
        title: title,
        url: url,
        snippet: snippet,
        originalPosition: index + 1,
        domain: this.extractDomain(url)
      };

    } catch (error) {
      console.warn(`Error parsing result element at index ${index}:`, error);
      return null;
    }
  }

  // Safely get text content from an element
  safeGetTextContent(element) {
    try {
      if (!element || !element.isConnected) return '';
      return element.textContent?.trim() || '';
    } catch (error) {
      console.warn('Error getting text content:', error);
      return '';
    }
  }

  // Safely get href from a link element
  safeGetHref(element) {
    try {
      if (!element || !element.isConnected) return '';
      const href = element.href;
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return '';
      return href;
    } catch (error) {
      console.warn('Error getting href:', error);
      return '';
    }
  }

  // Extract domain from URL for additional context
  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (error) {
      return '';
    }
  }

  // Reorder results based on EOQ scores
  reorderResults(scoredResults) {
    if (!scoredResults || scoredResults.length === 0) {
      console.warn('No scored results to reorder');
      return;
    }

    // Sort by EOQ score descending
    const sorted = [...scoredResults].sort((a, b) => {
      const scoreA = a.eoqScore ? a.eoqScore.total : 0;
      const scoreB = b.eoqScore ? b.eoqScore.total : 0;
      return scoreB - scoreA;
    });
    
    // Get the container holding search results
    const containers = [
      '#rso',           // Main results container
      '#search',        // Alternative container
      '.g-blk',         // Knowledge panel area
      '#center_col'     // Center column
    ];

    let resultsContainer = null;
    for (const selector of containers) {
      resultsContainer = document.querySelector(selector);
      if (resultsContainer) {
        console.log(`Using results container: ${selector}`);
        break;
      }
    }

    if (!resultsContainer) {
      console.error('Could not find results container for reordering');
      return;
    }
    
    // Create a document fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    
    // Add reordered results to fragment
    sorted.forEach((result, newIndex) => {
      if (result.element && result.element.parentNode) {
        // Add position indicator
        this.addPositionIndicator(result.element, result.originalPosition, newIndex + 1);
        fragment.appendChild(result.element);
      }
    });
    
    // Clear and re-append in new order
    // We need to be careful not to remove other elements like ads or knowledge panels
    const resultElements = resultsContainer.querySelectorAll('.g:not(.g-blk), .tF2Cxc, .hlcw0c');
    resultElements.forEach(el => el.remove());
    
    // Insert the reordered results
    const insertionPoint = this.findInsertionPoint(resultsContainer);
    if (insertionPoint) {
      insertionPoint.appendChild(fragment);
    } else {
      resultsContainer.appendChild(fragment);
    }

    console.log(`Reordered ${sorted.length} results by EOQ score`);
  }

  // Find the best insertion point for results
  findInsertionPoint(container) {
    // Look for existing result containers
    const possibleContainers = [
      container.querySelector('#rso'),
      container.querySelector('.g-blk'),
      container
    ];

    for (const possible of possibleContainers) {
      if (possible) return possible;
    }

    return container;
  }

  // Add visual indicator showing position change
  addPositionIndicator(element, originalPos, newPos) {
    // Remove existing indicator
    const existing = element.querySelector('.eoq-position-indicator');
    if (existing) existing.remove();

    if (originalPos !== newPos) {
      const indicator = document.createElement('div');
      indicator.className = 'eoq-position-indicator';
      
      const change = originalPos - newPos;
      const arrow = change > 0 ? '↑' : '↓';
      const color = change > 0 ? '#4CAF50' : '#FF9800';
      
      indicator.innerHTML = `
        <span style="color: ${color}; font-weight: bold; font-size: 12px;">
          ${arrow} ${Math.abs(change)}
        </span>
      `;
      
      element.insertBefore(indicator, element.firstChild);
    }
  }

  // Restore original order
  restoreOriginalOrder() {
    if (this.originalOrder.length === 0) {
      console.warn('No original order to restore');
      return;
    }

    const container = document.querySelector('#rso') || document.querySelector('#search');
    if (!container) {
      console.error('Could not find container to restore original order');
      return;
    }

    // Remove position indicators
    document.querySelectorAll('.eoq-position-indicator').forEach(el => el.remove());

    // Create fragment with original order
    const fragment = document.createDocumentFragment();
    this.originalOrder.forEach(result => {
      if (result.element && result.element.parentNode) {
        fragment.appendChild(result.element);
      }
    });

    // Clear and restore
    const resultElements = container.querySelectorAll('.g:not(.g-blk), .tF2Cxc, .hlcw0c');
    resultElements.forEach(el => el.remove());
    
    const insertionPoint = this.findInsertionPoint(container);
    if (insertionPoint) {
      insertionPoint.appendChild(fragment);
    } else {
      container.appendChild(fragment);
    }

    console.log('Restored original search result order');
  }

  // Toggle between EOQ and original ordering
  toggleOrder(useEOQ, scoredResults = null) {
    this.isEOQMode = useEOQ;
    
    if (useEOQ && scoredResults) {
      this.reorderResults(scoredResults);
    } else {
      this.restoreOriginalOrder();
    }
  }

  // Get statistics about the reordering
  getReorderingStats(scoredResults) {
    if (!scoredResults || scoredResults.length === 0) {
      return { totalMoved: 0, averageChange: 0, topScores: [] };
    }

    const sorted = [...scoredResults].sort((a, b) => {
      const scoreA = a.eoqScore ? a.eoqScore.total : 0;
      const scoreB = b.eoqScore ? b.eoqScore.total : 0;
      return scoreB - scoreA;
    });

    let totalChange = 0;
    let moved = 0;

    sorted.forEach((result, newIndex) => {
      const change = Math.abs(result.originalPosition - (newIndex + 1));
      if (change > 0) {
        moved++;
        totalChange += change;
      }
    });

    return {
      totalMoved: moved,
      averageChange: moved > 0 ? totalChange / moved : 0,
      topScores: sorted.slice(0, 3).map(r => ({
        title: r.title,
        score: r.eoqScore ? r.eoqScore.total : 0,
        originalPosition: r.originalPosition
      }))
    };
  }

  // Check if current page is a Google search results page
  static isGoogleSearchPage() {
    return window.location.hostname.includes('google.com') && 
           window.location.pathname === '/search' &&
           window.location.search.includes('q=');
  }

  // Get search query from URL
  static getSearchQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  // Identify and handle sponsored results across the page
  identifyAndHandleSponsoredResults() {
    // Common selectors for sponsored content areas
    const sponsoredSelectors = [
      '[data-text-ad]',           // Google Ads data attribute
      '.ads-ad',                  // Ads container
      '.commercial-unit-desktop-top', // Shopping ads
      '.cu-container',            // Commercial unit
      '.pla-unit',               // Product listing ads
      '.shopping-carousel',       // Shopping results
      '#tads',                   // Top ads container
      '#bottomads',              // Bottom ads container
      '.mnr-c',                  // Right sidebar ads
      '.rhsvw'                   // Right-hand side view (often ads)
    ];

    sponsoredSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.hideSponsoredResults) {
          this.hideSponsoredElement(element);
        } else {
          this.markSponsoredElement(element);
        }
      });
    });
  }

  // Check if a result element is sponsored (more conservative approach)
  isSponsoredResult(element) {
    try {
      // Safety check
      if (!element || !element.isConnected) return false;

      // First check for definitive ad indicators - data attributes
      const definitiveAdAttributes = ['data-text-ad', 'data-ad-slot', 'data-google-av-cxn'];
      const hasDefinitiveAdAttribute = definitiveAdAttributes.some(attr => 
        element.hasAttribute(attr) || element.querySelector(`[${attr}]`)
      );

      if (hasDefinitiveAdAttribute) {
        console.log('EOQ: Sponsored result detected via data attribute');
        return true;
      }

      // Check for definitive sponsored CSS classes (very specific)
      const definitiveAdClasses = [
        'ads-ad', 'commercial-unit-desktop-top', 'pla-unit', 
        'shopping-carousel', 'mnr-c', 'rhsvw'
      ];

      const hasDefinitiveClass = definitiveAdClasses.some(className => 
        element.classList.contains(className)
      );

      if (hasDefinitiveClass) {
        console.log('EOQ: Sponsored result detected via CSS class:', element.className);
        return true;
      }

      // Check for Google Ads URL patterns (very specific)
      const links = element.querySelectorAll('a[href]');
      for (const link of links) {
        const href = this.safeGetHref(link);
        if (href.includes('googleadservices.com') || 
            href.includes('googlesyndication.com') ||
            href.includes('/aclk?sa=') ||
            (href.includes('/url?') && href.includes('adurl='))) {
          console.log('EOQ: Sponsored result detected via URL pattern:', href.substring(0, 100));
          return true;
        }
      }

      // Check for sponsored text indicators - but only in specific locations
      const sponsoredTextIndicators = [
        'sponsored', 'advertisement', 'promoted'
      ];

      // Only check in small text elements that are likely ad labels
      const adLabelSelectors = [
        '.ads-visurl', '.ad-label', '.sponsored-label', 
        '[aria-label*="Ad"]', '[title*="Ad"]'
      ];

      for (const selector of adLabelSelectors) {
        const labelElement = element.querySelector(selector);
        if (labelElement) {
          const labelText = this.safeGetTextContent(labelElement).toLowerCase();
          if (sponsoredTextIndicators.some(indicator => labelText.includes(indicator))) {
            console.log('EOQ: Sponsored result detected via label text:', labelText);
            return true;
          }
        }
      }

      // Check immediate parent for ad container (only 1 level up)
      const parent = element.parentElement;
      if (parent) {
        const parentId = parent.id?.toLowerCase() || '';
        const parentClasses = Array.from(parent.classList).join(' ').toLowerCase();
        
        if (parentId.includes('tads') || parentId.includes('bottomads') ||
            parentClasses.includes('ads-ad') || parentClasses.includes('commercial-unit')) {
          console.log('EOQ: Sponsored result detected via parent container');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn('Error checking if result is sponsored:', error);
      return false; // Default to not sponsored on error
    }
  }

  // Hide sponsored element from view
  hideSponsoredElement(element) {
    try {
      if (!element || !element.isConnected) return;
      
      if (!element.dataset.eoqOriginalDisplay) {
        element.dataset.eoqOriginalDisplay = element.style.display || 'block';
      }
      element.style.display = 'none';
      element.classList.add('eoq-hidden-sponsored');
      
      // Add a subtle indicator for debugging
      if (!element.querySelector('.eoq-sponsored-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'eoq-sponsored-indicator';
        indicator.style.cssText = `
          position: absolute;
          top: -20px;
          left: 0;
          background: #ff4444;
          color: white;
          padding: 2px 6px;
          font-size: 10px;
          border-radius: 3px;
          z-index: 1000;
          display: none;
        `;
        indicator.textContent = 'SPONSORED (HIDDEN)';
        element.style.position = 'relative';
        element.appendChild(indicator);
      }
    } catch (error) {
      console.warn('Error hiding sponsored element:', error);
    }
  }

  // Mark sponsored element with visual indicator
  markSponsoredElement(element) {
    try {
      if (!element || !element.isConnected) return;
      
      if (!element.querySelector('.eoq-sponsored-marker')) {
        const marker = document.createElement('div');
        marker.className = 'eoq-sponsored-marker';
        marker.style.cssText = `
          background: linear-gradient(45deg, #ff9800, #f57c00);
          color: white;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: bold;
          border-radius: 4px;
          margin-bottom: 8px;
          display: inline-block;
        `;
        marker.innerHTML = '🎯 SPONSORED CONTENT';
        element.insertBefore(marker, element.firstChild);
      }
    } catch (error) {
      console.warn('Error marking sponsored element:', error);
    }
  }

  // Show hidden sponsored results
  showSponsoredResults() {
    const hiddenElements = document.querySelectorAll('.eoq-hidden-sponsored');
    hiddenElements.forEach(element => {
      try {
        element.style.display = element.dataset.eoqOriginalDisplay || 'block';
        element.classList.remove('eoq-hidden-sponsored');
        
        // Show debug indicator
        const indicator = element.querySelector('.eoq-sponsored-indicator');
        if (indicator) {
          indicator.style.display = 'block';
        }
      } catch (error) {
        console.warn('Error showing sponsored element:', error);
      }
    });
  }

  // Toggle sponsored results visibility
  toggleSponsoredResults(hide) {
    this.hideSponsoredResults = hide;
    
    if (hide) {
      // Hide all sponsored results
      this.identifyAndHandleSponsoredResults();
      
      // Re-extract results to exclude sponsored ones
      this.extractSearchResults();
    } else {
      // Show sponsored results
      this.showSponsoredResults();
      
      // Re-extract to include sponsored results
      this.extractSearchResults();
    }
    
    console.log(`Sponsored results ${hide ? 'hidden' : 'shown'}`);
  }

  // Get sponsored results statistics
  getSponsoredStats() {
    return {
      totalSponsored: this.sponsoredResults.length,
      hiddenSponsored: document.querySelectorAll('.eoq-hidden-sponsored').length,
      sponsoredDomains: [...new Set(this.sponsoredResults.map(r => r.domain))],
      sponsoredTitles: this.sponsoredResults.map(r => r.title)
    };
  }
}
