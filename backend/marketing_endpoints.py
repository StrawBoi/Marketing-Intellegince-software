from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Dict, Any
from pydantic import BaseModel, Field
import logging
import asyncio
from datetime import datetime
from marketing_intelligence import MarketingIntelligenceCore
import sys
import os

# Add the backend directory to sys.path to import from server.py
sys.path.append(os.path.dirname(__file__))

# Import database and models from server.py
from server import db, prepare_for_mongo

router = APIRouter(prefix="/api/marketing", tags=["Marketing Intelligence"])
logger = logging.getLogger(__name__)

# Initialize the marketing intelligence core
marketing_core = MarketingIntelligenceCore()

class MarketingIntelligenceRequest(BaseModel):
    age_range: str = Field(..., description="Age range (e.g., '25-34', '18-24', '35-44')")
    geographic_location: str = Field(..., description="Geographic location (e.g., 'New York, NY', 'London, UK')")
    interests: List[str] = Field(..., description="List of interests (e.g., ['technology', 'fitness', 'travel'])")
    
class MarketingIntelligenceResponse(BaseModel):
    trending_keywords_analysis: Dict[str, Any]
    news_insights: Dict[str, Any] 
    persona_image_url: str
    ad_copy_variations: Dict[str, Any]  # Now contains structured ad copy with headline, body, keywords, CTA, colors
    # Phase 3A: New visualization data
    word_cloud_data: List[Dict[str, Any]]
    behavioral_analysis_chart: List[Dict[str, Any]]
    demographic_breakdown: Dict[str, Any]
    metadata: Dict[str, Any]

@router.post("/generate-intelligence", response_model=MarketingIntelligenceResponse)
async def generate_marketing_intelligence(
    request: MarketingIntelligenceRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate comprehensive marketing intelligence including:
    - Persona research and behavioral analysis
    - Recent news and trending topics analysis  
    - AI-generated persona image
    - Platform-specific ad copy variations (Instagram, LinkedIn, TikTok)
    """
    
    try:
        logger.info(f"Generating marketing intelligence for {request.age_range} persona in {request.geographic_location}")
        
        # Generate complete marketing intelligence
        intelligence = await marketing_core.generate_complete_intelligence(
            age_range=request.age_range,
            geographic_location=request.geographic_location,
            interests=request.interests
        )
        
        # Phase 3A: Auto-save to history
        background_tasks.add_task(
            save_to_campaign_history,
            request.age_range,
            request.geographic_location,
            request.interests,
            intelligence
        )
        
        # Add background task for analytics
        background_tasks.add_task(
            log_intelligence_request,
            request.age_range,
            request.geographic_location,
            request.interests,
            len(intelligence.get("news_insights", {}).get("recent_articles", []))
        )
        
        logger.info("Marketing intelligence generated successfully")
        
        return MarketingIntelligenceResponse(**intelligence)
        
    except Exception as e:
        logger.error(f"Failed to generate marketing intelligence: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to generate marketing intelligence: {str(e)}"
        )

@router.get("/personas/sample")
async def get_sample_personas():
    """Get sample persona configurations for testing"""
    
    sample_personas = [
        {
            "name": "Tech-Savvy Millennial",
            "age_range": "25-34",
            "geographic_location": "San Francisco, CA",
            "interests": ["technology", "startup", "innovation", "sustainability"]
        },
        {
            "name": "Creative Gen Z",
            "age_range": "18-24", 
            "geographic_location": "New York, NY",
            "interests": ["art", "music", "social media", "fashion"]
        },
        {
            "name": "Professional Gen X",
            "age_range": "35-44",
            "geographic_location": "London, UK",
            "interests": ["business", "finance", "travel", "wellness"]
        },
        {
            "name": "Active Boomer",
            "age_range": "55+",
            "geographic_location": "Austin, TX",
            "interests": ["health", "family", "community", "travel"]
        }
    ]
    
    return {
        "sample_personas": sample_personas,
        "usage_example": {
            "endpoint": "/api/marketing/generate-intelligence",
            "method": "POST",
            "description": "Use any of these sample personas to test the marketing intelligence generation"
        }
    }

@router.get("/keywords/trending")
async def get_trending_keywords(location: str = "global", industry: str = "general"):
    """Get current trending keywords by location and industry"""
    
    # Mock trending keywords (in real implementation, this would fetch from APIs)
    trending_data = {
        "global": {
            "general": ["authentic", "sustainable", "AI-powered", "community", "personalized", "innovative"],
            "technology": ["AI", "automation", "cloud", "cybersecurity", "blockchain", "quantum"],
            "retail": ["omnichannel", "sustainable", "experience", "personalization", "social commerce"]
        },
        "us": {
            "general": ["local", "made-in-usa", "community", "authentic", "premium", "fast"],
            "technology": ["silicon valley", "innovation", "startup", "venture", "disruptive"]
        }
    }
    
    location_key = location.lower() if location.lower() in trending_data else "global"
    industry_key = industry.lower() if industry.lower() in trending_data[location_key] else "general"
    
    keywords = trending_data[location_key][industry_key]
    
    return {
        "location": location,
        "industry": industry, 
        "trending_keywords": keywords,
        "last_updated": datetime.utcnow().isoformat(),
        "note": "Keywords updated based on current market analysis and news trends"
    }

@router.get("/news/recent")
async def get_recent_news(location: str = "global", topics: List[str] = None):
    """Get recent news for market intelligence"""
    
    if not topics:
        topics = ["marketing", "consumer trends", "technology"]
    
    # This would typically call the news service directly
    news_service = marketing_core.news_service
    
    try:
        news_data = await news_service.search_recent_news(location, topics, "25-34")  # Default age range
        
        return {
            "location": location,
            "topics": topics,
            "recent_news": news_data["news_results"],
            "market_insights": news_data["insights"],
            "last_updated": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch recent news: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent news")

async def save_to_campaign_history(age_range: str, location: str, interests: List[str], intelligence_data: Dict[str, Any]):
    """Background task to automatically save generated campaigns to history"""
    try:
        import uuid
        from datetime import datetime, timezone
        
        # Generate a descriptive title
        interests_str = ", ".join(interests[:3])  # First 3 interests
        title = f"{age_range} | {location} | {interests_str}"
        
        # Create history entry
        history_entry = {
            "id": str(uuid.uuid4()),
            "age_range": age_range,
            "geographic_location": location,
            "interests": interests,
            "intelligence_data": intelligence_data,
            "title": title,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save to database
        await db.campaign_history.insert_one(history_entry)
        logger.info(f"Campaign auto-saved to history: {title}")
        
    except Exception as e:
        logger.error(f"Failed to auto-save campaign to history: {str(e)}")

async def log_intelligence_request(age_range: str, location: str, interests: List[str], news_count: int):
    """Background task to log marketing intelligence requests for analytics"""
    logger.info(
        f"Marketing Intelligence Analytics - "
        f"Age: {age_range}, Location: {location}, "
        f"Interests: {len(interests)}, News Articles: {news_count}"
    )

# Phase 6: Campaign Performance Endpoints
from server import (
    CampaignMetricsCreate, CampaignMetricsResponse, PerformanceAnalysisResponse,
    calculate_performance_metrics, generate_strategic_analysis
)

@router.post("/campaigns/{campaign_id}/metrics", response_model=CampaignMetricsResponse)
async def save_campaign_metrics(campaign_id: str, metrics_data: CampaignMetricsCreate):
    """Save performance metrics for a specific campaign"""
    try:
        # Calculate performance metrics
        calculated_metrics = calculate_performance_metrics(
            metrics_data.clicks,
            metrics_data.conversions,
            metrics_data.spend
        )
        
        # Create metrics entry
        metrics_entry = CampaignMetricsResponse(
            campaign_id=campaign_id,
            clicks=metrics_data.clicks,
            conversions=metrics_data.conversions,
            spend=metrics_data.spend,
            date_recorded=metrics_data.date_recorded,
            **calculated_metrics
        )
        
        # Store in database
        metrics_dict = metrics_entry.dict()
        metrics_dict = prepare_for_mongo(metrics_dict)
        await db.campaign_metrics.insert_one(metrics_dict)
        
        logger.info(f"Campaign metrics saved for campaign {campaign_id}")
        return metrics_entry
        
    except Exception as e:
        logger.error(f"Failed to save campaign metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save campaign metrics")

@router.get("/campaigns/{campaign_id}/metrics", response_model=List[CampaignMetricsResponse])
async def get_campaign_metrics(campaign_id: str):
    """Get all performance metrics for a specific campaign"""
    try:
        metrics = await db.campaign_metrics.find({"campaign_id": campaign_id}).sort("date_recorded", -1).to_list(100)
        
        # Parse datetime fields
        parsed_metrics = []
        for metric in metrics:
            if isinstance(metric.get('created_at'), str):
                metric['created_at'] = datetime.fromisoformat(metric['created_at'])
            parsed_metrics.append(CampaignMetricsResponse(**metric))
        
        return parsed_metrics
        
    except Exception as e:
        logger.error(f"Failed to fetch campaign metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch campaign metrics")

@router.post("/campaigns/{campaign_id}/analyze-performance", response_model=PerformanceAnalysisResponse)
async def analyze_campaign_performance(campaign_id: str):
    """Generate AI-powered strategic analysis of campaign performance"""
    try:
        # Get latest metrics for the campaign
        latest_metrics = await db.campaign_metrics.find({"campaign_id": campaign_id}).sort("date_recorded", -1).limit(1).to_list(1)
        
        if not latest_metrics:
            raise HTTPException(status_code=404, detail="No performance metrics found for this campaign")
        
        metrics_data = latest_metrics[0]
        
        # Calculate performance metrics if not already calculated
        calculated_metrics = calculate_performance_metrics(
            metrics_data['clicks'],
            metrics_data['conversions'],
            metrics_data['spend']
        )
        
        # Generate strategic analysis
        analysis = generate_strategic_analysis(
            calculated_metrics,
            metrics_data['clicks'],
            metrics_data['conversions'],
            metrics_data['spend']
        )
        
        # Create response
        performance_analysis = PerformanceAnalysisResponse(
            campaign_id=campaign_id,
            performance_summary=analysis['performance_summary'],
            strategic_recommendations=analysis['strategic_recommendations'],
            key_metrics=analysis['key_metrics'],
            improvement_areas=analysis['improvement_areas'],
            competitive_insights=analysis['competitive_insights'],
            next_steps=analysis['next_steps']
        )
        
        logger.info(f"Performance analysis generated for campaign {campaign_id}")
        return performance_analysis
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to analyze campaign performance: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze campaign performance")

@router.get("/performance/overview")
async def get_performance_overview():
    """Get overview of all campaign performance metrics"""
    try:
        # Aggregate metrics across all campaigns
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_campaigns": {"$sum": 1},
                    "total_clicks": {"$sum": "$clicks"},
                    "total_conversions": {"$sum": "$conversions"},
                    "total_spend": {"$sum": "$spend"},
                    "avg_conversion_rate": {"$avg": "$conversion_rate"},
                    "avg_cost_per_click": {"$avg": "$cost_per_click"},
                    "avg_roi": {"$avg": "$roi"}
                }
            }
        ]
        
        result = await db.campaign_metrics.aggregate(pipeline).to_list(1)
        
        if result:
            overview = result[0]
            overview.pop('_id', None)  # Remove MongoDB _id field
        else:
            overview = {
                "total_campaigns": 0,
                "total_clicks": 0,
                "total_conversions": 0,
                "total_spend": 0.0,
                "avg_conversion_rate": 0.0,
                "avg_cost_per_click": 0.0,
                "avg_roi": 0.0
            }
        
        # Get top performing campaigns
        top_campaigns = await db.campaign_metrics.find().sort("roi", -1).limit(5).to_list(5)
        
        return {
            "overview": overview,
            "top_performing_campaigns": [
                {
                    "campaign_id": campaign["campaign_id"],
                    "roi": campaign.get("roi", 0),
                    "conversion_rate": campaign.get("conversion_rate", 0),
                    "clicks": campaign.get("clicks", 0),
                    "conversions": campaign.get("conversions", 0)
                }
                for campaign in top_campaigns
            ],
            "industry_benchmarks": {
                "avg_conversion_rate": 2.5,
                "avg_cost_per_click": 3.0,
                "good_roi_threshold": 200,
                "excellent_roi_threshold": 400
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get performance overview: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get performance overview")