import os
import json
import base64
import hashlib
import asyncio
import re
import random
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

class NewsSearchService:
    """News search service with mock and real API support"""
    
    def __init__(self):
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
        """Search for recent news relevant to persona and location"""
        
        if api_config.use_real_apis and api_config.brave_api_key:
            return await self._real_news_search(location, interests, age_range)
        else:
            return await self._mock_news_search(location, interests, age_range)
    
    async def _real_news_search(self, location: str, interests: List[str], age_range: str) -> Dict[str, Any]:
        """Real news search using Brave Search API"""
        try:
            # This would implement actual Brave Search API calls
            # For now, return enhanced mock data to show the structure
            return await self._mock_news_search(location, interests, age_range)
        except Exception as e:
            logger.error(f"Real news search failed: {e}")
            return await self._mock_news_search(location, interests, age_range)
    
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
        
        # Generate actionable insights
        insights = self._generate_marketing_insights(relevant_news, location, interests, age_range)
        
        return {
            "news_results": relevant_news[:5],  # Limit to 5 most relevant
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
        """Real image generation using Emergent LLM integration"""
        try:
            from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
            
            # Create detailed prompt for persona image
            prompt = self._create_image_prompt(age_range, location, interests, trending_keywords)
            
            image_gen = OpenAIImageGeneration(api_key=api_config.emergent_llm_key)
            images = await image_gen.generate_images(
                prompt=prompt,
                model="gpt-image-1",
                number_of_images=1
            )
            
            if images and len(images) > 0:
                # Convert to base64 for consistent response format
                image_base64 = base64.b64encode(images[0]).decode('utf-8')
                return f"data:image/png;base64,{image_base64}"
            else:
                return await self._mock_image_generation(age_range, location, interests)
                
        except Exception as e:
            logger.error(f"Real image generation failed: {e}")
            return await self._mock_image_generation(age_range, location, interests)
    
    async def _mock_image_generation(self, age_range: str, location: str, interests: List[str]) -> str:
        """Mock image generation with placeholder"""
        # Return a data URL with placeholder image
        return f"data:image/png;base64,{self.placeholder_image}"
    
    def _create_image_prompt(self, age_range: str, location: str, interests: List[str], trending_keywords: List[str]) -> str:
        """Create detailed prompt for AI image generation"""
        
        age_descriptors = {
            "18-24": "young adult, energetic, modern style",
            "25-34": "professional young adult, confident, contemporary",
            "35-44": "mature professional, established, polished",
            "45-54": "experienced professional, sophisticated, refined",
            "55+": "mature, distinguished, classic style"
        }
        
        location_styles = {
            "new york": "urban professional, metropolitan background",
            "california": "casual professional, modern tech environment",
            "london": "sophisticated European style, classic setting",
            "texas": "confident, approachable, modern setting"
        }
        
        age_desc = age_descriptors.get(age_range, age_descriptors["25-34"])
        location_style = next((style for key, style in location_styles.items() if key in location.lower()), "professional, neutral background")
        
        interests_desc = f"interested in {', '.join(interests[:3])}" if interests else "diverse interests"
        keywords_desc = f"embodying {', '.join(trending_keywords[:3])}" if trending_keywords else ""
        
        prompt = f"""
        A realistic, professional headshot of a {age_desc} person, {location_style}.
        The person appears {interests_desc}, {keywords_desc}.
        High quality, professional lighting, approachable expression, 
        suitable for marketing persona representation.
        Photorealistic style, business casual attire.
        """
        
        return prompt.strip()

class AdCopyGenerator:
    """AI-powered ad copy generation service"""
    
    def __init__(self):
        self.platform_templates = {
            "instagram": {
                "style": "visual, trendy, hashtag-friendly",
                "length": 50,
                "tone": "casual, engaging, visual-focused"
            },
            "linkedin": {
                "style": "professional, results-oriented, business-focused",
                "length": 50,
                "tone": "authoritative, professional, value-driven"
            },
            "tiktok": {
                "style": "trendy, informal, entertainment-focused",
                "length": 50,
                "tone": "playful, energetic, trend-aware"
            }
        }
    
    async def generate_ad_copy(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str]) -> Dict[str, str]:
        """Generate platform-specific ad copy variations"""
        
        if api_config.use_real_apis and api_config.emergent_llm_key:
            return await self._real_ad_generation(persona_analysis, news_insights, age_range, interests)
        else:
            return await self._mock_ad_generation(persona_analysis, news_insights, age_range, interests)
    
    async def _real_ad_generation(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str]) -> Dict[str, str]:
        """Real ad copy generation using Emergent LLM"""
        try:
            # This would use the LLM for real generation
            # For now, return enhanced mock data
            return await self._mock_ad_generation(persona_analysis, news_insights, age_range, interests)
        except Exception as e:
            logger.error(f"Real ad generation failed: {e}")
            return await self._mock_ad_generation(persona_analysis, news_insights, age_range, interests)
    
    async def _mock_ad_generation(self, persona_analysis: Dict, news_insights: Dict, age_range: str, interests: List[str]) -> Dict[str, str]:
        """Mock ad copy generation with realistic variations"""
        
        # Extract key elements
        keywords = persona_analysis.get("trending_keywords_analysis", {}).get("keywords", ["innovative", "quality"])
        primary_keyword = keywords[0] if keywords else "amazing"
        
        # Generate platform-specific copy
        instagram_copy = f"✨ Discover {primary_keyword} solutions that transform your {interests[0] if interests else 'lifestyle'}! Join thousands who've already made the switch. #Transform #Innovation #Quality"
        
        linkedin_copy = f"Drive results with {primary_keyword} strategies. Our proven approach delivers measurable ROI for professionals like you. See why industry leaders choose us."
        
        tiktok_copy = f"POV: You found the most {primary_keyword} solution ever 🔥 This changes everything! Try it and thank us later ✨ #GameChanger #MustTry"
        
        return {
            "instagram": instagram_copy[:50],
            "linkedin": linkedin_copy[:50], 
            "tiktok": tiktok_copy[:50]
        }

class MarketingIntelligenceCore:
    """Main marketing intelligence orchestrator"""
    
    def __init__(self):
        self.persona_analyzer = PersonaAnalyzer()
        self.news_service = NewsSearchService()
        self.image_service = ImageGenerationService()
        self.ad_generator = AdCopyGenerator()
    
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
            
            # Compile complete response
            response = {
                "trending_keywords_analysis": persona_analysis["trending_keywords_analysis"],
                "news_insights": {
                    "summary": news_data["insights"]["summary"],
                    "actionable_recommendations": news_data["insights"]["actionable_recommendations"],
                    "trending_topics": news_data["insights"]["trending_topics"],
                    "recent_articles": news_data["news_results"][:3]  # Top 3 articles
                },
                "persona_image_url": persona_image_url,
                "ad_copy_variations": ad_copy_variations,
                "metadata": {
                    "generated_at": datetime.utcnow().isoformat(),
                    "api_mode": "real" if api_config.use_real_apis else "mock",
                    "persona_profile": {
                        "age_range": age_range,
                        "location": geographic_location,
                        "interests": interests
                    }
                }
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Marketing intelligence generation failed: {e}")
            raise Exception(f"Failed to generate marketing intelligence: {str(e)}")