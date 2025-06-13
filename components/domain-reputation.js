// Domain Reputation Manager - Tracks and manages domain-level quality scores
class DomainReputationManager {
  constructor() {
    this.reputationCache = new Map();
    this.interactionHistory = new Map();
    this.loadReputation();
    
    // Built-in reputation seeds for known domains
    this.seedReputations = {
      // High-quality educational and research
      'arxiv.org': 0.9,
      'pubmed.ncbi.nlm.nih.gov': 0.9,
      'scholar.google.com': 0.8,
      'jstor.org': 0.8,
      'researchgate.net': 0.7,
      'academia.edu': 0.6,
      
      // Quality news sources
      'reuters.com': 0.7,
      'apnews.com': 0.7,
      'bbc.com': 0.6,
      'npr.org': 0.6,
      'pbs.org': 0.6,
      'theguardian.com': 0.5,
      
      // Educational institutions (general boost)
      'mit.edu': 0.8,
      'stanford.edu': 0.8,
      'harvard.edu': 0.8,
      'berkeley.edu': 0.7,
      
      // Government sources
      'cdc.gov': 0.7,
      'nih.gov': 0.8,
      'nasa.gov': 0.7,
      'nist.gov': 0.7,
      
      // Non-profits and organizations
      'wikipedia.org': 0.4, // Neutral - can be good or bad
      'khanacademy.org': 0.8,
      'coursera.org': 0.6,
      'edx.org': 0.6,
      
      // Known problematic patterns (negative reputation)
      'clickbait.com': -0.8,
      'viral-content.net': -0.7,
      'fake-news.info': -0.9
    };
  }

  // Get reputation score for a domain
  async getReputation(domain) {
    if (!domain || domain === 'unknown') {
      return 0;
    }
    
    // Check cache first
    if (this.reputationCache.has(domain)) {
      const cached = this.reputationCache.get(domain);
      
      // Return cached value if recent enough (7 days)
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - cached.timestamp < weekMs) {
        return cached.score;
      }
    }
    
    // Calculate reputation score
    const reputation = this.calculateReputation(domain);
    
    // Cache the result
    this.reputationCache.set(domain, {
      score: reputation,
      timestamp: Date.now(),
      interactions: this.interactionHistory.get(domain) || 0
    });
    
    // Persist to storage
    this.persistReputation();
    
    return reputation;
  }

  // Calculate reputation based on various factors
  calculateReputation(domain) {
    let score = 0;
    
    // Check seed reputations first
    if (this.seedReputations[domain] !== undefined) {
      score = this.seedReputations[domain];
    }
    
    // Domain pattern analysis
    score += this.analyzeDomainPatterns(domain);
    
    // Historical interaction data
    score += this.analyzeInteractionHistory(domain);
    
    // TLD-based adjustments
    score += this.analyzeTLD(domain);
    
    // Subdomain analysis
    score += this.analyzeSubdomain(domain);
    
    // Clamp score between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  // Analyze domain patterns for quality indicators
  analyzeDomainPatterns(domain) {
    let score = 0;
    const domainLower = domain.toLowerCase();
    
    // Educational domains
    if (domainLower.endsWith('.edu')) {
      score += 0.3;
    }
    
    // Academic domains (international)
    if (domainLower.endsWith('.ac.uk') || domainLower.endsWith('.ac.jp') || 
        domainLower.endsWith('.edu.au') || domainLower.endsWith('.ac.in')) {
      score += 0.3;
    }
    
    // Government domains
    if (domainLower.endsWith('.gov')) {
      score += 0.2;
    }
    
    // Non-profit organizations
    if (domainLower.endsWith('.org')) {
      score += 0.1;
    }
    
    // Quality indicators in domain name
    const qualityKeywords = [
      'research', 'institute', 'university', 'college', 'academy',
      'library', 'museum', 'foundation', 'center', 'lab'
    ];
    
    if (qualityKeywords.some(keyword => domainLower.includes(keyword))) {
      score += 0.15;
    }
    
    // Negative indicators
    const negativeKeywords = [
      'clickbait', 'viral', 'buzz', 'gossip', 'scandal', 'shocking',
      'secret', 'trick', 'hack', 'cheat', 'scam', 'fake'
    ];
    
    if (negativeKeywords.some(keyword => domainLower.includes(keyword))) {
      score -= 0.4;
    }
    
    // Commercial indicators (slight negative for empathy)
    const commercialKeywords = [
      'shop', 'store', 'buy', 'sell', 'deal', 'discount', 'promo',
      'affiliate', 'marketing', 'ads'
    ];
    
    if (commercialKeywords.some(keyword => domainLower.includes(keyword))) {
      score -= 0.1;
    }
    
    // Spam/low-quality indicators
    const spamKeywords = [
      'free', 'win', 'prize', 'lottery', 'casino', 'porn', 'xxx'
    ];
    
    if (spamKeywords.some(keyword => domainLower.includes(keyword))) {
      score -= 0.6;
    }
    
    return score;
  }

  // Analyze historical user interactions with domain
  analyzeInteractionHistory(domain) {
    const history = this.interactionHistory.get(domain);
    if (!history) {
      return 0;
    }
    
    // Positive interactions boost reputation
    let score = 0;
    
    if (history.clicks > 0) {
      // More clicks = more user trust
      score += Math.min(0.2, history.clicks * 0.02);
    }
    
    if (history.timeSpent > 0) {
      // Longer time spent = higher quality content
      const avgTimeMinutes = history.timeSpent / history.clicks;
      score += Math.min(0.15, avgTimeMinutes * 0.01);
    }
    
    if (history.returns > 0) {
      // Return visits indicate quality
      score += Math.min(0.1, history.returns * 0.05);
    }
    
    return score;
  }

  // Analyze top-level domain for quality indicators
  analyzeTLD(domain) {
    const tld = domain.split('.').pop().toLowerCase();
    
    // High-quality TLDs
    const qualityTlds = ['edu', 'gov', 'org', 'ac'];
    if (qualityTlds.includes(tld)) {
      return 0.1;
    }
    
    // Standard commercial TLDs (neutral)
    const standardTlds = ['com', 'net', 'info'];
    if (standardTlds.includes(tld)) {
      return 0;
    }
    
    // Suspicious/spam TLDs
    const suspiciousTlds = ['tk', 'ml', 'ga', 'cf', 'click', 'download'];
    if (suspiciousTlds.includes(tld)) {
      return -0.3;
    }
    
    // Country-specific TLDs (slight positive for diversity)
    if (tld.length === 2) {
      return 0.05;
    }
    
    return 0;
  }

  // Analyze subdomain patterns
  analyzeSubdomain(domain) {
    const parts = domain.split('.');
    
    if (parts.length < 3) {
      return 0; // No subdomain
    }
    
    const subdomain = parts[0].toLowerCase();
    
    // Quality subdomains
    const qualitySubdomains = [
      'www', 'blog', 'news', 'research', 'docs', 'help',
      'support', 'learn', 'education', 'library'
    ];
    
    if (qualitySubdomains.includes(subdomain)) {
      return 0.05;
    }
    
    // Suspicious subdomains
    const suspiciousSubdomains = [
      'ads', 'promo', 'affiliate', 'spam', 'click', 'download',
      'free', 'win', 'prize'
    ];
    
    if (suspiciousSubdomains.includes(subdomain)) {
      return -0.2;
    }
    
    return 0;
  }

  // Record user interaction with a domain
  recordInteraction(domain, interactionType, data = {}) {
    if (!domain || domain === 'unknown') {
      return;
    }
    
    const history = this.interactionHistory.get(domain) || {
      clicks: 0,
      timeSpent: 0,
      returns: 0,
      lastVisit: 0,
      eoqScores: []
    };
    
    switch (interactionType) {
      case 'click':
        history.clicks++;
        history.lastVisit = Date.now();
        break;
        
      case 'timeSpent':
        history.timeSpent += data.seconds || 0;
        break;
        
      case 'return':
        history.returns++;
        break;
        
      case 'eoqScore':
        history.eoqScores.push({
          score: data.score,
          timestamp: Date.now()
        });
        // Keep only recent scores (last 50)
        if (history.eoqScores.length > 50) {
          history.eoqScores = history.eoqScores.slice(-50);
        }
        break;
    }
    
    this.interactionHistory.set(domain, history);
    this.persistReputation();
  }

  // Get average EOQ score for a domain
  getDomainAverageEOQ(domain) {
    const history = this.interactionHistory.get(domain);
    if (!history || !history.eoqScores || history.eoqScores.length === 0) {
      return null;
    }
    
    // Calculate average of recent scores (last 30 days)
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentScores = history.eoqScores
      .filter(entry => entry.timestamp > monthAgo)
      .map(entry => entry.score);
    
    if (recentScores.length === 0) {
      return null;
    }
    
    return recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
  }

  // Update domain reputation based on EOQ performance
  updateReputationFromEOQ(domain, eoqScore) {
    this.recordInteraction(domain, 'eoqScore', { score: eoqScore });
    
    // Gradually adjust reputation based on EOQ performance
    const currentReputation = this.reputationCache.get(domain);
    if (currentReputation) {
      const avgEOQ = this.getDomainAverageEOQ(domain);
      if (avgEOQ !== null) {
        // Slowly adjust reputation towards EOQ performance
        const adjustment = (avgEOQ - 0.5) * 0.1; // Convert 0-1 EOQ to -0.05 to +0.05 adjustment
        const newScore = currentReputation.score + adjustment;
        
        currentReputation.score = Math.max(-1, Math.min(1, newScore));
        currentReputation.timestamp = Date.now();
        
        this.reputationCache.set(domain, currentReputation);
      }
    }
  }

  // Get reputation statistics
  getReputationStats() {
    const stats = {
      totalDomains: this.reputationCache.size,
      highQuality: 0,
      lowQuality: 0,
      neutral: 0,
      averageReputation: 0
    };
    
    let totalScore = 0;
    
    for (const [domain, data] of this.reputationCache.entries()) {
      totalScore += data.score;
      
      if (data.score > 0.3) {
        stats.highQuality++;
      } else if (data.score < -0.3) {
        stats.lowQuality++;
      } else {
        stats.neutral++;
      }
    }
    
    if (stats.totalDomains > 0) {
      stats.averageReputation = totalScore / stats.totalDomains;
    }
    
    return stats;
  }

  // Load reputation data from storage
  async loadReputation() {
    try {
      const result = await chrome.storage.local.get(['domainReputation', 'domainInteractions']);
      
      if (result.domainReputation) {
        this.reputationCache = new Map(Object.entries(result.domainReputation));
      }
      
      if (result.domainInteractions) {
        this.interactionHistory = new Map(Object.entries(result.domainInteractions));
      }
      
      // Clean old data (older than 90 days)
      this.cleanOldData();
      
    } catch (error) {
      console.warn('Failed to load domain reputation data:', error);
    }
  }

  // Persist reputation data to storage
  async persistReputation() {
    try {
      const reputationObj = Object.fromEntries(this.reputationCache);
      const interactionObj = Object.fromEntries(this.interactionHistory);
      
      await chrome.storage.local.set({
        domainReputation: reputationObj,
        domainInteractions: interactionObj
      });
    } catch (error) {
      console.warn('Failed to persist domain reputation data:', error);
    }
  }

  // Clean old data to prevent storage bloat
  cleanOldData() {
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    
    // Clean old reputation entries
    for (const [domain, data] of this.reputationCache.entries()) {
      if (data.timestamp < ninetyDaysAgo) {
        this.reputationCache.delete(domain);
      }
    }
    
    // Clean old interaction entries
    for (const [domain, history] of this.interactionHistory.entries()) {
      if (history.lastVisit < ninetyDaysAgo) {
        this.interactionHistory.delete(domain);
      } else {
        // Clean old EOQ scores within the history
        if (history.eoqScores) {
          history.eoqScores = history.eoqScores.filter(
            entry => entry.timestamp > ninetyDaysAgo
          );
        }
      }
    }
  }

  // Export reputation data for analysis
  exportReputationData() {
    return {
      reputations: Object.fromEntries(this.reputationCache),
      interactions: Object.fromEntries(this.interactionHistory),
      stats: this.getReputationStats(),
      exportDate: new Date().toISOString()
    };
  }

  // Import reputation data (for sharing between users, if desired)
  importReputationData(data) {
    if (data.reputations) {
      // Merge with existing data, keeping more recent entries
      for (const [domain, repData] of Object.entries(data.reputations)) {
        const existing = this.reputationCache.get(domain);
        if (!existing || existing.timestamp < repData.timestamp) {
          this.reputationCache.set(domain, repData);
        }
      }
    }
    
    this.persistReputation();
  }
}

// Simplified DomainReputation class for compatibility
class DomainReputation {
  constructor() {
    this.manager = new DomainReputationManager();
  }

  extractDomain(url) {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return 'unknown';
    }
  }

  getDomainReputation(domain) {
    // Return a synchronous result with default values
    const seedScore = this.manager.seedReputations[domain] || 0;
    const patternScore = this.manager.analyzeDomainPatterns(domain);
    const tldScore = this.manager.analyzeTLD(domain);
    
    const totalScore = seedScore + patternScore + tldScore;
    const clampedScore = Math.max(-1, Math.min(1, totalScore));
    
    return {
      score: clampedScore,
      category: this.getCategory(clampedScore),
      confidence: 0.7
    };
  }

  getCategory(score) {
    if (score > 0.3) return 'high_quality';
    if (score < -0.3) return 'low_quality';
    return 'neutral';
  }

  async getReputation(domain) {
    return this.manager.getReputation(domain);
  }

  recordInteraction(domain, type, data) {
    return this.manager.recordInteraction(domain, type, data);
  }

  updateReputationFromEOQ(domain, eoqScore) {
    return this.manager.updateReputationFromEOQ(domain, eoqScore);
  }
}
