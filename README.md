# EOQ Search Reranker Browser Extension

A Chrome browser extension that intercepts Google search results and re-ranks them based on the Existence Optimization Quotient (EOQ) framework, prioritizing content that promotes human flourishing over engagement metrics.

## 🌟 What is EOQ?

The Existence Optimization Quotient (EOQ) evaluates content across four key dimensions:

- **Empathy Contribution (40%)**: How well content considers collective benefit and wellbeing
- **Certainty Management (25%)**: Appropriate handling of uncertainty and limitations
- **Boundary Permeability (20%)**: Building bridges vs creating divisions
- **Refinement Velocity (15%)**: Promoting growth and learning vs stagnation

## ✨ Features

### Core Functionality
- **Intelligent Reranking**: Automatically reorders Google search results based on EOQ scores
- **AI-Powered Analysis**: Uses OpenAI's GPT-4 for sophisticated content evaluation
- **Heuristic Fallback**: Works without API key using rule-based scoring
- **Real-time Processing**: Scores and reorders results as you search

### User Interface
- **Score Overlays**: Visual indicators showing EOQ scores and breakdowns
- **Interactive Details**: Expandable components showing empathy breakdown
- **Comparison Panel**: Side-by-side view of EOQ vs traditional rankings
- **Toggle Control**: Easy switching between EOQ and original rankings

### Advanced Features
- **Sponsored Result Filtering**: Automatically hides or de-prioritizes sponsored/ad content
- **Caching System**: Stores calculated scores to reduce API calls
- **Session Statistics**: Tracks searches enhanced and average improvements
- **Export Functionality**: Download your usage data and settings
- **Privacy-First**: All processing happens locally in your browser

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/your-repo/eoq-search-reranker.git
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
   - Ensure you have GPT-4 access for best results

2. **Configure the Extension**
   - Click the EOQ extension icon
   - Paste your API key in the configuration section
   - Test the connection to verify it works

3. **Usage Considerations**
   - API calls cost money (typically $0.01-0.03 per search)
   - The extension caches scores to minimize repeated calls
   - You can use heuristic scoring without an API key

### Settings Options

- **Enable EOQ Ranking**: Toggle automatic reordering of search results
- **Show Score Overlays**: Display EOQ scores on search results
- **Hide Sponsored Results**: Automatically filter out ads and sponsored content
- **Cache Scores Locally**: Store calculated scores to reduce API usage

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
├── manifest.json              # Extension configuration
├── background.js              # Service worker for extension lifecycle
├── content-script.js          # Main orchestration script
├── components/
│   ├── eoq-calculator.js      # Core EOQ scoring logic
│   ├── search-interceptor.js  # Google search result extraction
│   └── ui-injector.js         # UI components and overlays
├── popup/
│   ├── popup.html            # Extension popup interface
│   ├── popup.css             # Popup styling
│   └── popup.js              # Popup functionality
├── styles/
│   └── eoq-overlay.css       # Content script styling
├── icons/
│   ├── icon-16.png           # Extension icons
│   ├── icon-48.png
│   └── icon-128.png
└── README.md                 # This file
```

### Key Components

#### EOQ Calculator (`components/eoq-calculator.js`)
- Implements the four-dimensional EOQ framework
- Handles OpenAI API integration for AI-powered analysis
- Provides fallback heuristic scoring
- Manages empathy sub-component evaluation

#### Search Interceptor (`components/search-interceptor.js`)
- Extracts search results from Google's DOM
- Handles different Google layouts and result types
- Manages result reordering and position tracking
- Provides statistics about ranking changes

#### UI Injector (`components/ui-injector.js`)
- Creates and manages all visual elements
- Handles score overlays and detailed breakdowns
- Manages the comparison panel and statistics
- Provides interactive controls and feedback

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

- OpenAI for providing the GPT-4 API for content analysis
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
