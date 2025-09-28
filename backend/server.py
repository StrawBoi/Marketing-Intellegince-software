from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import re
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Campaign Personalization Engine", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class CampaignRequest(BaseModel):
    customer_persona: str = Field(..., description="Description of the target customer persona")
    product_description: str = Field(..., description="Description of the product or service")
    geographic_location: Optional[str] = Field(None, description="Geographic location for regional targeting")
    interests: Optional[str] = Field(None, description="Specific interests and hobbies (comma-separated)")

class CampaignResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_persona: str
    product_description: str
    geographic_location: Optional[str] = None
    interests: Optional[str] = None
    generated_content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="generated")

class CampaignCreate(BaseModel):
    customer_persona: str
    product_description: str
    generated_content: str

# New models for Phase 2A - Advanced Analysis
class AnalysisRequest(BaseModel):
    persona: str = Field(..., description="Customer persona for behavioral analysis")
    product_description: str = Field(..., description="Product or service description")
    geographic_location: Optional[str] = Field(None, description="Geographic location for regional analysis")
    interests: Optional[str] = Field(None, description="Specific interests for targeted analysis")

class ColorInfo(BaseModel):
    hex_code: str = Field(..., description="Hex color code")
    color_name: str = Field(..., description="Name of the color")
    psychological_effect: str = Field(..., description="Psychological effect of the color")

class AnalysisResponse(BaseModel):
    behavior_analysis_summary: str = Field(..., description="Behavioral analysis summary")
    color_palette: List[ColorInfo] = Field(..., description="Color palette based on psychology")
    trending_words: List[str] = Field(..., description="Trending words for the persona")

# Phase 3A: Campaign History Models
class CampaignHistoryCreate(BaseModel):
    age_range: str = Field(..., description="Age range of target persona")
    geographic_location: str = Field(..., description="Geographic location")
    interests: List[str] = Field(..., description="List of interests")
    intelligence_data: Dict[str, Any] = Field(..., description="Generated intelligence data")

class CampaignHistoryResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    age_range: str
    geographic_location: str
    interests: List[str]
    intelligence_data: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    title: str = Field(..., description="Auto-generated title for the campaign")
    
class CampaignHistoryList(BaseModel):
    campaigns: List[CampaignHistoryResponse]
    total_count: int
    page: int
    limit: int


# Advanced Analysis Logic Functions
def analyze_persona_behavior(persona: str, product_description: str, geographic_location: Optional[str] = None, interests: Optional[str] = None) -> str:
    """Generate behavioral analysis based on marketing psychology"""
    
    # Extract key demographic and psychographic indicators
    persona_lower = persona.lower()
    
    # Age group analysis
    age_indicators = {
        'gen z': "Highly digital-native, values authenticity and social responsibility, prefers visual content over text, influenced by peer recommendations and social proof.",
        'millennials': "Tech-savvy but values work-life balance, prefers experiences over possessions, responsive to personalized content, values transparency and brand authenticity.",
        'gen x': "Pragmatic decision-makers, values quality and reliability, responds to direct benefits and ROI, prefers detailed information before purchasing.",
        'baby boomers': "Values traditional customer service, prefers phone/email communication, motivated by security and stability, appreciates loyalty programs.",
        'teenagers': "Highly influenced by social media trends, values peer approval, prefers mobile-first experiences, responds to gamification and instant gratification.",
        'young adults': "Career-focused, budget-conscious, values convenience and efficiency, influenced by online reviews and social proof."
    }
    
    # Professional/lifestyle analysis
    lifestyle_indicators = {
        'startup': "Risk-tolerant, values innovation and efficiency, prefers scalable solutions, motivated by growth potential and competitive advantage.",
        'small business': "Cost-conscious, values practical solutions, prefers proven results, needs easy implementation and reliable support.",
        'corporate': "Process-oriented, values compliance and security, prefers established vendors, motivated by ROI and risk mitigation.",
        'entrepreneur': "Self-motivated, values flexibility and control, prefers customizable solutions, motivated by productivity gains.",
        'freelancer': "Budget-sensitive, values time-saving tools, prefers simple interfaces, motivated by efficiency and client satisfaction.",
        'professional': "Career-focused, values reputation and results, prefers high-quality solutions, motivated by professional advancement."
    }
    
    # Technology adoption patterns
    tech_indicators = {
        'tech-savvy': "Early adopters, comfortable with complex features, values innovation and cutting-edge solutions, prefers self-service options.",
        'tech-hesitant': "Prefers simple, intuitive interfaces, values human support, needs clear instructions, motivated by proven reliability.",
        'mobile-first': "Expects seamless mobile experience, values speed and convenience, prefers app-based solutions, motivated by accessibility.",
        'digital native': "Expects instant results, values integration capabilities, prefers cloud-based solutions, motivated by efficiency gains."
    }
    
    # Build comprehensive analysis
    analysis_parts = []
    
    # Demographic analysis
    for age_group, behavior in age_indicators.items():
        if any(term in persona_lower for term in age_group.split()):
            analysis_parts.append(f"**Age Demographics**: {behavior}")
            break
    
    # Professional context analysis  
    for lifestyle, behavior in lifestyle_indicators.items():
        if lifestyle in persona_lower:
            analysis_parts.append(f"**Professional Context**: {behavior}")
            break
    
    # Technology adoption analysis
    for tech_level, behavior in tech_indicators.items():
        if tech_level.replace('-', ' ') in persona_lower or tech_level.replace('-', '') in persona_lower:
            analysis_parts.append(f"**Technology Adoption**: {behavior}")
            break
    
    # Product-specific behavioral predictions
    product_lower = product_description.lower()
    if any(term in product_lower for term in ['saas', 'software', 'app', 'platform', 'tool']):
        analysis_parts.append("**Product Engagement**: Likely to evaluate through free trials, values feature demonstrations, influenced by case studies and user testimonials, expects seamless onboarding experience.")
    elif any(term in product_lower for term in ['service', 'consulting', 'support']):
        analysis_parts.append("**Service Engagement**: Values personal relationships, influenced by credentials and testimonials, prefers consultation-based sales approach, motivated by problem-solving capabilities.")
    elif any(term in product_lower for term in ['product', 'physical', 'retail']):
        analysis_parts.append("**Product Engagement**: Influenced by reviews and ratings, values quality guarantees, prefers detailed product information, motivated by value proposition and convenience.")
    
    # Decision-making patterns
    if any(term in persona_lower for term in ['busy', 'time-constrained', 'efficient']):
        analysis_parts.append("**Decision Pattern**: Quick decision-maker when value is clear, prefers concise information, values time-saving benefits, responsive to limited-time offers.")
    elif any(term in persona_lower for term in ['careful', 'thorough', 'research']):
        analysis_parts.append("**Decision Pattern**: Thorough researcher, compares multiple options, values detailed information, influenced by expert opinions and comprehensive reviews.")
    
    # Pain points and motivations
    motivation_analysis = "**Core Motivations**: "
    if any(term in persona_lower for term in ['growth', 'scale', 'expand']):
        motivation_analysis += "Driven by growth opportunities and scalability. "
    if any(term in persona_lower for term in ['cost', 'budget', 'affordable']):
        motivation_analysis += "Cost-conscious, seeks value for money. "
    if any(term in persona_lower for term in ['quality', 'premium', 'reliable']):
        motivation_analysis += "Quality-focused, willing to pay for excellence. "
    if any(term in persona_lower for term in ['innovation', 'cutting-edge', 'latest']):
        motivation_analysis += "Innovation-driven, values newest technologies. "
    
    analysis_parts.append(motivation_analysis)
    
    # Geographic and cultural analysis
    if geographic_location:
        location_lower = geographic_location.lower()
        location_analysis = "**Geographic Insights**: "
        
        # Regional preferences
        if any(region in location_lower for region in ['uk', 'london', 'britain', 'england']):
            location_analysis += "UK market values understated confidence, quality craftsmanship, and subtle premium positioning. Prefers polite, professional tone with heritage references. "
        elif any(region in location_lower for region in ['new york', 'nyc', 'manhattan']):
            location_analysis += "NYC market values speed, efficiency, and bold innovation. Responds to direct, confident messaging with competitive advantages. Fast-paced decision making. "
        elif any(region in location_lower for region in ['california', 'san francisco', 'bay area', 'silicon valley']):
            location_analysis += "California tech market values innovation, sustainability, and forward-thinking solutions. Prefers authentic, purpose-driven messaging with social impact. "
        elif any(region in location_lower for region in ['texas', 'austin', 'dallas', 'houston']):
            location_analysis += "Texas market values practicality, value, and straightforward communication. Prefers results-focused messaging with clear ROI and no-nonsense approach. "
        elif any(region in location_lower for region in ['germany', 'berlin', 'munich']):
            location_analysis += "German market values precision, quality, and thorough documentation. Prefers detailed, fact-based messaging with engineering excellence and reliability focus. "
        elif any(region in location_lower for region in ['japan', 'tokyo', 'osaka']):
            location_analysis += "Japanese market values respect, quality, and continuous improvement. Prefers polite, service-oriented messaging with attention to detail and customer care. "
        elif any(region in location_lower for region in ['australia', 'sydney', 'melbourne']):
            location_analysis += "Australian market values authenticity, fairness, and practical solutions. Prefers friendly, direct messaging without pretension or excessive formality. "
        else:
            location_analysis += f"Local market preferences in {geographic_location} should be considered for cultural alignment and regional business practices. "
        
        analysis_parts.append(location_analysis)
    
    # Interest-based behavioral insights
    if interests:
        interests_lower = interests.lower()
        interests_analysis = "**Interest-Based Behavior**: "
        
        interest_patterns = {
            'sustainability': "Environmentally conscious, values long-term thinking, influenced by social responsibility messaging, prefers brands with clear sustainability practices.",
            'fitness': "Health-focused, goal-oriented, values performance metrics and results, responsive to achievement-based messaging and progress tracking.",
            'technology': "Early adopter, values innovation and efficiency, comfortable with technical details, influenced by cutting-edge features and future-forward messaging.",
            'travel': "Experience-focused, values freedom and flexibility, influenced by lifestyle messaging, responsive to adventure and discovery themes.",
            'cooking': "Detail-oriented, values quality ingredients and processes, appreciates craftsmanship, responsive to artisanal and premium positioning.",
            'art': "Creative and expressive, values authenticity and uniqueness, influenced by aesthetic appeal, responsive to customization and personal expression.",
            'music': "Emotionally driven, values authentic expression, influenced by brand personality and tone, responsive to community and cultural messaging.",
            'reading': "Intellectually curious, values depth and expertise, influenced by authoritative content, responsive to educational and thought leadership messaging.",
            'gaming': "Achievement-oriented, values engagement and progression, influenced by interactive experiences, responsive to gamification and competitive elements."
        }
        
        matched_interests = []
        for interest, behavior in interest_patterns.items():
            if interest in interests_lower:
                matched_interests.append(behavior)
        
        if matched_interests:
            interests_analysis += " ".join(matched_interests[:2])  # Limit to avoid too much text
        else:
            interests_analysis += "Specific interests indicate focused lifestyle choices that influence purchasing decisions and brand loyalty patterns."
        
        analysis_parts.append(interests_analysis)
    
    # Combine all analysis parts
    if analysis_parts:
        return "\n\n".join(analysis_parts)
    else:
        # Fallback generic analysis
        return """**General Analysis**: This persona likely values practical solutions that address specific needs. They respond well to clear value propositions, social proof through testimonials, and transparent communication. Decision-making is influenced by perceived benefits, ease of implementation, and alignment with personal or professional goals. They prefer authentic, straightforward messaging over overly promotional content."""

def generate_color_palette(persona: str, geographic_location: Optional[str] = None, interests: Optional[str] = None) -> List[ColorInfo]:
    """Generate color palette based on color psychology and persona characteristics"""
    
    persona_lower = persona.lower()
    colors = []
    
    # Age-based color preferences
    if any(term in persona_lower for term in ['gen z', 'teenager', 'young']):
        colors.extend([
            ColorInfo(hex_code="#FF6B6B", color_name="Coral Red", psychological_effect="Energetic and youthful, creates excitement and captures attention of younger demographics"),
            ColorInfo(hex_code="#4ECDC4", color_name="Turquoise", psychological_effect="Fresh and modern, appeals to creative and tech-savvy individuals"),
            ColorInfo(hex_code="#45B7D1", color_name="Sky Blue", psychological_effect="Trustworthy yet vibrant, balances reliability with innovation"),
            ColorInfo(hex_code="#96CEB4", color_name="Mint Green", psychological_effect="Calming and optimistic, suggests growth and positive change")
        ])
    
    elif any(term in persona_lower for term in ['millennials', 'millennial']):
        colors.extend([
            ColorInfo(hex_code="#3498DB", color_name="Professional Blue", psychological_effect="Trustworthy and competent, appeals to career-focused individuals"),
            ColorInfo(hex_code="#E74C3C", color_name="Confident Red", psychological_effect="Bold and decisive, motivates action and conveys confidence"),
            ColorInfo(hex_code="#2ECC71", color_name="Success Green", psychological_effect="Growth-oriented and sustainable, represents achievement and progress"),
            ColorInfo(hex_code="#F39C12", color_name="Optimistic Orange", psychological_effect="Enthusiastic and innovative, encourages exploration and creativity")
        ])
    
    elif any(term in persona_lower for term in ['gen x', 'professional', 'executive']):
        colors.extend([
            ColorInfo(hex_code="#2C3E50", color_name="Executive Navy", psychological_effect="Authoritative and sophisticated, conveys professionalism and stability"),
            ColorInfo(hex_code="#34495E", color_name="Steel Gray", psychological_effect="Reliable and practical, appeals to logical decision-makers"),
            ColorInfo(hex_code="#27AE60", color_name="Corporate Green", psychological_effect="Balanced and trustworthy, suggests financial success and growth"),
            ColorInfo(hex_code="#D35400", color_name="Amber", psychological_effect="Warm yet professional, encourages engagement while maintaining credibility")
        ])
    
    elif any(term in persona_lower for term in ['baby boomers', 'senior', 'mature']):
        colors.extend([
            ColorInfo(hex_code="#1B4F72", color_name="Traditional Blue", psychological_effect="Trustworthy and established, appeals to traditional values and stability"),
            ColorInfo(hex_code="#943126", color_name="Heritage Red", psychological_effect="Classic and reliable, evokes quality and time-tested value"),
            ColorInfo(hex_code="#0E6B0E", color_name="Forest Green", psychological_effect="Stable and enduring, represents security and long-term value"),
            ColorInfo(hex_code="#7D6608", color_name="Gold", psychological_effect="Premium and valuable, suggests exclusivity and worth")
        ])
    
    # Industry-specific color additions
    if any(term in persona_lower for term in ['tech', 'startup', 'innovation']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#9B59B6", color_name="Innovation Purple", psychological_effect="Creative and forward-thinking, appeals to tech innovators"))
    
    elif any(term in persona_lower for term in ['healthcare', 'medical', 'wellness']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#16A085", color_name="Medical Teal", psychological_effect="Healing and trustworthy, creates sense of care and professionalism"))
    
    elif any(term in persona_lower for term in ['finance', 'banking', 'investment']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#1565C0", color_name="Financial Blue", psychological_effect="Secure and dependable, builds confidence in financial decisions"))
    
    elif any(term in persona_lower for term in ['creative', 'design', 'art']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#FF5722", color_name="Creative Orange", psychological_effect="Inspiring and energetic, stimulates creativity and artistic expression"))
    
    # Personality-based colors
    if any(term in persona_lower for term in ['luxury', 'premium', 'high-end']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#000000", color_name="Luxury Black", psychological_effect="Sophisticated and exclusive, conveys premium quality and elegance"))
    
    elif any(term in persona_lower for term in ['eco', 'sustainable', 'green', 'environmental']):
        if len(colors) < 5:
            colors.append(ColorInfo(hex_code="#4CAF50", color_name="Earth Green", psychological_effect="Natural and sustainable, appeals to environmentally conscious consumers"))
    
    # Geographic color preferences
    if geographic_location and len(colors) < 5:
        location_lower = geographic_location.lower()
        if any(region in location_lower for region in ['uk', 'britain', 'england']):
            colors.append(ColorInfo(hex_code="#1B365D", color_name="British Navy", psychological_effect="Traditional and trustworthy, appeals to British preference for understated elegance"))
        elif any(region in location_lower for region in ['japan', 'tokyo']):
            colors.append(ColorInfo(hex_code="#C41E3A", color_name="Japanese Red", psychological_effect="Respectful yet vibrant, aligns with Japanese aesthetic preferences"))
        elif any(region in location_lower for region in ['germany', 'berlin']):
            colors.append(ColorInfo(hex_code="#000000", color_name="German Black", psychological_effect="Precise and professional, appeals to German preference for functionality"))
    
    # Interest-based color additions
    if interests and len(colors) < 5:
        interests_lower = interests.lower()
        if 'sustainability' in interests_lower or 'eco' in interests_lower:
            colors.append(ColorInfo(hex_code="#2E7D32", color_name="Eco Green", psychological_effect="Natural and responsible, appeals to environmentally conscious mindset"))
        elif 'fitness' in interests_lower or 'health' in interests_lower:
            colors.append(ColorInfo(hex_code="#FF5722", color_name="Energy Orange", psychological_effect="Energetic and motivating, appeals to fitness and health enthusiasts"))
        elif 'art' in interests_lower or 'creative' in interests_lower:
            colors.append(ColorInfo(hex_code="#9C27B0", color_name="Creative Purple", psychological_effect="Artistic and inspiring, resonates with creative personalities"))
        elif 'technology' in interests_lower or 'tech' in interests_lower:
            colors.append(ColorInfo(hex_code="#00BCD4", color_name="Tech Cyan", psychological_effect="Modern and innovative, appeals to technology enthusiasts"))
    
    # Ensure we have at least 3-4 colors, add defaults if needed
    if len(colors) < 3:
        colors.extend([
            ColorInfo(hex_code="#2196F3", color_name="Trust Blue", psychological_effect="Universal trust and reliability, safe choice for broad appeal"),
            ColorInfo(hex_code="#4CAF50", color_name="Growth Green", psychological_effect="Positive and progressive, suggests improvement and success"),
            ColorInfo(hex_code="#FF9800", color_name="Attention Orange", psychological_effect="Friendly and approachable, encourages interaction and engagement")
        ])
    
    # Return 3-5 colors maximum
    return colors[:5]

def generate_trending_words(persona: str, geographic_location: Optional[str] = None, interests: Optional[str] = None) -> List[str]:
    """Generate trending words and phrases relevant to the persona"""
    
    persona_lower = persona.lower()
    trending_words = []
    
    # Age group specific trending words
    if any(term in persona_lower for term in ['gen z', 'teenager']):
        trending_words.extend([
            "authentic", "viral", "sustainable", "inclusive", "accessible", "instant", 
            "personalized", "interactive", "gamified", "social", "visual", "mobile-native",
            "eco-friendly", "diverse", "transparent", "relatable", "engaging"
        ])
    
    elif any(term in persona_lower for term in ['millennials', 'millennial']):
        trending_words.extend([
            "experience-driven", "purpose-built", "work-life balance", "sustainable", 
            "personalized", "data-driven", "seamless", "intuitive", "collaborative",
            "flexible", "innovative", "transparent", "authentic", "efficient", "scalable"
        ])
    
    elif any(term in persona_lower for term in ['gen x', 'professional']):
        trending_words.extend([
            "results-driven", "proven", "reliable", "efficient", "streamlined", 
            "professional-grade", "enterprise-ready", "secure", "compliant", "robust",
            "time-saving", "cost-effective", "strategic", "comprehensive", "established"
        ])
    
    elif any(term in persona_lower for term in ['baby boomers', 'senior']):
        trending_words.extend([
            "trusted", "established", "reliable", "straightforward", "quality", 
            "service-oriented", "personal", "secure", "time-tested", "dependable",
            "comprehensive", "supportive", "clear", "proven", "valuable"
        ])
    
    # Tech adoption level words
    if any(term in persona_lower for term in ['tech-savvy', 'digital native']):
        trending_words.extend([
            "AI-powered", "cloud-based", "automated", "integrated", "smart", 
            "next-generation", "cutting-edge", "advanced", "intelligent", "connected"
        ])
    
    elif any(term in persona_lower for term in ['tech-hesitant']):
        trending_words.extend([
            "simple", "user-friendly", "guided", "supported", "straightforward", 
            "easy-to-use", "intuitive", "clear", "step-by-step", "helpful"
        ])
    
    # Professional context words
    if any(term in persona_lower for term in ['startup', 'entrepreneur']):
        trending_words.extend([
            "disruptive", "agile", "scalable", "lean", "growth-focused", "innovative", 
            "MVP", "rapid", "flexible", "bootstrapped", "pivot-ready", "competitive advantage"
        ])
    
    elif any(term in persona_lower for term in ['small business', 'SMB']):
        trending_words.extend([
            "affordable", "practical", "ROI-focused", "easy-to-implement", "local", 
            "community-driven", "family-owned", "personalized service", "cost-effective", "reliable"
        ])
    
    elif any(term in persona_lower for term in ['corporate', 'enterprise']):
        trending_words.extend([
            "enterprise-grade", "compliant", "secure", "scalable", "centralized", 
            "standardized", "policy-compliant", "audit-ready", "governance", "institutional"
        ])
    
    # Industry-specific trending words
    if any(term in persona_lower for term in ['healthcare', 'medical']):
        trending_words.extend([
            "HIPAA-compliant", "patient-centered", "evidence-based", "clinically-proven", 
            "telehealth", "precision", "wellness-focused", "care coordination"
        ])
    
    elif any(term in persona_lower for term in ['finance', 'banking']):
        trending_words.extend([
            "fintech", "blockchain", "secure", "regulated", "compliance-ready", 
            "fraud-protection", "real-time", "financial wellness", "digital banking"
        ])
    
    elif any(term in persona_lower for term in ['education', 'learning']):
        trending_words.extend([
            "adaptive learning", "personalized curriculum", "skill-building", 
            "certification-ready", "microlearning", "gamified education", "virtual classroom"
        ])
    
    # Behavioral trait words
    if any(term in persona_lower for term in ['busy', 'time-constrained']):
        trending_words.extend([
            "time-saving", "automated", "streamlined", "efficient", "quick-setup", 
            "instant", "on-the-go", "mobile-optimized", "fast-track"
        ])
    
    elif any(term in persona_lower for term in ['quality-focused', 'premium']):
        trending_words.extend([
            "premium", "high-quality", "artisanal", "crafted", "exclusive", 
            "luxury", "boutique", "curated", "elite", "sophisticated"
        ])
    
    elif any(term in persona_lower for term in ['budget-conscious', 'cost-effective']):
        trending_words.extend([
            "affordable", "value-packed", "cost-effective", "budget-friendly", 
            "economical", "smart investment", "maximum ROI", "cost-saving", "efficient pricing"
        ])
    
    # Geographic trending words
    if geographic_location:
        location_lower = geographic_location.lower()
        if any(region in location_lower for region in ['uk', 'london', 'britain']):
            trending_words.extend(["bespoke", "heritage", "traditional", "quality-assured", "british-made", "established"])
        elif any(region in location_lower for region in ['new york', 'nyc']):
            trending_words.extend(["fast-paced", "cutting-edge", "metropolitan", "premium", "exclusive", "competitive"])
        elif any(region in location_lower for region in ['california', 'bay area', 'silicon valley']):
            trending_words.extend(["innovative", "disruptive", "sustainable", "forward-thinking", "conscious", "progressive"])
        elif any(region in location_lower for region in ['germany', 'berlin']):
            trending_words.extend(["engineered", "precision-built", "systematic", "reliable", "methodical", "quality-tested"])
        elif any(region in location_lower for region in ['japan', 'tokyo']):
            trending_words.extend(["refined", "meticulous", "harmonious", "respectful", "continuous-improvement", "quality-focused"])
    
    # Interest-based trending words
    if interests:
        interests_lower = interests.lower()
        if 'sustainability' in interests_lower:
            trending_words.extend(["eco-friendly", "carbon-neutral", "sustainable", "renewable", "responsible", "green"])
        if 'fitness' in interests_lower:
            trending_words.extend(["performance-driven", "goal-oriented", "energizing", "motivational", "strength-building", "wellness-focused"])
        if 'technology' in interests_lower:
            trending_words.extend(["AI-powered", "smart", "automated", "next-gen", "digital-first", "tech-enabled"])
        if 'art' in interests_lower:
            trending_words.extend(["creative", "expressive", "unique", "artistic", "inspirational", "aesthetic"])
        if 'travel' in interests_lower:
            trending_words.extend(["adventure-ready", "portable", "flexible", "global", "culturally-aware", "exploration-focused"])
        if 'cooking' in interests_lower:
            trending_words.extend(["artisanal", "crafted", "gourmet", "quality-ingredients", "flavorful", "culinary-inspired"])
    
    # Remove duplicates and shuffle for variety
    trending_words = list(set(trending_words))
    random.shuffle(trending_words)
    
    # Return 8-15 trending words, enhanced with geographic and interest context
    return trending_words[:12]


# Helper function for MongoDB serialization
def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data.get('created_at'), datetime):
        data['created_at'] = data['created_at'].isoformat()
    return data

def parse_from_mongo(item):
    """Parse datetime strings back from MongoDB"""
    if isinstance(item.get('created_at'), str):
        item['created_at'] = datetime.fromisoformat(item['created_at'])
    return item


# Existing routes
@api_router.get("/")
async def root():
    return {"message": "Campaign Personalization Engine API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# New Campaign routes
@api_router.post("/generate-campaign", response_model=CampaignResponse)
async def generate_campaign_content(request: CampaignRequest):
    """Generate personalized campaign content based on customer persona and product description"""
    try:
        # Enhanced placeholder content generation with new fields
        location_text = f" in {request.geographic_location}" if request.geographic_location else ""
        interests_text = f"\n\n**Tailored Interests**: We noticed your interest in {request.interests}. Our solution aligns perfectly with these passions and can enhance your experience in these areas." if request.interests else ""
        
        generated_content = f"""
🎯 **Personalized Campaign for {request.customer_persona}{location_text}**

**Headline:** Transform Your Experience with Our Premium Solution

**Body:** 
Dear valued customer{location_text},

Based on your profile as {request.customer_persona}, we've crafted a special message just for you about our {request.product_description}.

Our research shows that customers like you value quality, innovation, and results. That's exactly what we deliver.
{interests_text}

**Key Benefits:**
• Tailored specifically for your needs and location
• Proven results from similar customers in your region
• Premium quality you can trust
• Dedicated support when you need it

**Call to Action:** 
Ready to see the difference? Join thousands of satisfied customers who've already made the smart choice.

*This is an enhanced campaign generated in Phase 2C with geographic and interest targeting - AI integration coming in future phases.*
        """
        
        # Create campaign object
        campaign_data = {
            "customer_persona": request.customer_persona,
            "product_description": request.product_description,
            "geographic_location": request.geographic_location,
            "interests": request.interests,
            "generated_content": generated_content.strip()
        }
        
        campaign = CampaignResponse(**campaign_data)
        
        # Store in database
        campaign_dict = campaign.dict()
        campaign_dict = prepare_for_mongo(campaign_dict)
        await db.campaigns.insert_one(campaign_dict)
        
        return campaign
        
    except Exception as e:
        logger.error(f"Error generating campaign: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate campaign content")

@api_router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(limit: int = 50):
    """Get list of generated campaigns"""
    try:
        campaigns = await db.campaigns.find().sort("created_at", -1).to_list(limit)
        parsed_campaigns = [parse_from_mongo(campaign) for campaign in campaigns]
        return [CampaignResponse(**campaign) for campaign in parsed_campaigns]
    except Exception as e:
        logger.error(f"Error fetching campaigns: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaigns")

@api_router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str):
    """Get a specific campaign by ID"""
    try:
        campaign = await db.campaigns.find_one({"id": campaign_id})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = parse_from_mongo(campaign)
        return CampaignResponse(**campaign)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign")


# New Phase 2A - Advanced Analysis Endpoint
@api_router.post("/generate/analysis", response_model=AnalysisResponse)
async def generate_advanced_analysis(request: AnalysisRequest):
    """Generate advanced persona analysis including behavior, color psychology, and trending words"""
    try:
        logger.info(f"Generating advanced analysis for persona: {request.persona[:50]}...")
        
        # Generate behavioral analysis with enhanced context
        behavior_summary = analyze_persona_behavior(
            request.persona, 
            request.product_description, 
            request.geographic_location, 
            request.interests
        )
        
        # Generate color palette based on psychology with geographic and interest context
        color_palette = generate_color_palette(request.persona, request.geographic_location, request.interests)
        
        # Generate trending words with enhanced context
        trending_words = generate_trending_words(request.persona, request.geographic_location, request.interests)
        
        # Create response object
        analysis_response = AnalysisResponse(
            behavior_analysis_summary=behavior_summary,
            color_palette=color_palette,
            trending_words=trending_words
        )
        
        logger.info(f"Successfully generated analysis with {len(color_palette)} colors and {len(trending_words)} trending words")
        
        return analysis_response
        
    except Exception as e:
        logger.error(f"Error generating advanced analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate advanced analysis")


# Phase 3A: Campaign History Endpoints
@api_router.post("/campaigns/save", response_model=CampaignHistoryResponse)
async def save_campaign_to_history(campaign_data: CampaignHistoryCreate):
    """Save a generated campaign to history"""
    try:
        # Generate a descriptive title
        interests_str = ", ".join(campaign_data.interests[:3])  # First 3 interests
        title = f"{campaign_data.age_range} | {campaign_data.geographic_location} | {interests_str}"
        
        # Create campaign history object
        history_entry = CampaignHistoryResponse(
            age_range=campaign_data.age_range,
            geographic_location=campaign_data.geographic_location,
            interests=campaign_data.interests,
            intelligence_data=campaign_data.intelligence_data,
            title=title
        )
        
        # Store in database
        history_dict = history_entry.dict()
        history_dict = prepare_for_mongo(history_dict)
        await db.campaign_history.insert_one(history_dict)
        
        logger.info(f"Campaign saved to history: {title}")
        return history_entry
        
    except Exception as e:
        logger.error(f"Error saving campaign to history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save campaign to history")

@api_router.get("/history", response_model=CampaignHistoryList)
async def get_campaign_history(page: int = 1, limit: int = 10, search: Optional[str] = None):
    """Get campaign history with pagination and search"""
    try:
        skip = (page - 1) * limit
        
        # Build query filter
        query_filter = {}
        if search:
            # Search in title, age_range, geographic_location, or interests
            query_filter = {
                "$or": [
                    {"title": {"$regex": search, "$options": "i"}},
                    {"age_range": {"$regex": search, "$options": "i"}},
                    {"geographic_location": {"$regex": search, "$options": "i"}},
                    {"interests": {"$in": [{"$regex": search, "$options": "i"}]}}
                ]
            }
        
        # Get total count
        total_count = await db.campaign_history.count_documents(query_filter)
        
        # Get campaigns with pagination
        campaigns = await db.campaign_history.find(query_filter).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        # Parse datetime fields
        parsed_campaigns = [parse_from_mongo(campaign) for campaign in campaigns]
        campaign_responses = [CampaignHistoryResponse(**campaign) for campaign in parsed_campaigns]
        
        return CampaignHistoryList(
            campaigns=campaign_responses,
            total_count=total_count,
            page=page,
            limit=limit
        )
        
    except Exception as e:
        logger.error(f"Error fetching campaign history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign history")

@api_router.get("/history/{campaign_id}", response_model=CampaignHistoryResponse)
async def get_campaign_by_id(campaign_id: str):
    """Get a specific campaign from history by ID"""
    try:
        campaign = await db.campaign_history.find_one({"id": campaign_id})
        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = parse_from_mongo(campaign)
        return CampaignHistoryResponse(**campaign)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign")

@api_router.delete("/history/{campaign_id}")
async def delete_campaign_from_history(campaign_id: str):
    """Delete a campaign from history"""
    try:
        result = await db.campaign_history.delete_one({"id": campaign_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        return {"message": "Campaign deleted successfully", "campaign_id": campaign_id}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete campaign")


# Include the router in the main app
app.include_router(api_router)

# Include marketing intelligence and admin routers
from marketing_endpoints import router as marketing_router
from admin_config import router as admin_router
from geographical_service import geo_router

app.include_router(marketing_router)
app.include_router(admin_router)
app.include_router(geo_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()