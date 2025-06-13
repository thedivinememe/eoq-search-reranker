// Content Enhancer - Hybrid system for enhanced EOQ scoring
class ContentEnhancer {
  constructor() {
    this.domainReputation = new DomainReputation();
    this.contentFetcher = new ContentFetcher();
    this.cache = new Map();
    this.failedDomains = new Set(); // Track domains that consistently fail
    this.loadCache();
  }

  // Main enhancement method - coordinates all enhancement phases
  async enhanceResult(searchResult) {
    try {
      // Phase 1: Enhanced metadata analysis (fast)
      const metadataEnhancement = await this.analyzeMetadata(searchResult);
      
      // Phase 2: Selective content fetching (slower, for top results)
      const shouldFetch = this.shouldFetchContent(searchResult, metadataEnhancement);
      
      if (shouldFetch) {
        const contentEnhancement = await this.fetchAndAnalyzeContent(searchResult);
        return this.combineEnhancements(metadataEnhancement, contentEnhancement);
      }
      
      return metadataEnhancement;
    } catch (error) {
      console.warn('Content enhancement failed:', error);
      return this.getDefaultEnhancement(searchResult);
    }
  }

  // Phase 1: Enhanced metadata analysis
  async analyzeMetadata(searchResult) {
    const enhancement = {
      domainReputation: 0,
      urlPatterns: 0,
      structuredData: {},
      contentType: 'unknown',
      qualitySignals: [],
      confidence: 0.3 // Low confidence for metadata-only
    };

    // Domain reputation analysis
    const domain = this.extractDomain(searchResult.url);
    const reputation = this.domainReputation.getDomainReputation(domain);
    enhancement.domainReputation = reputation.score || 0;
    
    // URL pattern recognition
    enhancement.urlPatterns = this.analyzeUrlPatterns(searchResult.url);
    
    // Content type detection
    enhancement.contentType = this.detectContentType(searchResult);
    
    // Quality signals from search result structure
    enhancement.qualitySignals = this.extractQualitySignals(searchResult);
    
    // Calculate metadata-based adjustments
    const adjustments = this.calculateMetadataAdjustments(enhancement);
    
    return {
      ...enhancement,
      adjustments,
      method: 'metadata',
      timestamp: Date.now()
    };
  }

  // Analyze URL patterns for quality indicators
  analyzeUrlPatterns(url) {
    let score = 0;
    const urlLower = url.toLowerCase();
    
    // Educational domains
    if (urlLower.includes('.edu') || urlLower.includes('.ac.')) {
      score += 0.15; // Strong positive signal
    }
    
    // Non-profit organizations
    if (urlLower.includes('.org')) {
      score += 0.1;
    }
    
    // Government sources
    if (urlLower.includes('.gov')) {
      score += 0.12;
    }
    
    // Academic/research indicators
    const academicPatterns = [
      'scholar.google', 'arxiv.org', 'pubmed', 'jstor', 'researchgate',
      'academia.edu', 'semanticscholar', 'ncbi.nlm.nih.gov'
    ];
    
    if (academicPatterns.some(pattern => urlLower.includes(pattern))) {
      score += 0.2;
    }
    
    // Quality news sources (basic list - could be expanded)
    const qualityNews = [
      'reuters.com', 'apnews.com', 'bbc.com', 'npr.org', 'pbs.org',
      'theguardian.com', 'washingtonpost.com', 'nytimes.com'
    ];
    
    if (qualityNews.some(source => urlLower.includes(source))) {
      score += 0.1;
    }
    
    // Negative indicators
    const negativePatterns = [
      'clickbait', 'viral', 'shocking', 'unbelievable', 'secret',
      'affiliate', 'promo', 'discount', 'deal', 'buy-now'
    ];
    
    if (negativePatterns.some(pattern => urlLower.includes(pattern))) {
      score -= 0.15;
    }
    
    // Suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
    if (suspiciousTlds.some(tld => urlLower.includes(tld))) {
      score -= 0.2;
    }
    
    return Math.max(-0.3, Math.min(0.3, score)); // Clamp between -0.3 and 0.3
  }

  // Detect content type from search result
  detectContentType(searchResult) {
    const title = searchResult.title.toLowerCase();
    const snippet = searchResult.snippet.toLowerCase();
    const url = searchResult.url.toLowerCase();
    
    // Academic/Research
    if (url.includes('arxiv') || url.includes('pubmed') || 
        title.includes('study') || title.includes('research')) {
      return 'academic';
    }
    
    // News
    if (url.includes('news') || title.includes('breaking') || 
        snippet.includes('reported') || snippet.includes('according to')) {
      return 'news';
    }
    
    // Educational
    if (url.includes('.edu') || title.includes('course') || 
        title.includes('tutorial') || title.includes('guide')) {
      return 'educational';
    }
    
    // Commercial
    if (url.includes('shop') || url.includes('buy') || 
        title.includes('price') || snippet.includes('$')) {
      return 'commercial';
    }
    
    // Blog/Opinion
    if (url.includes('blog') || title.includes('opinion') || 
        snippet.includes('i think') || snippet.includes('in my view')) {
      return 'blog';
    }
    
    return 'general';
  }

  // Extract quality signals from search result structure
  extractQualitySignals(searchResult) {
    const signals = [];
    
    // Title quality indicators
    if (searchResult.title.length > 10 && searchResult.title.length < 100) {
      signals.push('appropriate_title_length');
    }
    
    if (!searchResult.title.includes('...')) {
      signals.push('complete_title');
    }
    
    // Snippet quality indicators
    if (searchResult.snippet && searchResult.snippet.length > 50) {
      signals.push('substantial_snippet');
    }
    
    // URL structure indicators
    const url = searchResult.url;
    if (url.includes('https://')) {
      signals.push('secure_connection');
    }
    
    if (!url.includes('?') || url.split('?')[1].length < 50) {
      signals.push('clean_url');
    }
    
    // Date indicators (if available)
    if (searchResult.snippet && /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}/.test(searchResult.snippet)) {
      signals.push('dated_content');
    }
    
    return signals;
  }

  // Calculate adjustments based on metadata analysis
  calculateMetadataAdjustments(enhancement) {
    const adjustments = {
      empathy: 0,
      certainty: 0,
      boundary: 0,
      refinement: 0
    };
    
    // Domain reputation adjustments
    const repAdjustment = enhancement.domainReputation * 0.1;
    adjustments.empathy += repAdjustment;
    adjustments.certainty += repAdjustment;
    
    // URL pattern adjustments
    adjustments.empathy += enhancement.urlPatterns * 0.5;
    adjustments.certainty += enhancement.urlPatterns * 0.3;
    adjustments.refinement += enhancement.urlPatterns * 0.4;
    
    // Content type specific adjustments
    switch (enhancement.contentType) {
      case 'academic':
        adjustments.certainty += 0.2;
        adjustments.refinement += 0.15;
        break;
      case 'educational':
        adjustments.refinement += 0.25;
        adjustments.empathy += 0.1;
        break;
      case 'news':
        adjustments.certainty += 0.1;
        break;
      case 'commercial':
        adjustments.empathy -= 0.1;
        break;
    }
    
    // Quality signals adjustments
    const signalBonus = enhancement.qualitySignals.length * 0.02;
    Object.keys(adjustments).forEach(key => {
      adjustments[key] += signalBonus;
    });
    
    // Clamp all adjustments
    Object.keys(adjustments).forEach(key => {
      adjustments[key] = Math.max(-0.3, Math.min(0.3, adjustments[key]));
    });
    
    return adjustments;
  }

  // Determine if we should fetch full content for this result
  shouldFetchContent(searchResult, metadataEnhancement) {
    // Only fetch for top results to manage performance
    if (searchResult.originalPosition > 5) {
      return false;
    }
    
    // Skip if we have high confidence from metadata
    if (metadataEnhancement.confidence > 0.8) {
      return false;
    }
    
    // Skip known low-quality domains
    if (metadataEnhancement.domainReputation < -0.5) {
      return false;
    }
    
    // Skip commercial content (usually not worth deep analysis)
    if (metadataEnhancement.contentType === 'commercial') {
      return false;
    }
    
    // Check cache to avoid redundant fetches
    const cacheKey = this.generateCacheKey(searchResult.url);
    if (this.cache.has(cacheKey)) {
      return false;
    }
    
    return true;
  }

  // Phase 2: Fetch and analyze full content
  async fetchAndAnalyzeContent(searchResult) {
    const cacheKey = this.generateCacheKey(searchResult.url);
    const domain = this.extractDomain(searchResult.url);
    
    // Skip domains that have failed multiple times
    if (this.failedDomains.has(domain)) {
      return {
        adjustments: { empathy: 0, certainty: 0, boundary: 0, refinement: 0 },
        confidence: 0.1,
        method: 'domain_blacklisted',
        error: 'Domain consistently fails'
      };
    }
    
    try {
      // Check cache first
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }
      
      // Fetch content with timeout
      const content = await this.contentFetcher.fetchContent(searchResult.url);
      
      if (!content || content.length < 100) {
        throw new Error('Insufficient content retrieved');
      }
      
      // Analyze the full content
      const analysis = this.analyzeFullContent(content, searchResult);
      
      // Cache the result
      this.cache.set(cacheKey, analysis);
      this.persistCache();
      
      return analysis;
      
    } catch (error) {
      // Track failed domains to avoid future attempts
      this.trackFailedDomain(domain);
      
      // Return neutral enhancement on failure (reduced logging)
      return {
        adjustments: { empathy: 0, certainty: 0, boundary: 0, refinement: 0 },
        confidence: 0.1,
        method: 'fetch_failed',
        error: error.message
      };
    }
  }

  // Analyze full page content
  analyzeFullContent(content, searchResult) {
    const analysis = {
      wordCount: 0,
      readingTime: 0,
      headingStructure: [],
      keyPhrases: [],
      sentiment: 'neutral',
      adjustments: { empathy: 0, certainty: 0, boundary: 0, refinement: 0 },
      confidence: 0.7,
      method: 'full_content'
    };
    
    // Basic content metrics
    const words = content.split(/\s+/).filter(word => word.length > 0);
    analysis.wordCount = words.length;
    analysis.readingTime = Math.ceil(words.length / 200); // ~200 WPM
    
    // Content quality indicators
    if (analysis.wordCount > 500) {
      analysis.adjustments.refinement += 0.1; // Substantial content
    }
    
    if (analysis.wordCount > 2000) {
      analysis.adjustments.certainty += 0.05; // In-depth content
    }
    
    // Look for quality indicators in content
    const contentLower = content.toLowerCase();
    
    // Empathy indicators
    const empathyPhrases = [
      'help', 'support', 'community', 'together', 'inclusive', 'accessible',
      'everyone', 'people', 'human', 'care', 'wellbeing', 'benefit'
    ];
    
    const empathyCount = empathyPhrases.filter(phrase => 
      contentLower.includes(phrase)).length;
    analysis.adjustments.empathy += Math.min(0.2, empathyCount * 0.02);
    
    // Certainty indicators
    const uncertaintyPhrases = [
      'may', 'might', 'could', 'possibly', 'likely', 'suggests',
      'according to', 'research shows', 'study found', 'evidence indicates'
    ];
    
    const uncertaintyCount = uncertaintyPhrases.filter(phrase => 
      contentLower.includes(phrase)).length;
    analysis.adjustments.certainty += Math.min(0.15, uncertaintyCount * 0.02);
    
    // Boundary indicators (bridge-building language)
    const bridgePhrases = [
      'both', 'however', 'on the other hand', 'different perspectives',
      'various viewpoints', 'balanced', 'nuanced', 'complex'
    ];
    
    const bridgeCount = bridgePhrases.filter(phrase => 
      contentLower.includes(phrase)).length;
    analysis.adjustments.boundary += Math.min(0.15, bridgeCount * 0.03);
    
    // Growth indicators
    const growthPhrases = [
      'learn', 'education', 'skill', 'develop', 'improve', 'grow',
      'practice', 'training', 'knowledge', 'understanding', 'insight'
    ];
    
    const growthCount = growthPhrases.filter(phrase => 
      contentLower.includes(phrase)).length;
    analysis.adjustments.refinement += Math.min(0.2, growthCount * 0.02);
    
    return analysis;
  }

  // Combine metadata and content enhancements
  combineEnhancements(metadataEnhancement, contentEnhancement) {
    const combined = {
      ...metadataEnhancement,
      contentAnalysis: contentEnhancement,
      confidence: Math.max(metadataEnhancement.confidence, contentEnhancement.confidence),
      method: 'hybrid'
    };
    
    // Weighted combination of adjustments
    const metadataWeight = 0.3;
    const contentWeight = 0.7;
    
    Object.keys(combined.adjustments).forEach(key => {
      combined.adjustments[key] = 
        (metadataEnhancement.adjustments[key] * metadataWeight) +
        (contentEnhancement.adjustments[key] * contentWeight);
      
      // Clamp final adjustments
      combined.adjustments[key] = Math.max(-0.4, Math.min(0.4, combined.adjustments[key]));
    });
    
    return combined;
  }

  // Get default enhancement for errors
  getDefaultEnhancement(searchResult) {
    return {
      adjustments: { empathy: 0, certainty: 0, boundary: 0, refinement: 0 },
      confidence: 0.1,
      method: 'default',
      error: 'Enhancement failed'
    };
  }

  // Track domains that consistently fail
  trackFailedDomain(domain) {
    // Add to failed domains set to avoid future attempts
    this.failedDomains.add(domain);
    
    // Persist failed domains (optional - could be session-only)
    try {
      const failedDomainsArray = Array.from(this.failedDomains);
      chrome.storage.local.set({ failedDomains: failedDomainsArray });
    } catch (error) {
      // Silently fail - not critical
    }
  }

  // Utility methods
  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
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

  // Cache management
  async loadCache() {
    try {
      const result = await chrome.storage.local.get(['contentEnhancementCache', 'failedDomains']);
      
      // Load enhancement cache
      if (result.contentEnhancementCache) {
        this.cache = new Map(Object.entries(result.contentEnhancementCache));
        
        // Clean expired entries (24 hours)
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        
        for (const [key, value] of this.cache.entries()) {
          if (now - value.timestamp > dayMs) {
            this.cache.delete(key);
          }
        }
      }
      
      // Load failed domains
      if (result.failedDomains && Array.isArray(result.failedDomains)) {
        this.failedDomains = new Set(result.failedDomains);
      }
      
    } catch (error) {
      console.warn('Failed to load content enhancement cache:', error);
    }
  }

  async persistCache() {
    try {
      // Limit cache size
      if (this.cache.size > 500) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
        this.cache = new Map(entries.slice(0, 400));
      }
      
      const cacheObj = Object.fromEntries(this.cache);
      await chrome.storage.local.set({ contentEnhancementCache: cacheObj });
    } catch (error) {
      console.warn('Failed to persist content enhancement cache:', error);
    }
  }
}
