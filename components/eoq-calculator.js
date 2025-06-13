// EOQ Calculator - Core scoring engine for the Existence Optimization Quotient
class EOQCalculator {
  constructor(apiKey, preferredModel = 'gpt-4o-mini', enableContentEnhancement = true) {
    this.apiKey = apiKey;
    this.preferredModel = preferredModel;
    this.enableContentEnhancement = enableContentEnhancement;
    this.empathyWeights = {
      golden: 0.30,   // Reciprocity
      silver: 0.25,   // Non-harm
      platinum: 0.25, // Other-centeredness
      love: 0.20      // Universal care
    };
    this.cache = new Map();
    this.contentEnhancer = new ContentEnhancer();
    this.loadCache();
  }

  // Set content enhancement preference
  setContentEnhancement(enabled) {
    this.enableContentEnhancement = enabled;
    console.log('EOQ Calculator: Content enhancement', enabled ? 'enabled' : 'disabled');
  }

  // Main EOQ calculation method
  async calculateEOQ(searchResult) {
    const content = {
      title: searchResult.title,
      snippet: searchResult.snippet,
      url: searchResult.url
    };

    // Check cache first
    const cacheKey = this.generateCacheKey(content);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log('EOQ: Using cached score for', content.title.substring(0, 50) + '...');
      return cached;
    }

    // Phase 1: Enhanced content analysis (if enabled)
    let enhancedContent = content;
    if (this.enableContentEnhancement) {
      try {
        const enhancement = await this.contentEnhancer.enhanceResult(searchResult);
        enhancedContent = { ...content, enhancement };
        console.log('EOQ: Content enhancement completed, method:', enhancement.method);
      } catch (error) {
        console.warn('EOQ: Content enhancement failed, using basic content:', error.message);
      }
    } else {
      console.log('EOQ: Content enhancement disabled by user preference');
    }

    // Detailed logging for diagnostics
    if (!this.apiKey) {
      console.log('EOQ: No API key provided, using heuristic scoring');
      const heuristicScore = this.calculateHeuristic(enhancedContent);
      this.saveToCache(cacheKey, heuristicScore);
      return heuristicScore;
    }

    if (!this.apiKey.startsWith('sk-')) {
      console.warn('EOQ: Invalid API key format, falling back to heuristic');
      const heuristicScore = this.calculateHeuristic(enhancedContent);
      this.saveToCache(cacheKey, heuristicScore);
      return heuristicScore;
    }

    try {
      console.log('EOQ: Attempting OpenAI calculation for', content.title.substring(0, 50) + '...');
      const eoqScore = await this.calculateWithOpenAI(enhancedContent);
      console.log('EOQ: OpenAI calculation successful, score:', eoqScore.total.toFixed(2));
      
      // Update domain reputation based on EOQ performance
      if (enhancedContent.enhancement) {
        const domain = this.contentEnhancer.domainReputation.extractDomain(content.url);
        this.contentEnhancer.domainReputation.updateReputationFromEOQ(domain, eoqScore.total);
      }
      
      // Cache the result
      this.saveToCache(cacheKey, eoqScore);
      return eoqScore;
      
    } catch (error) {
      console.warn('EOQ: OpenAI calculation failed, falling back to heuristic. Error:', error.message);
      
      // Track failure reasons for diagnostics
      this.trackFailureReason(error);
      
      const heuristicScore = this.calculateHeuristic(enhancedContent);
      heuristicScore.fallbackReason = error.message;
      this.saveToCache(cacheKey, heuristicScore);
      return heuristicScore;
    }
  }

  // Track failure reasons for diagnostics
  trackFailureReason(error) {
    if (!this.failureStats) {
      this.failureStats = {
        rateLimits: 0,
        authErrors: 0,
        networkErrors: 0,
        parseErrors: 0,
        otherErrors: 0,
        total: 0
      };
    }

    this.failureStats.total++;

    if (error.message.includes('429') || error.message.includes('rate limit')) {
      this.failureStats.rateLimits++;
      console.warn('EOQ: Rate limit hit. Consider reducing request frequency.');
    } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
      this.failureStats.authErrors++;
      console.warn('EOQ: Authentication error. Check API key validity.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      this.failureStats.networkErrors++;
      console.warn('EOQ: Network error. Check internet connection.');
    } else if (error.message.includes('JSON') || error.message.includes('parse')) {
      this.failureStats.parseErrors++;
      console.warn('EOQ: Response parsing error. API returned unexpected format.');
    } else {
      this.failureStats.otherErrors++;
      console.warn('EOQ: Unknown error type:', error.message);
    }

    // Log summary every 10 failures
    if (this.failureStats.total % 10 === 0) {
      console.log('EOQ Failure Summary:', this.failureStats);
    }
  }

  // Get failure statistics for debugging
  getFailureStats() {
    return this.failureStats || { total: 0 };
  }

  // OpenAI-powered EOQ calculation
  async calculateWithOpenAI(content) {
    // Calculate components sequentially to maintain order and avoid race conditions
    const empathy = await this.calculateEmpathy(content);
    const certainty = await this.assessCertaintyHandling(content);
    const boundary = await this.assessBoundaryPermeability(content);
    const refinement = await this.assessRefinementVelocity(content);

    const totalEOQ = 
      0.40 * empathy + 
      0.25 * certainty + 
      0.20 * boundary + 
      0.15 * refinement;

    return {
      total: Math.max(0, Math.min(1, totalEOQ)),
      components: { empathy, certainty, boundary, refinement },
      breakdown: {
        empathy: this.lastEmpathyBreakdown,
        certainty: this.lastCertaintyDetails,
        boundary: this.lastBoundaryDetails,
        refinement: this.lastRefinementDetails
      },
      method: 'openai'
    };
  }

  // Heuristic-based EOQ calculation (fallback)
  calculateHeuristic(content) {
    const text = `${content.title} ${content.snippet}`.toLowerCase();
    
    let empathy = this.calculateHeuristicEmpathy(text, content.url);
    let certainty = this.calculateHeuristicCertainty(text);
    let boundary = this.calculateHeuristicBoundary(text);
    let refinement = this.calculateHeuristicRefinement(text, content.url);

    // Apply content enhancement adjustments if available
    if (content.enhancement && content.enhancement.adjustments) {
      const adj = content.enhancement.adjustments;
      empathy = Math.max(0, Math.min(1, empathy + adj.empathy));
      certainty = Math.max(0, Math.min(1, certainty + adj.certainty));
      boundary = Math.max(0, Math.min(1, boundary + adj.boundary));
      refinement = Math.max(0, Math.min(1, refinement + adj.refinement));
      
      console.log('EOQ: Applied content enhancement adjustments:', adj);
    }

    const totalEOQ = 
      0.40 * empathy + 
      0.25 * certainty + 
      0.20 * boundary + 
      0.15 * refinement;

    return {
      total: Math.max(0, Math.min(1, totalEOQ)),
      components: { empathy, certainty, boundary, refinement },
      breakdown: {
        empathy: { golden: empathy, silver: empathy, platinum: empathy, love: empathy, reasoning: 'Heuristic pattern analysis' + (content.enhancement ? ' + content enhancement' : '') },
        certainty: { score: certainty, reasoning: 'Heuristic uncertainty analysis' + (content.enhancement ? ' + content enhancement' : '') },
        boundary: { score: boundary, reasoning: 'Heuristic bridge/division analysis' + (content.enhancement ? ' + content enhancement' : '') },
        refinement: { score: refinement, reasoning: 'Heuristic growth/stagnation analysis' + (content.enhancement ? ' + content enhancement' : '') }
      },
      enhancement: content.enhancement,
      method: content.enhancement ? 'heuristic_enhanced' : 'heuristic'
    };
  }

  // Heuristic empathy scoring
  calculateHeuristicEmpathy(text, url) {
    let score = 0.5; // Start neutral

    // Positive empathy indicators
    const positivePatterns = [
      /\b(help|support|care|community|together|inclusive|everyone|accessible)\b/g,
      /\b(we|us|our|collective|shared|mutual)\b/g,
      /\b(understand|empathy|compassion|kindness)\b/g
    ];

    // Negative empathy indicators
    const negativePatterns = [
      /\b(scam|trick|exploit|manipulate|deceive)\b/g,
      /\b(hate|attack|destroy|eliminate|crush)\b/g,
      /\b(only|exclusive|elite|superior)\b/g
    ];

    // URL-based adjustments
    if (url.includes('edu') || url.includes('org')) score += 0.1;
    if (url.includes('ad') || url.includes('affiliate')) score -= 0.2;

    // Pattern matching
    positivePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 0.05;
    });

    negativePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score -= matches.length * 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  // Heuristic certainty scoring
  calculateHeuristicCertainty(text) {
    let score = 0.5; // Start neutral

    // Good uncertainty handling
    const uncertaintyPatterns = [
      /\b(may|might|could|possibly|perhaps|likely|probably)\b/g,
      /\b(research suggests|studies show|according to|evidence indicates)\b/g,
      /\b(it depends|varies|complex|nuanced)\b/g
    ];

    // Poor certainty handling
    const certaintyPatterns = [
      /\b(always|never|definitely|absolutely|guaranteed|proven fact)\b/g,
      /\b(secret|miracle|instant|immediate|overnight)\b/g,
      /\b(100%|completely|totally|perfectly)\b/g
    ];

    uncertaintyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 0.1;
    });

    certaintyPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score -= matches.length * 0.15;
    });

    return Math.max(0, Math.min(1, score));
  }

  // Heuristic boundary permeability scoring
  calculateHeuristicBoundary(text) {
    let score = 0.5; // Start neutral

    // Bridge-building language
    const bridgePatterns = [
      /\b(both|and|also|including|diverse|variety|different perspectives)\b/g,
      /\b(understand|bridge|connect|unite|common ground)\b/g,
      /\b(collaboration|cooperation|partnership|alliance)\b/g
    ];

    // Divisive language
    const divisivePatterns = [
      /\b(us vs them|enemy|fight|battle|war|against)\b/g,
      /\b(only way|right way|wrong|stupid|idiotic)\b/g,
      /\b(liberals|conservatives|leftists|rightists)\b/g
    ];

    bridgePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 0.1;
    });

    divisivePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score -= matches.length * 0.15;
    });

    return Math.max(0, Math.min(1, score));
  }

  // Heuristic refinement velocity scoring
  calculateHeuristicRefinement(text, url) {
    let score = 0.5; // Start neutral

    // Growth-promoting content
    const growthPatterns = [
      /\b(learn|education|skill|develop|improve|grow)\b/g,
      /\b(practice|training|course|tutorial|guide)\b/g,
      /\b(knowledge|wisdom|understanding|insight)\b/g
    ];

    // Stagnation-promoting content
    const stagnationPatterns = [
      /\b(quick fix|easy money|get rich quick|no effort)\b/g,
      /\b(lazy|shortcut|cheat|hack|trick)\b/g,
      /\b(instant|overnight|immediate|effortless)\b/g
    ];

    // URL-based adjustments
    if (url.includes('edu') || url.includes('course') || url.includes('learn')) score += 0.2;
    if (url.includes('casino') || url.includes('lottery') || url.includes('gambling')) score -= 0.3;

    growthPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score += matches.length * 0.1;
    });

    stagnationPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) score -= matches.length * 0.2;
    });

    return Math.max(0, Math.min(1, score));
  }

  // OpenAI API methods
  async calculateEmpathy(content) {
    const prompt = `
Analyze this search result for empathetic qualities. Score each dimension from 0-1:

1. Golden Rule (reciprocity): Does it treat others as the author would want to be treated?
2. Silver Rule (non-harm): Does it avoid causing harm?
3. Platinum Rule (other-centeredness): Does it consider others' actual needs and preferences?
4. Universal Love: Does it promote collective flourishing and wellbeing?

Content Title: ${content.title}
Content Snippet: ${content.snippet}

IMPORTANT: You must respond with valid JSON only. If you cannot assess the content, use score 0.5 for all dimensions.

Required JSON format:
{
  "golden": 0.5,
  "silver": 0.5,
  "platinum": 0.5,
  "love": 0.5,
  "reasoning": "Brief explanation"
}
`;

    try {
      const response = await this.callOpenAI(prompt);
      const scores = this.safeParseJSON(response, {
        golden: 0.5,
        silver: 0.5,
        platinum: 0.5,
        love: 0.5,
        reasoning: 'API parsing failed'
      });
      
      this.lastEmpathyBreakdown = scores;
      
      return Object.entries(this.empathyWeights)
        .reduce((total, [key, weight]) => total + weight * (scores[key] || 0.5), 0);
    } catch (error) {
      console.warn('Empathy calculation failed, using defaults:', error);
      this.lastEmpathyBreakdown = {
        golden: 0.5,
        silver: 0.5,
        platinum: 0.5,
        love: 0.5,
        reasoning: 'Calculation failed'
      };
      return 0.5;
    }
  }

  async assessCertaintyHandling(content) {
    const prompt = `
Assess how well this content handles uncertainty and acknowledges what it doesn't know.
Score from 0-1 where:
- 0 = Makes unfounded claims, false certainty
- 0.5 = Normal certainty levels
- 1 = Excellently acknowledges limitations and uncertainty

Content Title: ${content.title}
Content Snippet: ${content.snippet}

IMPORTANT: You must respond with valid JSON only. If you cannot assess the content, use score 0.5.

Required JSON format:
{
  "score": 0.5,
  "reasoning": "Brief explanation"
}
`;

    try {
      const response = await this.callOpenAI(prompt);
      const result = this.safeParseJSON(response, {
        score: 0.5,
        reasoning: 'API parsing failed'
      });
      
      this.lastCertaintyDetails = result;
      return result.score || 0.5;
    } catch (error) {
      console.warn('Certainty assessment failed, using default:', error);
      this.lastCertaintyDetails = {
        score: 0.5,
        reasoning: 'Assessment failed'
      };
      return 0.5;
    }
  }

  async assessBoundaryPermeability(content) {
    const prompt = `
Assess whether this content builds bridges or creates divisions.
Score from 0-1 where:
- 0 = Creates strong us-vs-them divisions
- 0.5 = Neutral
- 1 = Actively bridges divides and promotes understanding

Content Title: ${content.title}
Content Snippet: ${content.snippet}

IMPORTANT: You must respond with valid JSON only. If you cannot assess the content, use score 0.5.

Required JSON format:
{
  "score": 0.5,
  "reasoning": "Brief explanation"
}
`;

    try {
      const response = await this.callOpenAI(prompt);
      const result = this.safeParseJSON(response, {
        score: 0.5,
        reasoning: 'API parsing failed'
      });
      
      this.lastBoundaryDetails = result;
      return result.score || 0.5;
    } catch (error) {
      console.warn('Boundary assessment failed, using default:', error);
      this.lastBoundaryDetails = {
        score: 0.5,
        reasoning: 'Assessment failed'
      };
      return 0.5;
    }
  }

  async assessRefinementVelocity(content) {
    const prompt = `
Assess whether this content promotes growth, learning, and positive change.
Score from 0-1 where:
- 0 = Promotes stagnation or regression
- 0.5 = Neutral
- 1 = Strongly encourages growth and development

Content Title: ${content.title}
Content Snippet: ${content.snippet}

IMPORTANT: You must respond with valid JSON only. If you cannot assess the content, use score 0.5.

Required JSON format:
{
  "score": 0.5,
  "reasoning": "Brief explanation"
}
`;

    try {
      const response = await this.callOpenAI(prompt);
      const result = this.safeParseJSON(response, {
        score: 0.5,
        reasoning: 'API parsing failed'
      });
      
      this.lastRefinementDetails = result;
      return result.score || 0.5;
    } catch (error) {
      console.warn('Refinement assessment failed, using default:', error);
      this.lastRefinementDetails = {
        score: 0.5,
        reasoning: 'Assessment failed'
      };
      return 0.5;
    }
  }

  async callOpenAI(prompt) {
    // Get user's preferred model, default to GPT-4o Mini for speed
    const { preferredModel = 'gpt-4o-mini' } = await chrome.storage.sync.get(['preferredModel']);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: preferredModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at evaluating content for human flourishing and collective benefit. Provide precise, objective analysis in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Reduced for more consistent results
        max_tokens: 250   // Reduced for faster responses
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid OpenAI API response structure');
    }
    
    return data.choices[0].message.content;
  }

  // Safe JSON parsing with fallback
  safeParseJSON(jsonString, fallback = {}) {
    try {
      // Clean the string - remove any non-JSON content
      let cleanString = jsonString.trim();
      
      // Look for JSON object boundaries
      const startIndex = cleanString.indexOf('{');
      const endIndex = cleanString.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleanString = cleanString.substring(startIndex, endIndex + 1);
      }
      
      const parsed = JSON.parse(cleanString);
      
      // Validate that we got an object
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      } else {
        console.warn('Parsed JSON is not an object:', parsed);
        return fallback;
      }
    } catch (error) {
      console.warn('JSON parsing failed:', error, 'Raw response:', jsonString);
      return fallback;
    }
  }

  // Cache management methods
  generateCacheKey(content) {
    try {
      // Create a safe string for hashing
      const safeString = `${content.title}|${content.snippet}|${content.url}`;
      
      // Use TextEncoder for Unicode-safe encoding
      const encoder = new TextEncoder();
      const data = encoder.encode(safeString);
      
      // Create a simple hash from the encoded data
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data[i];
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      // Convert to positive hex string
      const hashString = Math.abs(hash).toString(16);
      
      // Pad with zeros and limit length
      return hashString.padStart(8, '0').substring(0, 32);
      
    } catch (error) {
      console.warn('Cache key generation failed, using fallback:', error);
      
      // Fallback: create a simple hash from title length and URL
      const fallbackString = `${content.title.length}_${content.url.length}_${Date.now()}`;
      let simpleHash = 0;
      for (let i = 0; i < fallbackString.length; i++) {
        simpleHash = ((simpleHash << 5) - simpleHash) + fallbackString.charCodeAt(i);
        simpleHash = simpleHash & simpleHash;
      }
      return Math.abs(simpleHash).toString(16).substring(0, 16);
    }
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  saveToCache(key, data) {
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    this.cache.set(key, { data, expires });
    this.persistCache();
  }

  async loadCache() {
    try {
      const result = await chrome.storage.local.get(['eoqCache']);
      if (result.eoqCache) {
        this.cache = new Map(Object.entries(result.eoqCache));
        // Clean expired entries
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
          if (now >= value.expires) {
            this.cache.delete(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load EOQ cache:', error);
    }
  }

  async persistCache() {
    try {
      // Limit cache size to prevent storage issues
      if (this.cache.size > 1000) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].expires - b[1].expires);
        this.cache = new Map(entries.slice(-800)); // Keep newest 800 entries
      }

      const cacheObj = Object.fromEntries(this.cache);
      await chrome.storage.local.set({ eoqCache: cacheObj });
    } catch (error) {
      console.warn('Failed to persist EOQ cache:', error);
    }
  }
}
