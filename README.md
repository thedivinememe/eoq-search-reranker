# EOQ Search Reranker Browser Extension

A Chrome browser extension that intercepts Google search results and re-ranks them based on the Existence Optimization Quotient (EOQ) framework, prioritizing content that promotes human flourishing over engagement metrics.

## 🌟 What is EOQ?

The Existence Optimization Quotient (EOQ) evaluates content across four key dimensions:

- **Empathy Contribution (40%)**: How well content considers collective benefit and wellbeing
- **Certainty Management (25%)**: Appropriate handling of uncertainty and limitations
- **Boundary Permeability (20%)**: Building bridges vs creating divisions
- **Refinement Velocity (15%)**: Promoting growth and learning vs stagnation

## ✨ Features

### Core EOQ Functionality
- **Intelligent Reranking**: Automatically reorders Google search results based on EOQ scores
- **Multi-Model AI Support**: Choose from GPT-4o, GPT-4o-mini, GPT-4-turbo, or GPT-3.5-turbo
- **Hybrid Enhancement**: Combines AI analysis with web content fetching for deeper insights
- **Heuristic Fallback**: Works without API key using sophisticated rule-based scoring
- **Real-time Processing**: Parallel scoring for fast results processing
- **Domain Reputation**: Evaluates source credibility and trustworthiness

### Advanced Content Filtering
- **AI Content Filtering**: Automatically detects and hides Google AI Overview and AI-generated content
- **Sponsored Result Filtering**: Intelligently removes ads, promoted content, and affiliate marketing
- **Image Content Filtering**: Optional filtering of image carousels and image-focused results  
- **Video Content Filtering**: Optional filtering of YouTube and video-heavy results
- **Smart Detection**: Uses multiple signals (DOM structure, URL patterns, content analysis)
- **Granular Control**: Hide completely, de-prioritize, mark only, or disable each filter type

### Enhanced User Interface
- **Dynamic Score Overlays**: Visual indicators with expandable EOQ breakdowns
- **Interactive Components**: Click to expand empathy sub-scores and reasoning
- **Comparison Dashboard**: Side-by-side EOQ vs traditional ranking analysis
- **Floating Controls**: Non-intrusive toggle and settings panel
- **Progress Indicators**: Real-time feedback during score calculation
- **Status Notifications**: Clear feedback on extension state and actions

### Content Enhancement System
- **Web Content Fetching**: Retrieves full page content for more accurate scoring
- **CORS-Safe Processing**: Handles cross-origin restrictions gracefully
- **Content Summarization**: Extracts key information from full articles
- **Fallback Mechanisms**: Multiple scoring methods ensure reliability
- **Performance Optimization**: Efficient caching and parallel processing

### Model Selection & Configuration
- **Flexible AI Models**: Support for multiple OpenAI models with different capabilities
- **Cost Optimization**: Choose faster/cheaper models for routine scoring
- **Quality Control**: Higher-end models for complex content analysis
- **Automatic Fallbacks**: Graceful degradation when preferred models unavailable
- **Usage Tracking**: Monitor API costs and usage patterns

### Privacy & Performance
- **Local Processing**: All analysis happens in your browser
- **Secure Storage**: Encrypted API key storage in Chrome sync
- **Smart Caching**: Reduces API calls while maintaining freshness
- **Session Statistics**: Track improvements without external data collection
- **Export Capabilities**: Download your usage data and settings
- **Debug Mode**: Advanced troubleshooting and performance monitoring

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/thedivinememe/eoq-search-reranker.git
   cd eoq-search-reranker
   ```

2. **Generate Icons** (Optional)
   - Open `icons/create-icons.html` in your browser
   - Download the generated icons to the `icons/` folder
   - Or use your own 16x16, 48x48, and 128x128 PNG icons

3. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `eoq-search-reranker` folder

4. **Configure API Key**
   - Click the extension icon in Chrome toolbar
   - Enter your OpenAI API key in the popup
   - Click "Save Key" and "Test Connection"

### Method 2: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store once approved.

## 🔧 Setup & Configuration

### OpenAI API Key Setup

1. **Get an API Key**
   - Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key

2. **Configure the Extension**
   - Click the EOQ extension icon
   - Paste your API key in the configuration section
   - Test the connection to verify it works

3. **Usage Considerations**
   - API calls cost money (typically $0.01-0.03 per search)
   - The extension caches scores to minimize repeated calls
   - You can use heuristic scoring without an API key

### Settings Options

#### Core EOQ Settings
- **Enable EOQ Ranking**: Toggle automatic reordering of search results
- **Show Score Overlays**: Display EOQ scores on search results
- **Model Selection**: Choose from GPT-4o, GPT-4o-mini, GPT-4-turbo, or GPT-3.5-turbo
- **Content Enhancement**: Enable web content fetching for deeper analysis
- **Cache Scores Locally**: Store calculated scores to reduce API usage

#### Content Filtering Settings
- **Hide AI Content**: Automatically filter Google AI Overview and AI-generated summaries
- **Hide Sponsored Results**: Remove ads, promoted content, and affiliate marketing
- **Hide Image Content**: Filter image carousels and image-focused results
- **Hide Video Content**: Filter YouTube and video-heavy results
- **Debug Mode**: Enable detailed logging and performance monitoring

#### Advanced Configuration
- **Hybrid Enhancement**: Combine AI analysis with full web content fetching
- **Domain Reputation**: Factor in source credibility and trustworthiness
- **Parallel Processing**: Enable faster scoring through concurrent analysis
- **Fallback Methods**: Automatic switching between AI and heuristic scoring

## 📖 How to Use

### Basic Usage

1. **Perform a Google Search**
   - Navigate to Google and search for any topic
   - The extension automatically activates on search results pages

2. **View EOQ Scores**
   - Each search result shows an EOQ score overlay
   - Click the expand button (▼) to see detailed breakdowns
   - Higher scores indicate content more likely to promote human flourishing

3. **Compare Rankings**
   - Click the comparison button (⚖️) in the floating control panel
   - View side-by-side comparison of EOQ vs traditional rankings
   - See statistics about how many results moved and by how much

4. **Toggle Rankings**
   - Use the toggle switch to switch between EOQ and original rankings
   - Overlays can be hidden while keeping the reordering active

### Sponsored Result Filtering

The extension includes intelligent filtering of sponsored and advertising content to focus on organic, valuable results:

#### What Gets Filtered
- **Google Ads**: Top and bottom sponsored results
- **Shopping Ads**: Product promotion boxes
- **Affiliate Links**: Results primarily focused on commissions
- **Promotional Content**: Marketing-heavy results with low informational value

#### How It Works
- **Automatic Detection**: Uses multiple signals to identify sponsored content
  - DOM structure analysis (ad containers, sponsored labels)
  - URL pattern matching (tracking parameters, affiliate domains)
  - Content analysis (promotional language, commercial intent)
- **Smart Filtering**: Can hide completely or just de-prioritize based on settings
- **User Control**: Toggle sponsored filtering on/off in the extension popup

#### Benefits
- **Cleaner Results**: Focus on informational and educational content
- **Reduced Manipulation**: Less exposure to purely commercial interests
- **Better EOQ Scores**: Organic content typically scores higher for human flourishing
- **Faster Processing**: Fewer results to analyze means quicker EOQ calculations

#### Configuration Options
- **Hide Completely**: Remove sponsored results entirely from view
- **De-prioritize**: Move sponsored results to bottom but keep visible
- **Mark Only**: Keep in place but add visual indicators
- **Disable**: Turn off sponsored filtering entirely

### AI Content Filtering

The extension automatically detects and filters AI-generated content to focus on human-authored, original sources:

#### What Gets Filtered
- **Google AI Overview**: The AI-generated summaries at the top of search results
- **Search Generative Experience (SGE)**: Google's experimental AI responses
- **AI-Generated Summaries**: Automated content summaries and overviews
- **Bard Responses**: Google's AI chatbot responses in search results

#### Detection Methods
- **Text Pattern Analysis**: Identifies "AI Overview" and similar phrases
- **CSS Class Detection**: Recognizes Google's AI-specific styling classes
- **DOM Structure Analysis**: Detects AI content containers and layouts
- **Attribute-Based Detection**: Uses data attributes like `data-attrid="SGE"`

#### Benefits
- **Human-First Results**: Prioritizes content created by real people
- **Original Sources**: Direct access to primary information sources
- **Reduced AI Bias**: Avoids potential biases in AI-generated summaries
- **Authentic Perspectives**: Access to diverse human viewpoints and experiences

#### Safety Features
- **Precise Targeting**: Only hides specific AI elements, never entire pages
- **Container Protection**: Safeguards against hiding main search results
- **Size Validation**: Uses element dimensions to prevent over-filtering
- **Fallback Protection**: Conservative approach that defaults to showing content

### Model Selection & Performance

Choose the right AI model for your needs and budget:

#### Available Models
- **GPT-4o**: Latest and most capable, best for complex analysis
- **GPT-4o-mini**: Balanced performance and cost, recommended for most users
- **GPT-4-turbo**: High performance with good speed
- **GPT-3.5-turbo**: Fastest and most economical option

#### Performance Comparison
| Model | Speed | Cost | Quality | Best For |
|-------|-------|------|---------|----------|
| GPT-4o | Slow | High | Excellent | Complex content, research |
| GPT-4o-mini | Fast | Low | Very Good | General use, daily searches |
| GPT-4-turbo | Medium | Medium | Excellent | Professional use |
| GPT-3.5-turbo | Very Fast | Very Low | Good | Quick scoring, high volume |

#### Hybrid Enhancement
When enabled, the extension fetches full web page content for more accurate scoring:
- **Deeper Analysis**: Analyzes complete articles, not just snippets
- **Better Context**: Understands full context and nuance
- **Improved Accuracy**: More reliable EOQ scores based on complete content
- **CORS Handling**: Gracefully handles cross-origin restrictions

### Understanding Scores

#### Overall EOQ Score
- **80-100%**: Excellent - Strongly promotes human flourishing
- **60-79%**: Good - Generally positive impact
- **40-59%**: Fair - Mixed or neutral impact
- **20-39%**: Poor - May have negative impacts
- **0-19%**: Very Poor - Likely harmful or exploitative

#### Component Breakdown
- **❤️ Empathy**: Collective benefit, care for others, wellbeing
- **🎯 Certainty**: Handling uncertainty, acknowledging limitations
- **🌉 Bridges**: Building understanding, reducing divisions
- **🌱 Growth**: Promoting learning, development, positive change

#### Empathy Sub-Components
- **🥇 Golden Rule**: Reciprocity and treating others well
- **🥈 Silver Rule**: Avoiding harm to others
- **🏆 Platinum Rule**: Considering others' actual needs
- **💝 Universal Love**: Promoting collective flourishing

## 🔍 Example Use Cases

### Educational Searches
**Query**: "how to learn programming"
- **Traditional**: Prioritizes popular coding bootcamps and paid courses
- **EOQ Optimized**: Elevates free educational resources, community-driven learning, and comprehensive beginner guides

### Health Information
**Query**: "depression help"
- **Traditional**: May show quick fixes or commercial solutions first
- **EOQ Optimized**: Prioritizes evidence-based resources, professional help, and supportive communities

### Financial Advice
**Query**: "how to make money online"
- **Traditional**: Often shows get-rich-quick schemes and affiliate marketing
- **EOQ Optimized**: Elevates legitimate skill-building, ethical business practices, and sustainable approaches

### Social Issues
**Query**: "climate change solutions"
- **Traditional**: May prioritize individual actions or controversial content
- **EOQ Optimized**: Emphasizes collective action, systemic solutions, and scientifically-backed approaches

## 🛠️ Technical Architecture

### File Structure
```
eoq-search-reranker/
├── manifest.json                    # Extension configuration
├── background.js                    # Service worker for extension lifecycle
├── content-script.js                # Main orchestration script
├── components/
│   ├── eoq-calculator.js            # Core EOQ scoring logic
│   ├── search-interceptor.js        # Search result extraction & filtering
│   ├── ui-injector.js               # UI components and overlays
│   ├── content-fetcher.js           # Web content retrieval system
│   ├── content-enhancer.js          # Content enhancement & summarization
│   └── domain-reputation.js         # Domain credibility assessment
├── popup/
│   ├── popup.html                   # Extension popup interface
│   ├── popup.css                    # Popup styling
│   └── popup.js                     # Popup functionality & settings
├── styles/
│   └── eoq-overlay.css              # Content script styling
├── icons/
│   ├── icon-16.png                  # Extension icons (16x16)
│   ├── icon-48.png                  # Extension icons (48x48)
│   ├── icon-128.png                 # Extension icons (128x128)
│   └── create-icons.html            # Icon generation utility
├── test/
│   ├── test-page.html               # Basic functionality test
│   ├── model-selection-test.html    # AI model testing
│   ├── content-enhancement-toggle-test.html # Enhancement testing
│   ├── content-filtering-test.html  # Content filtering tests
│   ├── ai-overview-detection-test.html # AI content detection tests
│   ├── hybrid-enhancement-test.html # Hybrid enhancement tests
│   └── sponsored-filter-test.html   # Sponsored content filtering tests
├── documentation/
│   ├── MODEL_SELECTION_IMPLEMENTATION.md
│   ├── CONTENT_ENHANCEMENT_TOGGLE_SUCCESS.md
│   ├── CONTENT_FILTERING_IMPLEMENTATION.md
│   ├── HYBRID_ENHANCEMENT_IMPLEMENTATION.md
│   └── SPONSORED_FILTER_FIXES.md
└── README.md                        # This comprehensive guide
```

### Key Components

#### EOQ Calculator (`components/eoq-calculator.js`)
- **Core Framework**: Implements the four-dimensional EOQ scoring system
- **Multi-Model Support**: Handles GPT-4o, GPT-4o-mini, GPT-4-turbo, GPT-3.5-turbo
- **Hybrid Analysis**: Combines AI scoring with heuristic fallbacks
- **Empathy Breakdown**: Detailed sub-component analysis (Golden, Silver, Platinum, Universal Love)
- **Performance Optimization**: Parallel processing and intelligent caching
- **Error Handling**: Graceful degradation and comprehensive error recovery

#### Search Interceptor (`components/search-interceptor.js`)
- **Result Extraction**: Handles multiple Google search layouts and formats
- **Content Filtering**: Advanced filtering for sponsored, AI, image, and video content
- **Smart Detection**: Multi-signal approach using DOM, URL, and content analysis
- **Reordering Engine**: Sophisticated result reordering with position tracking
- **Statistics**: Comprehensive analytics on ranking changes and improvements
- **Safety Features**: Prevents accidental hiding of main search containers

#### UI Injector (`components/ui-injector.js`)
- **Dynamic Overlays**: Interactive score displays with expandable details
- **Floating Controls**: Non-intrusive toggle and settings panel
- **Progress Feedback**: Real-time status updates during processing
- **Comparison Dashboard**: Side-by-side ranking analysis
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Adapts to different screen sizes and layouts

#### Content Fetcher (`components/content-fetcher.js`)
- **Web Content Retrieval**: Fetches full page content for enhanced analysis
- **CORS Handling**: Manages cross-origin restrictions gracefully
- **Performance Optimization**: Efficient caching and request management
- **Error Recovery**: Multiple fallback strategies for failed requests
- **Content Sanitization**: Cleans and processes retrieved content safely

#### Content Enhancer (`components/content-enhancer.js`)
- **Content Summarization**: Extracts key information from full articles
- **Context Analysis**: Provides deeper understanding of content meaning
- **Quality Assessment**: Evaluates content depth and reliability
- **Integration Layer**: Seamlessly integrates with EOQ scoring system

#### Domain Reputation (`components/domain-reputation.js`)
- **Credibility Assessment**: Evaluates source trustworthiness and authority
- **Reputation Scoring**: Factors domain history and reliability into EOQ scores
- **Bias Detection**: Identifies potential biases in content sources
- **Quality Indicators**: Assesses editorial standards and fact-checking practices

### Architecture Patterns

#### Modular Design
- **Separation of Concerns**: Each component handles specific functionality
- **Loose Coupling**: Components interact through well-defined interfaces
- **Extensibility**: Easy to add new features and scoring methods
- **Testability**: Individual components can be tested in isolation

#### Performance Optimization
- **Parallel Processing**: Concurrent scoring for faster results
- **Intelligent Caching**: Reduces API calls and improves response times
- **Lazy Loading**: Components load only when needed
- **Memory Management**: Efficient cleanup and resource management

#### Error Handling & Resilience
- **Graceful Degradation**: System continues working even when components fail
- **Multiple Fallbacks**: Heuristic scoring when AI is unavailable
- **Comprehensive Logging**: Detailed error reporting for debugging
- **User Feedback**: Clear communication of system status and issues

## 🔒 Privacy & Security

### Data Handling
- **API Keys**: Stored locally in Chrome's encrypted storage
- **Search Queries**: Only sent to OpenAI for scoring (when API key provided)
- **No Tracking**: No analytics, user tracking, or data collection
- **Local Processing**: All logic runs in your browser
- **Cache Control**: You can clear cached scores at any time

### What Gets Sent to OpenAI
When using AI scoring, only the following data is sent:
- Search result title
- Search result snippet/description
- Search result URL domain

**Never sent**: Your personal information, full browsing history, or other search queries.

### Offline Functionality
The extension works without an internet connection using heuristic scoring based on:
- Keyword analysis for empathy indicators
- Content structure evaluation
- Domain reputation assessment
- Language pattern recognition

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Working
- Ensure you're on a Google search results page (`google.com/search`)
- Check that the extension is enabled in `chrome://extensions/`
- Try refreshing the page or restarting Chrome

#### No Scores Appearing
- Verify your OpenAI API key is valid and has credits
- Check the browser console for error messages
- Try enabling heuristic scoring in settings

#### Scores Seem Incorrect
- Remember that EOQ measures human flourishing, not traditional relevance
- AI scoring can be subjective and may vary
- Try clearing the cache and recalculating scores

#### Performance Issues
- Enable score caching to reduce API calls
- Consider using heuristic scoring for faster results
- Check your internet connection for API-based scoring

### Debug Mode
Access debug information in the browser console:
```javascript
// View current scores
window.EOQDebug.getScores()

// Get reordering statistics
window.EOQDebug.getStats()

// Reprocess current results
window.EOQDebug.reprocess()

// Clean up extension
window.EOQDebug.cleanup()
```

## 🤝 Contributing

We welcome contributions to improve the EOQ framework and extension functionality!

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different search queries
5. Submit a pull request

### Areas for Contribution
- **EOQ Framework**: Improve scoring algorithms and criteria
- **UI/UX**: Enhance visual design and user experience
- **Performance**: Optimize scoring speed and accuracy
- **Compatibility**: Support additional search engines
- **Localization**: Add support for other languages

### Testing Guidelines
- Test with diverse search queries across different topics
- Verify functionality with and without API keys
- Check performance with large numbers of search results
- Ensure accessibility compliance

## 📊 Metrics & Success Criteria

### User Engagement
- Time spent on EOQ-ranked results vs traditional
- Click-through rates on high-scoring content
- User satisfaction surveys and feedback

### Content Quality
- Reduction in clicks on harmful/exploitative content
- Increase in engagement with educational/empowering content
- Diversity of sources in top results

### Technical Performance
- Extension load time and responsiveness
- API usage efficiency and cost optimization
- Cache hit rates and storage optimization

## 🔮 Future Enhancements

### Planned Features
- **Multi-Search Engine Support**: DuckDuckGo, Bing, Yahoo
- **Local LLM Integration**: Privacy-focused offline AI scoring
- **Community Scoring**: User-contributed EOQ evaluations
- **Personalization**: Adapt scoring to individual values
- **A/B Testing Framework**: Compare different scoring approaches

### Research Directions
- **Bias Detection**: Identify and mitigate algorithmic biases
- **Cultural Adaptation**: Adjust scoring for different cultural contexts
- **Long-term Impact**: Study effects on user behavior and wellbeing
- **Collective Intelligence**: Aggregate community wisdom for scoring

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the GPT API for content analysis
- The Chrome Extensions team for the robust platform
- Contributors to the EOQ framework development
- Beta testers and early adopters providing feedback

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Email**: Contact the maintainers at [your-email]
- **Documentation**: Visit the project wiki for detailed guides

---

**Made with ❤️ for human flourishing**

*The EOQ Search Reranker is an experimental tool designed to explore how search algorithms could be optimized for collective wellbeing rather than engagement metrics. Use responsibly and contribute to making information access more beneficial for humanity.*
