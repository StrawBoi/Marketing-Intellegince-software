#!/usr/bin/env python3
"""
Demo script to showcase Campaign Performance & Strategic Insights feature
for portfolio presentation
"""
import asyncio
import os
import sys
from datetime import datetime, timezone
import json
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend directory to path
sys.path.append('/app/backend')

# Load environment variables
load_dotenv('/app/backend/.env')

async def create_portfolio_showcase_data():
    """Create comprehensive demo data for portfolio showcase"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🎯 Creating Portfolio Showcase Data for Campaign Performance & Strategic Insights")
    print("=" * 80)
    
    # Portfolio showcase campaigns
    showcase_campaigns = [
        {
            "id": "showcase-campaign-1",
            "age_range": "25-34",
            "geographic_location": "San Francisco, CA, United States",
            "interests": ["technology", "startup", "innovation", "AI"],
            "title": "25-34 | San Francisco | technology, startup, innovation",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "intelligence_data": {
                "trending_keywords_analysis": {"keywords": ["AI-powered", "innovative", "tech-savvy", "early-adopter"]},
                "news_insights": {"summary": "Strong tech adoption trends in SF Bay Area"},
                "persona_image_url": "https://via.placeholder.com/300x200/4F46E5/white?text=Tech+Millennial",
                "ad_copy_variations": {
                    "instagram": {"headline": "Revolutionary AI for Tech Leaders", "body": "Join SF's innovators"},
                    "linkedin": {"headline": "Enterprise AI Solutions", "body": "Scale your startup with AI"},
                    "tiktok": {"headline": "AI That Actually Works", "body": "Tech that gets it"}
                }
            }
        },
        {
            "id": "showcase-campaign-2", 
            "age_range": "35-44",
            "geographic_location": "New York, NY, United States",
            "interests": ["business", "finance", "leadership", "growth"],
            "title": "35-44 | New York | business, finance, leadership",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "intelligence_data": {
                "trending_keywords_analysis": {"keywords": ["professional", "growth-oriented", "ROI-focused", "results-driven"]},
                "news_insights": {"summary": "Business growth trends in NYC market"},
                "persona_image_url": "https://via.placeholder.com/300x200/059669/white?text=Business+Executive",
                "ad_copy_variations": {
                    "instagram": {"headline": "Executive Growth Solutions", "body": "Scale your business in NYC"},
                    "linkedin": {"headline": "Strategic Business Intelligence", "body": "Drive results with data"},
                    "tiktok": {"headline": "Business Growth Hacks", "body": "NYC entrepreneurs love this"}
                }
            }
        },
        {
            "id": "showcase-campaign-3",
            "age_range": "18-24", 
            "geographic_location": "Los Angeles, CA, United States",
            "interests": ["social media", "content creation", "lifestyle", "trends"],
            "title": "18-24 | Los Angeles | social media, content creation, lifestyle",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "intelligence_data": {
                "trending_keywords_analysis": {"keywords": ["viral", "authentic", "trendy", "social-first"]},
                "news_insights": {"summary": "Social media trends dominating LA Gen Z market"},
                "persona_image_url": "https://via.placeholder.com/300x200/DC2626/white?text=Gen+Z+Creator",
                "ad_copy_variations": {
                    "instagram": {"headline": "Go Viral with Content Tools", "body": "LA creators are obsessed"},
                    "linkedin": {"headline": "Creator Economy Platform", "body": "Professional tools for creators"},
                    "tiktok": {"headline": "Content That Slaps Different", "body": "LA vibes only"}
                }
            }
        }
    ]
    
    # Performance data scenarios for each campaign
    performance_scenarios = [
        {
            "campaign_id": "showcase-campaign-1",
            "scenario": "🎯 Excellence: High-performing tech campaign",
            "clicks": 4500,
            "conversions": 315,  # 7% conversion rate
            "spend": 4050.00,    # $0.90 CPC
            "roi_expected": 677.8  # Very strong ROI
        },
        {
            "campaign_id": "showcase-campaign-2", 
            "scenario": "💼 Success: Strong business campaign",
            "clicks": 2200,
            "conversions": 88,   # 4% conversion rate
            "spend": 3300.00,    # $1.50 CPC
            "roi_expected": 166.7  # Good ROI
        },
        {
            "campaign_id": "showcase-campaign-3",
            "scenario": "📱 Growth: Gen Z engagement campaign",
            "clicks": 8500,
            "conversions": 170,  # 2% conversion rate
            "spend": 5950.00,    # $0.70 CPC
            "roi_expected": 185.7  # Strong ROI with high volume
        }
    ]
    
    # Insert showcase campaigns
    print("\n📊 Creating Showcase Campaigns...")
    for campaign in showcase_campaigns:
        existing = await db.campaign_history.find_one({"id": campaign["id"]})
        if existing:
            print(f"   ✅ Campaign {campaign['id']} already exists")
        else:
            await db.campaign_history.insert_one(campaign)
            print(f"   ✨ Created campaign: {campaign['title']}")
    
    # Insert performance data
    print("\n📈 Adding Performance Metrics...")
    for perf in performance_scenarios:
        # Calculate metrics
        clicks = perf["clicks"]
        conversions = perf["conversions"]
        spend = perf["spend"]
        
        conversion_rate = (conversions / clicks) * 100
        cost_per_click = spend / clicks
        cost_per_conversion = spend / conversions
        avg_conversion_value = 100.0
        revenue = conversions * avg_conversion_value
        roi = ((revenue - spend) / spend) * 100
        
        metrics_data = {
            "id": f"showcase-metrics-{perf['campaign_id'][-1]}",
            "campaign_id": perf["campaign_id"],
            "clicks": clicks,
            "conversions": conversions,
            "spend": spend,
            "date_recorded": datetime.now(timezone.utc).date().isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "conversion_rate": round(conversion_rate, 2),
            "cost_per_click": round(cost_per_click, 2),
            "cost_per_conversion": round(cost_per_conversion, 2),
            "roi": round(roi, 1)
        }
        
        existing = await db.campaign_metrics.find_one({"campaign_id": perf["campaign_id"]})
        if existing:
            print(f"   ✅ Metrics for {perf['campaign_id']} already exist")
        else:
            await db.campaign_metrics.insert_one(metrics_data)
            print(f"   🎯 {perf['scenario']}")
            print(f"      📊 {clicks:,} clicks → {conversions} conversions → ${spend:.2f} spend")
            print(f"      📈 {conversion_rate:.1f}% CR | ${cost_per_click:.2f} CPC | {roi:.1f}% ROI")
            print()
    
    print("🎉 Portfolio Showcase Data Created Successfully!")
    print("\n🎨 Demo Features Available:")
    print("   • Campaign Performance Tracking with realistic metrics")
    print("   • AI-Powered Strategic Analysis & Recommendations") 
    print("   • Performance Dashboard with key metrics visualization")
    print("   • Campaign History with integrated performance buttons")
    print("   • Multiple performance tiers (Excellent, Good, Growth scenarios)")
    
    print("\n📋 Portfolio Demonstration Flow:")
    print("   1. Show campaign history with performance buttons")
    print("   2. Click 'Metrics' button on any campaign")
    print("   3. Demonstrate performance analysis with AI insights")
    print("   4. Showcase strategic recommendations")
    print("   5. Display calculated ROI and performance metrics")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_portfolio_showcase_data())