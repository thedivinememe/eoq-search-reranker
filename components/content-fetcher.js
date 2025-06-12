// Content Fetcher - Handles fetching and extracting content from web pages
class ContentFetcher {
  constructor() {
    this.requestQueue = [];
    this.activeRequests = 0;
    this.maxConcurrentRequests = 2;
    this.requestDelay = 1000; // 1 second between requests
    this.timeout = 10000; // 10 second timeout
    this.cache = new Map();
    this.loadCache();
  }

  // Main content fetching method
  async fetchContent(url) {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(url);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Add to queue and wait for processing
      const content = await this.queueRequest(url);
      
      // Cache the result
      this.saveToCache(cacheKey, content);
      
      return content;
      
    } catch (error) {
      console.warn('Content fetching failed for', url, error);
      throw error;
    }
  }

  // Queue management for rate limiting
  async queueRequest(url) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        url,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }

  // Process the request queue with rate limiting
  async processQueue() {
    if (this.activeRequests >= this.maxConcurrentRequests || this.requestQueue.length === 0) {
      return;
    }

    const request = this.requestQueue.shift();
    this.activeRequests++;

    try {
      // Add delay between requests
      const timeSinceLastRequest = Date.now() - (this.lastRequestTime || 0);
      if (timeSinceLastRequest < this.requestDelay) {
        await this.sleep(this.requestDelay - timeSinceLastRequest);
      }

      this.lastRequestTime = Date.now();
      
      // Fetch the content
      const content = await this.performFetch(request.url);
      request.resolve(content);
      
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      
      // Process next request in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  // Perform the actual content fetch
  async performFetch(url) {
    // Try multiple methods in order of preference
    const methods = [
      () => this.fetchViaProxy(url),
      () => this.fetchViaBackground(url),
      () => this.fetchDirectly(url)
    ];

    let lastError;
    
    for (const method of methods) {
      try {
        const content = await method();
        if (content && content.length > 50) {
          return this.extractMainContent(content);
        }
      } catch (error) {
        lastError = error;
        // Reduce console spam - only log if all methods fail
      }
    }
    
    throw lastError || new Error('All fetch methods failed');
  }

  // Method 1: Fetch via CORS proxy (most reliable)
  async fetchViaProxy(url) {
    // Use a public CORS proxy service
    const proxyUrls = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`
    ];

    for (const proxyUrl of proxyUrls) {
      try {
        const response = await this.fetchWithTimeout(proxyUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Different proxy services return data differently
        if (data.contents) {
          return data.contents; // allorigins format
        } else if (typeof data === 'string') {
          return data; // direct content
        } else {
          throw new Error('Unexpected proxy response format');
        }
        
      } catch (error) {
        // Silently continue to next proxy - reduce console spam
        continue;
      }
    }
    
    throw new Error('All proxy services failed');
  }

  // Method 2: Fetch via background script (Chrome extension specific)
  async fetchViaBackground(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'fetchContent',
        url: url
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.content);
        } else {
          reject(new Error(response?.error || 'Background fetch failed'));
        }
      });
    });
  }

  // Method 3: Direct fetch (limited by CORS)
  async fetchDirectly(url) {
    const response = await this.fetchWithTimeout(url, {
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EOQ-Extension/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.text();
  }

  // Fetch with timeout wrapper
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  // Extract main content from HTML using Readability-style algorithm
  extractMainContent(html) {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove unwanted elements
      this.removeUnwantedElements(doc);
      
      // Find the main content container
      const mainContent = this.findMainContent(doc);
      
      // Extract and clean text
      const text = this.extractText(mainContent);
      
      // Clean and normalize the text
      return this.cleanText(text);
      
    } catch (error) {
      console.warn('Content extraction failed:', error);
      
      // Fallback: simple text extraction
      return this.simpleTextExtraction(html);
    }
  }

  // Remove unwanted HTML elements
  removeUnwantedElements(doc) {
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.advertisement', '.ads', '.sidebar', '.menu', '.navigation',
      '.social-share', '.comments', '.related-posts', '.popup',
      '[class*="ad"]', '[id*="ad"]', '[class*="banner"]',
      'iframe', 'embed', 'object'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  // Find the main content container using heuristics
  findMainContent(doc) {
    // Try common content selectors first
    const contentSelectors = [
      'main', 'article', '[role="main"]', '.main-content',
      '.content', '.post-content', '.entry-content', '.article-content',
      '#content', '#main', '#article', '.story-body'
    ];

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && this.hasSubstantialContent(element)) {
        return element;
      }
    }

    // Fallback: find the element with most text content
    return this.findElementWithMostText(doc);
  }

  // Check if element has substantial content
  hasSubstantialContent(element) {
    const text = element.textContent || '';
    const words = text.trim().split(/\s+/).length;
    return words > 50; // At least 50 words
  }

  // Find element with most text content
  findElementWithMostText(doc) {
    let bestElement = doc.body;
    let maxTextLength = 0;

    const candidates = doc.querySelectorAll('div, section, article, main');
    
    candidates.forEach(element => {
      const text = element.textContent || '';
      const textLength = text.trim().length;
      
      // Prefer elements with more text but not too nested
      const depth = this.getElementDepth(element);
      const score = textLength - (depth * 100); // Penalize deep nesting
      
      if (score > maxTextLength) {
        maxTextLength = score;
        bestElement = element;
      }
    });

    return bestElement;
  }

  // Get element depth in DOM tree
  getElementDepth(element) {
    let depth = 0;
    let current = element;
    
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    
    return depth;
  }

  // Extract text from element, preserving structure
  extractText(element) {
    if (!element) return '';

    // Get all text nodes and important structural elements
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          // Accept structural elements
          const tagName = node.tagName?.toLowerCase();
          if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tagName)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const textParts = [];
    let node;
    
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text.length > 0) {
          textParts.push(text);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Add spacing for structural elements
        const tagName = node.tagName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'blockquote'].includes(tagName)) {
          textParts.push('\n');
        }
      }
    }

    return textParts.join(' ');
  }

  // Clean and normalize extracted text
  cleanText(text) {
    if (!text) return '';

    return text
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove excessive newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Trim
      .trim()
      // Limit length to prevent memory issues
      .substring(0, 50000); // 50KB limit
  }

  // Simple fallback text extraction
  simpleTextExtraction(html) {
    try {
      // Remove script and style tags
      const cleanHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      
      // Extract text content
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanHtml, 'text/html');
      
      return this.cleanText(doc.body?.textContent || '');
      
    } catch (error) {
      console.warn('Simple text extraction failed:', error);
      return '';
    }
  }

  // Utility methods
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateCacheKey(url) {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.content;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  saveToCache(key, content) {
    const expires = Date.now() + (6 * 60 * 60 * 1000); // 6 hours
    this.cache.set(key, { content, expires });
    this.persistCache();
  }

  async loadCache() {
    try {
      const result = await chrome.storage.local.get(['contentFetchCache']);
      if (result.contentFetchCache) {
        this.cache = new Map(Object.entries(result.contentFetchCache));
        
        // Clean expired entries
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
          if (now >= value.expires) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load content fetch cache:', error);
    }
  }

  async persistCache() {
    try {
      // Limit cache size to prevent storage issues
      if (this.cache.size > 100) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].expires - b[1].expires);
        this.cache = new Map(entries.slice(-80)); // Keep newest 80 entries
      }

      const cacheObj = Object.fromEntries(this.cache);
      await chrome.storage.local.set({ contentFetchCache: cacheObj });
    } catch (error) {
      console.warn('Failed to persist content fetch cache:', error);
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    chrome.storage.local.remove(['contentFetchCache']);
  }
}
