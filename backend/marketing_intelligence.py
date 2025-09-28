import os
import json
import base64
import hashlib
import asyncio
import re
import random
import feedparser
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple
from collections import Counter
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class APIConfiguration:
    """Centralized API configuration management"""
    
    def __init__(self):
        self.use_real_apis = os.environ.get('USE_REAL_APIS', 'false').lower() == 'true'
        self.brave_api_key = os.environ.get('BRAVE_SEARCH_API_KEY', '')
        self.perplexity_api_key = os.environ.get('PERPLEXITY_API_KEY', '')
        self.emergent_llm_key = os.environ.get('EMERGENT_LLM_KEY', '')
        
    def update_configuration(self, config_data: Dict[str, Any]):
        """Update API configuration dynamically"""
        if 'use_real_apis' in config_data:
            self.use_real_apis = config_data['use_real_apis']
            os.environ['USE_REAL_APIS'] = str(config_data['use_real_apis']).lower()
            
        if 'brave_api_key' in config_data:
            self.brave_api_key = config_data['brave_api_key']
            os.environ['BRAVE_SEARCH_API_KEY'] = config_data['brave_api_key']
            
        if 'perplexity_api_key' in config_data:
            self.perplexity_api_key = config_data['perplexity_api_key']
            os.environ['PERPLEXITY_API_KEY'] = config_data['perplexity_api_key']
    
    def get_status(self) -> Dict[str, Any]:
        """Get current API configuration status"""
        return {
            "use_real_apis": self.use_real_apis,
            "brave_api_configured": bool(self.brave_api_key),
            "perplexity_api_configured": bool(self.perplexity_api_key),
            "emergent_llm_configured": bool(self.emergent_llm_key)
        }

# Global configuration instance
api_config = APIConfiguration()

class PersonaAnalyzer:
    """Advanced persona analysis and keyword generation"""
    
    def __init__(self):
        self.age_group_behaviors = {
            "18-24": {
                "keywords": ["authentic", "trendy", "social", "instant", "viral", "FOMO", "aesthetic", "sustainable", "inclusive", "digital-native"],
                "behavior": "Highly influenced by social media, values authenticity and peer approval, prefers visual content, early adopters of trends"
            },
            "25-34": {
                "keywords": ["career", "ambitious", "efficient", "premium", "experience", "networking", "growth", "innovative", "work-life balance", "investment"],
                "behavior": "Career-focused, values efficiency and quality, willing to pay for convenience, influenced by professional networks"
            },
            "35-44": {
                "keywords": ["family", "reliable", "established", "quality", "security", "practical", "trusted", "proven", "comprehensive", "legacy"],
                "behavior": "Values reliability and proven solutions, family-oriented decision making, prefers established brands with track records"
            },
            "45-54": {
                "keywords": ["expert", "sophisticated", "premium", "exclusive", "authority", "expertise", "traditional", "refined", "distinguished", "prestige"],
                "behavior": "Values expertise and sophistication, prefers premium offerings, influenced by authority and credibility"
            },
            "55+": {
                "keywords": ["trusted", "heritage", "classic", "dependable", "simple", "clear", "service", "personal", "straightforward", "established"],
                "behavior": "Values trust and personal service, prefers clear communication, loyal to established brands"
            }
        }
        
        self.location_characteristics = {
            "new york": {"keywords": ["fast-paced", "competitive", "premium", "exclusive", "cutting-edge"], "culture": "Urban, fast-paced, status-conscious"},
            "california": {"keywords": ["innovative", "sustainable", "tech-forward", "progressive", "health-conscious"], "culture": "Tech-savvy, environmentally conscious"},
            "texas": {"keywords": ["bold", "independent", "value-driven", "practical", "authentic"], "culture": "Independent, value-conscious, practical"},
            "florida": {"keywords": ["relaxed", "diverse", "vibrant", "lifestyle", "sunshine"], "culture": "Lifestyle-focused, diverse, leisure-oriented"},
            "london": {"keywords": ["sophisticated", "traditional", "quality", "heritage", "refined"], "culture": "Traditional yet modern, quality-focused"},
            "toronto": {"keywords": ["multicultural", "progressive", "inclusive", "balanced", "friendly"], "culture": "Multicultural, progressive values"}
        }
        
        self.interest_keywords = {
            "technology": ["AI", "innovation", "digital", "smart", "automated", "cutting-edge", "disruptive", "next-gen"],
            "fitness": ["active", "healthy", "performance", "energy", "strength", "wellness", "transformation", "motivation"],
            "travel": ["adventure", "explore", "discover", "journey", "experience", "wanderlust", "authentic", "memorable"],
            "food": ["gourmet", "artisanal", "fresh", "organic", "flavorful", "culinary", "farm-to-table", "indulgent"],
            "art": ["creative", "expressive", "unique", "inspiring", "aesthetic", "curated", "artistic", "imaginative"],
            "music": ["rhythm", "harmony", "soulful", "energetic", "melodic", "immersive", "emotional", "uplifting"],
            "fashion": ["stylish", "trendy", "chic", "elegant", "bold", "sophisticated", "contemporary", "statement"]
        }
    
    def analyze_persona(self, age_range: str, location: str, interests: List[str]) -> Dict[str, Any]:
        """Generate comprehensive persona analysis"""
        
        # Analyze age group
        age_data = self.age_group_behaviors.get(age_range, self.age_group_behaviors["25-34"])
        
        # Analyze location
        location_key = next((key for key in self.location_characteristics.keys() if key in location.lower()), "general")
        location_data = self.location_characteristics.get(location_key, {
            "keywords": ["local", "community", "regional", "accessible"],
            "culture": "Community-focused, local preferences"
        })
        
        # Analyze interests
        interest_keywords = []
        for interest in interests:
            interest_lower = interest.lower()
            for key, keywords in self.interest_keywords.items():
                if key in interest_lower or interest_lower in key:
                    interest_keywords.extend(keywords[:3])  # Take top 3 per interest
        
        # Generate trending keywords
        all_keywords = age_data["keywords"][:5] + location_data["keywords"][:3] + interest_keywords[:7]
        
        # Generate behavioral analysis
        behavior_analysis = f"""
**Demographic Profile**: {age_data['behavior']}

**Geographic Influence**: {location_data['culture']}

**Interest-Based Motivations**: Based on their interests in {', '.join(interests)}, this persona is likely drawn to experiences that offer {', '.join(interest_keywords[:3])} elements.

**Decision-Making Pattern**: This persona combines {age_range} generational values with {location} regional preferences, creating a unique decision-making framework that prioritizes both {age_data['keywords'][0]} and {location_data['keywords'][0]} elements in their choices.

**Marketing Receptivity**: Most responsive to messaging that emphasizes {age_data['keywords'][0]}, {interest_keywords[0] if interest_keywords else 'quality'}, and {location_data['keywords'][0]} positioning.
        """.strip()
        
        return {
            "trending_keywords_analysis": {
                "summary": f"Analysis based on {age_range} demographic in {location} with interests in {', '.join(interests)}",
                "keywords": list(set(all_keywords))[:15],  # Remove duplicates, limit to 15
                "primary_motivators": age_data["keywords"][:3],
                "regional_influences": location_data["keywords"][:3],
                "interest_drivers": interest_keywords[:5]
            },
            "behavior_analysis_summary": behavior_analysis
        }

class WordCloudProcessor:
    """Process keywords for word cloud visualization"""
    
    def __init__(self):
        # Base importance weights for different keyword categories
        self.category_weights = {
            'age_group': 80,
            'location': 70,
            'interest': 90,
            'behavior': 75,
            'general': 60
        }
        
        # High-impact keywords get bonus weight
        self.high_impact_keywords = {
            'AI', 'innovation', 'sustainable', 'premium', 'authentic', 'digital',
            'efficient', 'quality', 'exclusive', 'personalized', 'smart', 'creative'
        }
    
    def generate_word_cloud_data(self, keywords: List[str], persona_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate weighted word cloud data from trending keywords"""
        
        if not keywords:
            return []
        
        # Calculate base frequencies and apply weights
        word_weights = {}
        
        for i, keyword in enumerate(keywords):
            # Base weight decreases with position in list
            base_weight = max(100 - (i * 5), 20)
            
            # Apply category-specific weights
            keyword_lower = keyword.lower()
            category_multiplier = 1.0
            
            # Check if keyword relates to specific categories
            if any(age in keyword_lower for age in ['gen', 'millennial', 'boomer']):
                category_multiplier = self.category_weights['age_group'] / 100
            elif any(loc in keyword_lower for loc in ['local', 'regional', 'urban', 'metropolitan']):
                category_multiplier = self.category_weights['location'] / 100
            elif keyword in self.high_impact_keywords:
                category_multiplier = self.category_weights['interest'] / 100
            else:
                category_multiplier = self.category_weights['general'] / 100
            
            # High-impact keywords get bonus
            if keyword in self.high_impact_keywords:
                base_weight *= 1.3
            
            # Add some randomization for visual variety
            randomization_factor = random.uniform(0.8, 1.2)
            
            final_weight = int(base_weight * category_multiplier * randomization_factor)
            word_weights[keyword] = max(final_weight, 15)  # Minimum weight of 15
        
        # Convert to word cloud format and sort by weight
        word_cloud_data = [
            {"text": word, "value": weight}
            for word, weight in word_weights.items()
        ]
        
        # Sort by value (highest first) and limit to top 20 words
        word_cloud_data.sort(key=lambda x: x['value'], reverse=True)
        
        return word_cloud_data[:20]

class NewsCategorizationService:
    """Categorize news articles into predefined categories"""
    
    def __init__(self):
        self.category_keywords = {
            'Technology': [
                'ai', 'artificial intelligence', 'machine learning', 'tech', 'digital', 
                'software', 'app', 'blockchain', 'crypto', 'automation', 'robot', 
                'innovation', 'startup', 'silicon valley', 'cloud', 'cybersecurity'
            ],
            'Business': [
                'business', 'company', 'corporate', 'market', 'economy', 'financial',
                'revenue', 'profit', 'investment', 'stock', 'trade', 'commerce',
                'enterprise', 'industry', 'ceo', 'merger', 'acquisition'
            ],
            'Politics': [
                'political', 'government', 'election', 'policy', 'vote', 'campaign',
                'senator', 'congress', 'parliament', 'president', 'minister', 'law',
                'legislation', 'democracy', 'republican', 'democrat'
            ],
            'Fashion': [
                'fashion', 'style', 'clothing', 'designer', 'runway', 'model',
                'brand', 'apparel', 'trend', 'luxury', 'beauty', 'cosmetics',
                'makeup', 'skincare', 'accessory', 'jewelry'
            ],
            'Sports': [
                'sports', 'football', 'basketball', 'soccer', 'baseball', 'tennis',
                'olympic', 'championship', 'tournament', 'athlete', 'team', 'game',
                'match', 'season', 'coach', 'player', 'fitness'
            ],
            'Culture': [
                'culture', 'art', 'music', 'film', 'movie', 'entertainment', 'celebrity',
                'artist', 'concert', 'festival', 'museum', 'gallery', 'book', 'author',
                'theater', 'media', 'social media', 'influencer'
            ]
        }
    
    def categorize_headline(self, headline: str, summary: str = "") -> str:
        """Categorize a news headline into predefined categories"""
        
        text_to_analyze = (headline + " " + summary).lower()
        
        # Count keyword matches for each category
        category_scores = {}
        
        for category, keywords in self.category_keywords.items():
            score = 0
            for keyword in keywords:
                # Count occurrences of each keyword
                keyword_count = text_to_analyze.count(keyword.lower())
                if keyword_count > 0:
                    # Longer keywords get higher weight
                    weight = len(keyword.split()) * 2
                    score += keyword_count * weight
            
            category_scores[category] = score
        
        # Return category with highest score, or 'General' if no matches
        if max(category_scores.values()) > 0:
            return max(category_scores.items(), key=lambda x: x[1])[0]
        else:
            return 'General'
    
    def process_news_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process and categorize news articles"""
        
        categorized_articles = []
        
        for article in articles:
            categorized_article = {
                'headline': article.get('title', ''),
                'url': article.get('url', ''),
                'date': article.get('published', ''),
                'category': self.categorize_headline(
                    article.get('title', ''),
                    article.get('summary', '')
                ),
                'summary': article.get('summary', ''),
                'source': article.get('source', '')
            }
            categorized_articles.append(categorized_article)
        
        return categorized_articles

class BehavioralAnalysisProcessor:
    """Generate behavioral analysis data for charts and visualizations"""
    
    def __init__(self):
        # Mapping of age groups to key motivational factors
        self.age_group_motivations = {
            '18-24': {
                'Social Recognition': 85,
                'Authenticity': 90,
                'Innovation': 80,
                'Affordability': 75,
                'Convenience': 70
            },
            '25-34': {
                'Efficiency': 85,
                'Career Growth': 90,
                'Quality': 80,
                'Innovation': 75,
                'Work-Life Balance': 85
            },
            '35-44': {
                'Reliability': 90,
                'Family Security': 85,
                'Quality': 88,
                'Time Saving': 80,
                'Value for Money': 75
            },
            '45-54': {
                'Expertise': 85,
                'Premium Quality': 90,
                'Reliability': 88,
                'Status': 70,
                'Tradition': 75
            },
            '55+': {
                'Trust': 95,
                'Simplicity': 85,
                'Personal Service': 90,
                'Heritage': 80,
                'Security': 85
            }
        }
        
        # Interest-based motivation modifiers
        self.interest_modifiers = {
            'technology': {'Innovation': +10, 'Efficiency': +8},
            'fitness': {'Health': +15, 'Performance': +10},
            'sustainability': {'Social Responsibility': +12, 'Long-term Value': +8},
            'art': {'Creativity': +15, 'Uniqueness': +10},
            'business': {'Success': +10, 'Networking': +8},
            'travel': {'Adventure': +12, 'Experience': +10},
            'music': {'Expression': +10, 'Community': +8},
            'fashion': {'Style': +15, 'Trend Awareness': +10}
        }
    
    def generate_behavioral_chart_data(self, age_range: str, interests: List[str], location: str = None) -> List[Dict[str, Any]]:
        """Generate behavioral analysis chart data"""
        
        # Get base motivations for age group
        base_motivations = self.age_group_motivations.get(age_range, self.age_group_motivations['25-34']).copy()
        
        # Apply interest-based modifiers
        for interest in interests:
            interest_lower = interest.lower()
            for interest_key, modifiers in self.interest_modifiers.items():
                if interest_key in interest_lower or interest_lower in interest_key:
                    for motivation, modifier in modifiers.items():
                        if motivation in base_motivations:
                            base_motivations[motivation] = min(100, base_motivations[motivation] + modifier)
                        else:
                            base_motivations[motivation] = min(100, 60 + modifier)
        
        # Geographic location modifiers
        if location:
            location_lower = location.lower()
            if 'new york' in location_lower or 'nyc' in location_lower:
                base_motivations['Efficiency'] = min(100, base_motivations.get('Efficiency', 70) + 10)
                base_motivations['Status'] = min(100, base_motivations.get('Status', 60) + 8)
            elif 'california' in location_lower or 'san francisco' in location_lower:
                base_motivations['Innovation'] = min(100, base_motivations.get('Innovation', 70) + 12)
                base_motivations['Social Responsibility'] = min(100, base_motivations.get('Social Responsibility', 60) + 10)
            elif 'london' in location_lower or 'uk' in location_lower:
                base_motivations['Quality'] = min(100, base_motivations.get('Quality', 70) + 8)
                base_motivations['Heritage'] = min(100, base_motivations.get('Heritage', 60) + 10)
        
        # Convert to chart format and sort by value
        chart_data = [
            {"label": motivation, "value": value}
            for motivation, value in base_motivations.items()
        ]
        
        # Sort by value (highest first) and take top 6 for readability
        chart_data.sort(key=lambda x: x['value'], reverse=True)
        
        return chart_data[:6]
    
    def generate_demographic_breakdown(self, age_range: str, location: str, interests: List[str]) -> Dict[str, Any]:
        """Generate demographic breakdown data"""
        
        # Age group distribution
        age_groups = {
            '18-24': {'label': 'Gen Z', 'percentage': 0},
            '25-34': {'label': 'Millennials', 'percentage': 0},
            '35-44': {'label': 'Gen X Early', 'percentage': 0},
            '45-54': {'label': 'Gen X Late', 'percentage': 0},
            '55+': {'label': 'Boomers+', 'percentage': 0}
        }
        
        # Set primary age group to 70-80%, others get smaller percentages
        primary_percentage = random.randint(75, 85)
        age_groups[age_range]['percentage'] = primary_percentage
        
        # Distribute remaining percentage among adjacent age groups
        remaining = 100 - primary_percentage
        adjacent_groups = []
        
        age_order = ['18-24', '25-34', '35-44', '45-54', '55+']
        current_index = age_order.index(age_range)
        
        if current_index > 0:
            adjacent_groups.append(age_order[current_index - 1])
        if current_index < len(age_order) - 1:
            adjacent_groups.append(age_order[current_index + 1])
        
        for group in adjacent_groups:
            age_groups[group]['percentage'] = remaining // len(adjacent_groups)
        
        return {
            'age_distribution': list(age_groups.values()),
            'primary_location': location,
            'top_interests': interests[:4],  # Top 4 interests
            'market_size_estimate': random.randint(10000, 500000)  # Mock market size
        }

class RSSNewsService:
    """RSS feed news aggregation service for recent, real news"""
    
    def __init__(self):
        self.categorization_service = NewsCategorizationService()
        
        # Reliable RSS feeds for different categories
        self.rss_feeds = {
            "technology": [
                "https://feeds.feedburner.com/oreilly/radar",
                "https://www.wired.com/feed/rss",
                "https://techcrunch.com/feed/",
                "https://feeds.arstechnica.com/arstechnica/index"
            ],
            "business": [
                "https://feeds.bloomberg.com/markets/news.rss",
                "https://www.reuters.com/markets/feed/",
                "https://feeds.fortune.com/fortune/headlines"
            ],
            "marketing": [
                "https://feeds.feedburner.com/MarketingLand",
                "https://www.marketingdive.com/feeds/news/",
                "https://feeds.adweek.com/adweek/adweek-news-feed"
            ],
            "general": [
                "https://feeds.reuters.com/reuters/topNews",
                "https://feeds.bbci.co.uk/news/rss.xml",
                "https://feeds.npr.org/1001/rss.xml"
            ]
        }
        
        # Fallback news data for when RSS feeds are unavailable
        self.fallback_news = [
            {
                "title": "AI Revolutionizes Marketing Personalization in 2024",
                "summary": "Latest AI technologies are enabling unprecedented levels of marketing personalization, with companies reporting 40% improvement in engagement rates.",
                "url": "https://example.com/ai-marketing-2024",
                "published": datetime.now().strftime("%Y-%m-%d"),
                "source": "Marketing Technology Today",
                "category": "Technology"
            },
            {
                "title": "Consumer Behavior Shifts Drive New Marketing Strategies",
                "summary": "Recent studies show significant changes in consumer preferences, leading brands to adopt more authentic and value-driven messaging approaches.",
                "url": "https://example.com/consumer-behavior-2024",
                "published": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "source": "Business Insights Weekly",
                "category": "Business"
            },
            {
                "title": "Social Media Trends Reshape Digital Advertising",
                "summary": "Platform algorithm changes and user behavior evolution are forcing advertisers to rethink their social media strategies for better ROI.",
                "url": "https://example.com/social-media-trends-2024", 
                "published": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                "source": "Digital Marketing Review",
                "category": "Culture"
            },
            {
                "title": "Sustainability Marketing Gains Momentum Across Industries",
                "summary": "Companies worldwide are integrating sustainability messaging into their marketing campaigns, responding to growing consumer environmental consciousness.", 
                "url": "https://example.com/sustainability-marketing-2024",
                "published": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "source": "Sustainable Business News",
                "category": "General"
            },
            {
                "title": "E-commerce Personalization Drives 25% Revenue Increase",
                "summary": "New research reveals that advanced personalization techniques in e-commerce are delivering significant revenue improvements for online retailers.",
                "url": "https://example.com/ecommerce-personalization-2024",
                "published": datetime.now().strftime("%Y-%m-%d"),
                "source": "Retail Technology News",
                "category": "Business"
            }
        ]

class NewsSearchService:
    """News search service with RSS and mock support"""
    
    def __init__(self):
        self.rss_service = RSSNewsService()
        self.mock_news_data = {
            "technology": [
                {
                    "title": "AI Revolution Transforms Marketing Landscape in 2024",
                    "summary": "Artificial intelligence tools are reshaping how brands connect with consumers, offering unprecedented personalization capabilities.",
                    "url": "https://example.com/ai-marketing-2024",
                    "published": "2024-01-15",
                    "source": "TechMarketing Today"
                },
                {
                    "title": "Social Media Trends Drive Consumer Engagement",
                    "summary": "Latest social media algorithms favor authentic, user-generated content over traditional advertising approaches.",
                    "url": "https://example.com/social-trends",
                    "published": "2024-01-14",
                    "source": "Digital Marketing Weekly"
                }
            ],
            "retail": [
                {
                    "title": "Holiday Shopping Patterns Shift Toward Sustainable Brands",
                    "summary": "Consumers increasingly choose brands with strong environmental commitments, impacting retail strategies nationwide.",
                    "url": "https://example.com/sustainable-retail",
                    "published": "2024-01-16",
                    "source": "Retail Insights"
                }
            ],
            "general": [
                {
                    "title": "Economic Trends Shape Consumer Spending Habits",
                    "summary": "Recent economic indicators suggest shifts in consumer priorities toward value-driven purchases and experiences.",
                    "url": "https://example.com/economic-trends",
                    "published": "2024-01-17",
                    "source": "Market Analysis Today"
                }
            ]
        }
    
    async def search_recent_news(self, location: str, interests: List[str], age_range: str) -> Dict[str, Any]:
        """Search for recent news relevant to persona and location using RSS feeds"""
        
        # Always use RSS feeds for recent, real news
        return await self._rss_news_search(location, interests, age_range)
    
    async def _rss_news_search(self, location: str, interests: List[str], age_range: str) -> Dict[str, Any]:
        """RSS-based news search for recent, real articles"""
        try:
            # Fetch recent articles from RSS feeds
            recent_articles = await self._fetch_rss_articles(interests)
            
            if not recent_articles:
                # Use fallback news if RSS feeds fail
                recent_articles = self.rss_service.fallback_news
                logger.warning("RSS feeds unavailable, using fallback news")
            
            # Categorize articles
            categorized_news = self.rss_service.categorization_service.process_news_articles(recent_articles[:8])
            
            # Generate actionable insights
            insights = self._generate_marketing_insights(recent_articles, location, interests, age_range)
            
            return {
                "news_results": categorized_news,
                "insights": insights
            }
            
        except Exception as e:
            logger.error(f"RSS news search failed: {e}")
            return await self._mock_news_search(location, interests, age_range)
    
    async def _fetch_rss_articles(self, interests: List[str]) -> List[Dict[str, Any]]:
        """Fetch recent articles from RSS feeds based on interests"""
        
        articles = []
        
        try:
            # Determine which RSS feeds to use based on interests
            relevant_feeds = []
            
            for interest in interests:
                interest_lower = interest.lower()
                if any(tech_term in interest_lower for tech_term in ['tech', 'ai', 'digital', 'software', 'innovation']):
                    relevant_feeds.extend(self.rss_service.rss_feeds["technology"])
                elif any(biz_term in interest_lower for biz_term in ['business', 'marketing', 'finance', 'entrepreneur']):
                    relevant_feeds.extend(self.rss_service.rss_feeds["business"])
                    relevant_feeds.extend(self.rss_service.rss_feeds["marketing"])
            
            # If no specific interests match, use general feeds
            if not relevant_feeds:
                relevant_feeds = self.rss_service.rss_feeds["general"]
            
            # Remove duplicates and limit to 3 feeds for performance
            relevant_feeds = list(set(relevant_feeds))[:3]
            
            # Fetch articles from each feed
            for feed_url in relevant_feeds:
                try:
                    # Parse RSS feed
                    feed = feedparser.parse(feed_url)
                    
                    # Extract recent articles (last 2 weeks)
                    cutoff_date = datetime.now() - timedelta(days=14)
                    
                    for entry in feed.entries[:5]:  # Top 5 from each feed
                        # Parse publication date
                        pub_date = datetime.now()
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            try:
                                pub_date = datetime(*entry.published_parsed[:6])
                            except (TypeError, ValueError):
                                pass
                        
                        # Only include recent articles
                        if pub_date >= cutoff_date:
                            article = {
                                "title": entry.get('title', 'No Title'),
                                "summary": entry.get('summary', entry.get('description', 'No summary available'))[:200],
                                "url": entry.get('link', ''),
                                "published": pub_date.strftime("%Y-%m-%d"),
                                "source": feed.feed.get('title', 'Unknown Source')[:30]
                            }
                            articles.append(article)
                    
                except Exception as feed_error:
                    logger.warning(f"Failed to parse RSS feed {feed_url}: {feed_error}")
                    continue
            
            # Sort by publication date (newest first)
            articles.sort(key=lambda x: x['published'], reverse=True)
            
            # Return top 8 most recent articles
            return articles[:8]
            
        except Exception as e:
            logger.error(f"Error fetching RSS articles: {e}")
            return []
    
    async def _mock_news_search(self, location: str, interests: List[str], age_range: str) -> Dict[str, Any]:
        """Mock news search with realistic data"""
        
        # Select relevant news based on interests
        relevant_news = []
        for interest in interests:
            if interest.lower() in self.mock_news_data:
                relevant_news.extend(self.mock_news_data[interest.lower()])
            else:
                relevant_news.extend(self.mock_news_data["general"])
        
        if not relevant_news:
            relevant_news = self.mock_news_data["general"]
        
        # Categorize news articles
        categorized_news = self.categorization_service.process_news_articles(relevant_news[:5])
        
        # Generate actionable insights
        insights = self._generate_marketing_insights(relevant_news, location, interests, age_range)
        
        return {
            "news_results": categorized_news,  # Now includes categorization
            "insights": insights
        }
    
    def _generate_marketing_insights(self, news_data: List[Dict], location: str, interests: List[str], age_range: str) -> Dict[str, Any]:
        """Generate actionable marketing insights from news data"""
        
        # Analyze news themes
        themes = []
        for article in news_data:
            title_words = article["title"].lower().split()
            if any(word in ["ai", "technology", "digital"] for word in title_words):
                themes.append("technology_adoption")
            if any(word in ["sustainable", "environment", "green"] for word in title_words):
                themes.append("sustainability_focus")
            if any(word in ["social", "community", "engagement"] for word in title_words):
                themes.append("social_engagement")
        
        primary_theme = max(set(themes), key=themes.count) if themes else "general_trends"
        
        insight_templates = {
            "technology_adoption": {
                "summary": "Current tech trends show increased adoption of AI and automation tools",
                "recommendations": [
                    "Highlight innovative features and smart capabilities in your messaging",
                    "Position your product as cutting-edge and future-ready",
                    "Use data-driven language to appeal to tech-savvy consumers",
                    "Emphasize efficiency and automation benefits"
                ]
            },
            "sustainability_focus": {
                "summary": "Environmental consciousness is driving consumer decision-making",
                "recommendations": [
                    "Emphasize eco-friendly practices and sustainable materials",
                    "Highlight long-term value and environmental impact",
                    "Partner with environmental causes for brand alignment",
                    "Use green messaging and earth-toned visual elements"
                ]
            },
            "social_engagement": {
                "summary": "Social proof and community engagement are key influence factors",
                "recommendations": [
                    "Leverage user-generated content and testimonials",
                    "Create community-driven marketing campaigns",
                    "Encourage social sharing with interactive elements",
                    "Build authentic brand relationships through storytelling"
                ]
            },
            "general_trends": {
                "summary": "Market trends indicate focus on value and authentic experiences",
                "recommendations": [
                    "Emphasize clear value proposition and ROI",
                    "Use authentic storytelling and real customer experiences",
                    "Focus on practical benefits and problem-solving",
                    "Build trust through transparency and social proof"
                ]
            }
        }
        
        selected_insights = insight_templates[primary_theme]
        
        return {
            "summary": selected_insights["summary"],
            "actionable_recommendations": selected_insights["recommendations"],
            "trending_topics": list(set(themes)),
            "campaign_timing": "Optimal timing: Current market conditions favor immediate campaign launch",
            "target_channels": self._recommend_channels(age_range, interests)
        }
    
    def _recommend_channels(self, age_range: str, interests: List[str]) -> List[str]:
        """Recommend marketing channels based on persona"""
        channels = []
        
        if age_range in ["18-24", "25-34"]:
            channels.extend(["Instagram", "TikTok", "LinkedIn"])
        elif age_range in ["35-44", "45-54"]:
            channels.extend(["LinkedIn", "Facebook", "Email"])
        else:
            channels.extend(["Facebook", "Email", "Traditional Media"])
        
        if any(interest.lower() in ["technology", "gaming", "digital"] for interest in interests):
            channels.append("YouTube")
        
        return list(set(channels))

class ImageGenerationService:
    """AI image generation service with mock and real API support"""
    
    def __init__(self):
        # Pre-generated base64 placeholder image (1x1 pixel transparent PNG)
        self.placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    async def generate_persona_image(self, age_range: str, location: str, interests: List[str], trending_keywords: List[str]) -> str:
        """Generate persona image with real or mock implementation"""
        
        if api_config.use_real_apis and api_config.emergent_llm_key:
            return await self._real_image_generation(age_range, location, interests, trending_keywords)
        else:
            return await self._mock_image_generation(age_range, location, interests)
    
    async def _real_image_generation(self, age_range: str, location: str, interests: List[str], trending_keywords: List[str]) -> str:
        """Real image generation using Emergent LLM integration with DALL-E 3"""
        try:
            from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
            
            # Create detailed prompt for persona image
            prompt = self._create_enhanced_image_prompt(age_range, location, interests, trending_keywords)
            
            logger.info(f"Generating persona image with prompt: {prompt[:100]}...")
            
            image_gen = OpenAIImageGeneration(api_key=api_config.emergent_llm_key)
            
            # Generate with DALL-E 3 parameters
            result = await image_gen.generate_images(
                prompt=prompt,
                model="dall-e-3",
                size="1024x1024",
                quality="standard",
                style="vivid",
                n=1
            )
            
            if result and hasattr(result, 'data') and len(result.data) > 0:
                # Get the URL from the response
                image_url = result.data[0].url if hasattr(result.data[0], 'url') else None
                
                if image_url:
                    logger.info("Successfully generated persona image")
                    return image_url
                else:
                    logger.warning("Image generation succeeded but no URL returned")
                    return await self._create_persona_fallback_image(age_range, location, interests)
            else:
                logger.warning("Image generation returned empty result")
                return await self._create_persona_fallback_image(age_range, location, interests)
                
        except Exception as e:
            logger.error(f"Real image generation failed: {e}")
            return await self._create_persona_fallback_image(age_range, location, interests)
    
    async def _mock_image_generation(self, age_range: str, location: str, interests: List[str]) -> str:
        """Mock image generation with placeholder"""
        # Return a data URL with placeholder image
        return f"data:image/png;base64,{self.placeholder_image}"
    
    def _create_enhanced_image_prompt(self, age_range: str, location: str, interests: List[str], trending_keywords: List[str]) -> str:
        """Create detailed, professional prompt for DALL-E 3 persona generation"""
        
        age_descriptors = {
            "18-24": "young adult aged 20-22, energetic and modern, Gen Z aesthetic",
            "25-34": "professional in late twenties, confident and contemporary, millennial style",
            "35-44": "established professional in mid-thirties, polished and mature appearance",
            "45-54": "experienced professional, sophisticated and refined, business executive style", 
            "55+": "distinguished mature professional, classic and authoritative presence"
        }
        
        location_styles = {
            "new york": "urban professional with metropolitan sophistication",
            "san francisco": "tech-forward professional with innovative style",
            "california": "relaxed professional with modern West Coast aesthetic",
            "london": "refined European professional with classic elegance",
            "texas": "confident American professional with approachable demeanor",
            "chicago": "midwest professional with practical, grounded appearance"
        }
        
        interest_styling = {
            "technology": "wearing modern, minimalist clothing suggesting tech-savvy personality",
            "business": "in sharp business attire suggesting leadership and success",
            "fitness": "with a healthy, energetic appearance suggesting active lifestyle",
            "art": "with creative, stylish elements suggesting artistic sensibility",
            "fashion": "impeccably styled with attention to fashion details",
            "travel": "with a worldly, sophisticated appearance",
            "sustainability": "with natural, conscious styling choices"
        }
        
        # Build comprehensive description
        age_desc = age_descriptors.get(age_range, age_descriptors["25-34"])
        
        location_key = next((key for key in location_styles.keys() if key.lower() in location.lower()), "general")
        location_style = location_styles.get(location_key, "professional with approachable demeanor")
        
        # Get styling cues from interests
        styling_elements = []
        for interest in interests[:2]:  # Use top 2 interests
            interest_lower = interest.lower()
            for key, style in interest_styling.items():
                if key in interest_lower:
                    styling_elements.append(style)
                    break
        
        styling_desc = styling_elements[0] if styling_elements else "in professional business casual attire"
        
        prompt = f"""
        Professional marketing persona photograph: A {age_desc}, {location_style}, {styling_desc}.
        
        The person has a warm, approachable smile and confident posture. Shot with professional studio lighting against a clean, modern background with subtle depth of field. The image should be suitable for a marketing campaign targeting their demographic.
        
        Style: Professional headshot photography, high resolution, realistic, business-appropriate, diverse and inclusive representation. Natural expression conveying trust and competence.
        
        Technical: Shot with 85mm lens, soft studio lighting, neutral background, professional retouching quality.
        """
        
        return prompt.strip()
    
    async def _create_persona_fallback_image(self, age_range: str, location: str, interests: List[str]) -> str:
        """Create professional fallback persona image using CSS/SVG"""
        
        # Create a professional placeholder with persona details
        age_display = f"{age_range} years"
        interests_display = ", ".join(interests[:3]) if interests else "General interests"
        
        # Generate SVG placeholder with professional styling
        svg_content = f"""
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea"/>
                    <stop offset="100%" style="stop-color:#764ba2"/>
                </linearGradient>
            </defs>
            <rect width="400" height="400" fill="url(#bg)"/>
            <circle cx="200" cy="160" r="60" fill="#ffffff" opacity="0.9"/>
            <circle cx="200" cy="160" r="45" fill="#4338ca"/>
            <text x="200" y="170" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">P</text>
            
            <rect x="50" y="260" width="300" height="100" rx="10" fill="#ffffff" opacity="0.95"/>
            <text x="200" y="285" text-anchor="middle" fill="#1f2937" font-family="Arial, sans-serif" font-size="18" font-weight="bold">Marketing Persona</text>
            <text x="200" y="305" text-anchor="middle" fill="#4b5563" font-family="Arial, sans-serif" font-size="14">{age_display} • {location}</text>
            <text x="200" y="325" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="12">{interests_display}</text>
            <text x="200" y="345" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="10">Professional Marketing Persona</text>
        </svg>
        """
        
        # Convert SVG to base64 data URL
        svg_base64 = base64.b64encode(svg_content.encode('utf-8')).decode('utf-8')
        return f"data:image/svg+xml;base64,{svg_base64}"

class AdCopyGenerator:
    """AI-powered professional ad copy generation service"""
    
    def __init__(self):
        self.platform_templates = {
            "instagram": {
                "style": "visual, trendy, hashtag-friendly",
                "tone": "casual, engaging, visual-focused",
                "cta_options": ["Shop Now", "Learn More", "Discover", "Get Started", "Explore"]
            },
            "linkedin": {
                "style": "professional, results-oriented, business-focused", 
                "tone": "authoritative, professional, value-driven",
                "cta_options": ["Learn More", "Get Started", "Request Demo", "Contact Sales", "Download Now"]
            },
            "tiktok": {
                "style": "trendy, informal, entertainment-focused",
                "tone": "playful, energetic, trend-aware",
                "cta_options": ["Try Now", "Check It Out", "Get Started", "Join Us", "Discover More"]
            }
        }
        
        # Professional ad copy templates
        self.headline_templates = {
            "instagram": [
                "Transform Your {interest} Game with {keyword}",
                "The {keyword} Solution {demographic} Love",
                "Discover Why {location} Chooses {keyword}",
                "{keyword} Made Simple for {demographic}"
            ],
            "linkedin": [
                "Drive Results with {keyword} Solutions",
                "Why {demographic} Trust Our {keyword} Expertise",
                "Proven {keyword} Strategies for {demographic}",
                "Unlock {keyword} Success for Your Business"
            ],
            "tiktok": [
                "POV: You Found the Best {keyword} Ever",
                "This {keyword} Trick Changes Everything",
                "{demographic} Are Obsessed with This {keyword}",
                "The {keyword} Everyone's Talking About"
            ]
        }
        
        # Color psychology database
        self.color_psychology = {
            "trust": {"colors": ["#2563EB", "#1E40AF", "#3B82F6"], "psychology": "Blue evokes trust, reliability, and professionalism - perfect for building consumer confidence."},
            "energy": {"colors": ["#DC2626", "#EF4444", "#F97316"], "psychology": "Red and orange create urgency and excitement, driving immediate action and engagement."},
            "growth": {"colors": ["#16A34A", "#22C55E", "#15803D"], "psychology": "Green represents growth, prosperity, and harmony - ideal for success-oriented messaging."},
            "luxury": {"colors": ["#7C3AED", "#A855F7", "#1F2937"], "psychology": "Purple and dark tones convey luxury, sophistication, and premium quality."},
            "innovation": {"colors": ["#06B6D4", "#0EA5E9", "#8B5CF6"], "psychology": "Cyan and purple suggest innovation, creativity, and forward-thinking technology."},
            "warmth": {"colors": ["#F59E0B", "#FBBF24", "#F97316"], "psychology": "Warm oranges and yellows create friendly, approachable feelings and positive associations."}
        }
    
    async def generate_professional_ad_copy(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str], location: str) -> Dict[str, Any]:
        """Generate complete, professional ad copy ready for deployment"""
        
        if api_config.use_real_apis and api_config.emergent_llm_key:
            return await self._real_professional_ad_generation(persona_analysis, news_insights, age_range, interests, location)
        else:
            return await self._mock_professional_ad_generation(persona_analysis, news_insights, age_range, interests, location)
    
    async def _real_professional_ad_generation(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str], location: str) -> Dict[str, Any]:
        """Real professional ad copy generation using Emergent LLM"""
        try:
            from emergentintegrations.llm.openai.text_generation import OpenAITextGeneration
            
            # Initialize LLM
            text_gen = OpenAITextGeneration(api_key=api_config.emergent_llm_key)
            
            # Get keywords and context
            keywords = persona_analysis.get("trending_keywords_analysis", {}).get("keywords", [])
            primary_keywords = keywords[:5] if keywords else ["innovative", "quality"]
            
            # Create comprehensive prompts for each platform
            results = {}
            
            for platform in ["instagram", "linkedin", "tiktok"]:
                prompt = self._create_professional_ad_prompt(
                    platform, age_range, location, interests, primary_keywords, 
                    persona_analysis, news_insights
                )
                
                # Generate with LLM
                response = await text_gen.generate_text(
                    prompt=prompt,
                    model="gpt-5",
                    max_tokens=300,
                    temperature=0.7
                )
                
                # Parse structured response
                results[platform] = self._parse_ad_copy_response(response, platform, primary_keywords)
            
            return results
            
        except Exception as e:
            logger.error(f"Real professional ad generation failed: {e}")
            return await self._mock_professional_ad_generation(persona_analysis, news_insights, age_range, interests, location)
    
    def _create_professional_ad_prompt(self, platform: str, age_range: str, location: str, interests: List[str], keywords: List[str], persona_analysis: Dict, news_insights: Dict) -> str:
        """Create comprehensive prompt for professional ad copy generation"""
        
        platform_info = self.platform_templates[platform]
        interests_str = ", ".join(interests[:3])
        keywords_str = ", ".join(keywords[:5])
        
        prompt = f"""
        You are a Senior Ad Copywriter with 15+ years of experience creating high-converting {platform.title()} ads. 
        
        Create a complete, deployment-ready ad copy for:
        - Target: {age_range} year-olds in {location}  
        - Interests: {interests_str}
        - Platform: {platform.title()} ({platform_info['tone']})
        - Keywords to incorporate: {keywords_str}
        
        REQUIREMENTS - Return structured response with these exact sections:
        
        HEADLINE: [Create a catchy, attention-grabbing title that incorporates main keyword]
        
        BODY: [Write a compelling 2-3 sentence paragraph that speaks directly to the target audience's pain points and desires]
        
        KEYWORDS: [Naturally integrate 3-4 trending keywords from the list into the copy]
        
        CTA: [Provide a clear, action-oriented call-to-action appropriate for {platform}]
        
        COLOR_PALETTE: [Recommend 3-4 hex color codes with brief psychology explanation]
        
        Platform Style: {platform_info['style']}
        Tone: {platform_info['tone']}
        
        Make it professional, persuasive, and ready for immediate deployment.
        """
        
        return prompt.strip()
    
    def _parse_ad_copy_response(self, response: str, platform: str, keywords: List[str]) -> Dict[str, Any]:
        """Parse LLM response into structured ad copy format"""
        
        try:
            # Extract sections from response
            sections = {}
            current_section = None
            current_content = []
            
            for line in response.split('\n'):
                line = line.strip()
                if line.startswith('HEADLINE:'):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = 'headline'
                    current_content = [line.replace('HEADLINE:', '').strip()]
                elif line.startswith('BODY:'):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = 'body'
                    current_content = [line.replace('BODY:', '').strip()]
                elif line.startswith('KEYWORDS:'):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = 'keywords'
                    current_content = [line.replace('KEYWORDS:', '').strip()]
                elif line.startswith('CTA:'):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = 'cta'
                    current_content = [line.replace('CTA:', '').strip()]
                elif line.startswith('COLOR_PALETTE:'):
                    if current_section:
                        sections[current_section] = '\n'.join(current_content).strip()
                    current_section = 'color_palette'
                    current_content = [line.replace('COLOR_PALETTE:', '').strip()]
                elif line and current_section:
                    current_content.append(line)
            
            # Add the last section
            if current_section and current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            
            return {
                "headline": sections.get('headline', 'Transform Your Experience'),
                "body": sections.get('body', 'Discover solutions designed for your needs.'),
                "keywords": sections.get('keywords', ', '.join(keywords[:3])),
                "cta": sections.get('cta', self.platform_templates[platform]['cta_options'][0]),
                "color_palette": sections.get('color_palette', 'Professional blues and whites for trust and clarity')
            }
            
        except Exception as e:
            logger.error(f"Error parsing ad copy response: {e}")
            return self._create_fallback_ad_copy(platform, keywords)
    
    def _create_fallback_ad_copy(self, platform: str, keywords: List[str]) -> Dict[str, Any]:
        """Create fallback professional ad copy"""
        
        primary_keyword = keywords[0] if keywords else "innovative"
        platform_info = self.platform_templates[platform]
        
        return {
            "headline": f"Transform Your Business with {primary_keyword.title()} Solutions",
            "body": f"Join thousands who've discovered the power of {primary_keyword} technology. Our proven approach delivers results you can measure, with support every step of the way.",
            "keywords": ", ".join(keywords[:4]) if keywords else "innovative, reliable, proven, effective",
            "cta": platform_info['cta_options'][0],
            "color_palette": "#2563EB, #1E40AF, #F8FAFC - Professional blues build trust while clean whites ensure readability and modern appeal"
        }
    
    async def _mock_professional_ad_generation(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str], location: str) -> Dict[str, Any]:
        """Mock professional ad copy generation with complete structure"""
        
        # Extract key elements
        keywords = persona_analysis.get("trending_keywords_analysis", {}).get("keywords", ["innovative", "quality", "efficient"])
        primary_keyword = keywords[0] if keywords else "innovative"
        primary_interest = interests[0] if interests else "technology"
        
        # Select appropriate color psychology based on interests and demographics
        color_theme = "trust"
        if any(interest.lower() in ["fitness", "health", "wellness"] for interest in interests):
            color_theme = "energy"
        elif any(interest.lower() in ["luxury", "premium", "exclusive"] for interest in interests):
            color_theme = "luxury"
        elif any(interest.lower() in ["tech", "innovation", "startup"] for interest in interests):
            color_theme = "innovation"
        elif age_range in ["18-24", "25-34"]:
            color_theme = "energy"
        
        color_info = self.color_psychology[color_theme]
        
        # Generate platform-specific professional ad copy
        results = {}
        
        # Instagram Ad Copy
        results["instagram"] = {
            "headline": f"Transform Your {primary_interest.title()} Journey with {primary_keyword.title()} Solutions",
            "body": f"Ready to join the {location} community that's already discovered the power of {primary_keyword} {primary_interest}? Our proven approach helps {age_range}-year-olds achieve results faster than ever. See why thousands trust us with their success.",
            "keywords": f"{primary_keyword}, {primary_interest}, proven, {age_range}, results",
            "cta": "Shop Now",
            "color_palette": f"{color_info['colors'][0]}, {color_info['colors'][1]}, #FFFFFF - {color_info['psychology']}"
        }
        
        # LinkedIn Ad Copy  
        results["linkedin"] = {
            "headline": f"Drive {primary_interest.title()} Results with {primary_keyword.title()} Strategies",
            "body": f"Industry leaders in {location} trust our {primary_keyword} solutions to deliver measurable ROI. Join {age_range}-year-old professionals who've transformed their {primary_interest} approach and achieved breakthrough results with our proven methodology.",
            "keywords": f"ROI, {primary_keyword}, professional, proven, industry-leading",
            "cta": "Request Demo",
            "color_palette": f"{color_info['colors'][0]}, {color_info['colors'][2]}, #F8FAFC - {color_info['psychology']}"
        }
        
        # TikTok Ad Copy
        results["tiktok"] = {
            "headline": f"POV: You Found the Most {primary_keyword.title()} {primary_interest.title()} Solution Ever",
            "body": f"This {primary_keyword} {primary_interest} trick is changing everything for {age_range}-year-olds in {location}! ✨ Watch thousands of people transform their results with this game-changing approach. Your future self will thank you! 🔥",
            "keywords": f"game-changer, {primary_keyword}, trending, viral, results",
            "cta": "Try Now",
            "color_palette": f"{color_info['colors'][1]}, {color_info['colors'][0]}, #FF6B6B - {color_info['psychology']}"
        }
        
        return results

class MarketingIntelligenceCore:
    """Main marketing intelligence orchestrator"""
    
    def __init__(self):
        self.persona_analyzer = PersonaAnalyzer()
        self.news_service = NewsSearchService()
        self.image_service = ImageGenerationService()
        self.ad_generator = AdCopyGenerator()
        self.word_cloud_processor = WordCloudProcessor()
        self.behavioral_processor = BehavioralAnalysisProcessor()
    
    async def generate_complete_intelligence(self, age_range: str, geographic_location: str, interests: List[str]) -> Dict[str, Any]:
        """Generate complete marketing intelligence report"""
        
        try:
            # Step 1: Persona Research and Analysis
            persona_analysis = self.persona_analyzer.analyze_persona(age_range, geographic_location, interests)
            
            # Step 2: News Feed & Insights
            news_data = await self.news_service.search_recent_news(geographic_location, interests, age_range)
            
            # Step 3: Visual Persona Sketch
            trending_keywords = persona_analysis["trending_keywords_analysis"]["keywords"]
            persona_image_url = await self.image_service.generate_persona_image(
                age_range, geographic_location, interests, trending_keywords
            )
            
            # Step 4: Ad Copy Generation
            ad_copy_variations = await self.ad_generator.generate_ad_copy(
                persona_analysis, news_data, age_range, interests
            )
            
            # Step 5: Process data for advanced visualizations (Phase 3A)
            
            # Generate word cloud data
            trending_keywords = persona_analysis["trending_keywords_analysis"]["keywords"]
            word_cloud_data = self.word_cloud_processor.generate_word_cloud_data(
                trending_keywords, persona_analysis
            )
            
            # Generate behavioral analysis chart data
            behavioral_chart_data = self.behavioral_processor.generate_behavioral_chart_data(
                age_range, interests, geographic_location
            )
            
            # Generate demographic breakdown
            demographic_data = self.behavioral_processor.generate_demographic_breakdown(
                age_range, geographic_location, interests
            )
            
            # Compile complete response with new Phase 3A data
            response = {
                "trending_keywords_analysis": persona_analysis["trending_keywords_analysis"],
                "news_insights": {
                    "summary": news_data["insights"]["summary"],
                    "actionable_recommendations": news_data["insights"]["actionable_recommendations"],
                    "trending_topics": news_data["insights"]["trending_topics"],
                    "recent_articles": news_data["news_results"]  # Now includes categories
                },
                "persona_image_url": persona_image_url,
                "ad_copy_variations": ad_copy_variations,
                # Phase 3A: New visualization data
                "word_cloud_data": word_cloud_data,
                "behavioral_analysis_chart": behavioral_chart_data,
                "demographic_breakdown": demographic_data,
                "metadata": {
                    "generated_at": datetime.utcnow().isoformat(),
                    "api_mode": "real" if api_config.use_real_apis else "mock",
                    "persona_profile": {
                        "age_range": age_range,
                        "location": geographic_location,
                        "interests": interests
                    },
                    "data_version": "3A"  # Track data structure version
                }
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Marketing intelligence generation failed: {e}")
            raise Exception(f"Failed to generate marketing intelligence: {str(e)}")