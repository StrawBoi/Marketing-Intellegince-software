#!/usr/bin/env python3
"""
Create realistic demo data using actual marketing intelligence generation
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

# Import marketing intelligence
from marketing_intelligence import MarketingIntelligenceCore

async def create_professional_demo_data():
    """Create professional demo data with real marketing intelligence"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🎯 Creating Professional Marketing Intelligence Demo Data")
    print("=" * 70)
    
    # Initialize marketing intelligence core
    marketing_core = MarketingIntelligenceCore()
    
    # Professional demo personas for portfolio showcase
    professional_personas = [
        {
            "id": "pro-tech-innovator",
            "name": "Tech Innovator Campaign",
            "age_range": "25-34",
            "geographic_location": "San Francisco, CA, United States",
            "interests": ["artificial intelligence", "startup", "innovation", "technology"],
            "performance_tier": "excellent"
        },
        {
            "id": "pro-business-executive", 
            "name": "Business Executive Campaign",
            "age_range": "35-44",
            "geographic_location": "New York, NY, United States",
            "interests": ["business strategy", "finance", "leadership", "growth"],
            "performance_tier": "strong"
        },
        {
            "id": "pro-creative-gen-z",
            "name": "Creative Gen Z Campaign", 
            "age_range": "18-24",
            "geographic_location": "Los Angeles, CA, United States",
            "interests": ["content creation", "social media", "design", "lifestyle"],
            "performance_tier": "high-engagement"
        },
        {
            "id": "pro-wellness-millennial",
            "name": "Wellness Millennial Campaign",
            "age_range": "28-35", 
            "geographic_location": "Austin, TX, United States",
            "interests": ["wellness", "sustainability", "fitness", "mindfulness"],
            "performance_tier": "growing"
        }
    ]
    
    print("🧠 Generating Real Marketing Intelligence...")
    
    # Generate real marketing intelligence for each persona
    for i, persona in enumerate(professional_personas):
        print(f"\n📊 Generating intelligence for: {persona['name']}")
        
        try:
            # Generate actual marketing intelligence
            intelligence = await marketing_core.generate_complete_intelligence(
                age_range=persona["age_range"],
                geographic_location=persona["geographic_location"],  
                interests=persona["interests"]
            )
            
            print(f"✅ Generated intelligence with {len(intelligence.get('trending_keywords_analysis', {}).get('keywords', []))} keywords")
            print(f"   📈 Behavioral insights: {len(intelligence.get('behavioral_analysis_chart', []))} data points")
            print(f"   🎨 Color palette: {len(intelligence.get('demographic_breakdown', {}).get('color_recommendations', []))} colors")
            print(f"   📰 News insights: {len(intelligence.get('news_insights', {}).get('recent_articles', []))} articles")
            
            # Create comprehensive campaign entry
            campaign_data = {
                "id": persona["id"],
                "age_range": persona["age_range"],
                "geographic_location": persona["geographic_location"],
                "interests": persona["interests"],
                "intelligence_data": intelligence,
                "title": f"{persona['age_range']} | {persona['geographic_location'].split(',')[0]} | {', '.join(persona['interests'][:3])}",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "campaign_name": persona["name"],
                "performance_tier": persona["performance_tier"]
            }
            
            # Check if campaign exists
            existing = await db.campaign_history.find_one({"id": persona["id"]})
            if existing:
                # Update existing campaign with real intelligence
                await db.campaign_history.update_one(
                    {"id": persona["id"]},
                    {"$set": campaign_data}
                )
                print(f"   🔄 Updated existing campaign")
            else:
                # Insert new campaign
                await db.campaign_history.insert_one(campaign_data)
                print(f"   ✨ Created new campaign")
            
            # Add realistic performance metrics based on tier
            performance_scenarios = {
                "excellent": {"clicks": 4500, "conv_rate": 0.07, "cpc": 0.90},
                "strong": {"clicks": 2800, "conv_rate": 0.045, "cpc": 1.20},
                "high-engagement": {"clicks": 6200, "conv_rate": 0.025, "cpc": 0.75},
                "growing": {"clicks": 1800, "conv_rate": 0.035, "cpc": 1.45}
            }
            
            scenario = performance_scenarios[persona["performance_tier"]]
            clicks = scenario["clicks"]
            conversions = int(clicks * scenario["conv_rate"])
            spend = clicks * scenario["cpc"]
            
            # Calculate metrics
            conversion_rate = (conversions / clicks) * 100
            cost_per_click = spend / clicks
            cost_per_conversion = spend / conversions if conversions > 0 else 0
            avg_conversion_value = 120.0  # Professional campaigns have higher value
            revenue = conversions * avg_conversion_value
            roi = ((revenue - spend) / spend) * 100 if spend > 0 else 0
            
            metrics_data = {
                "id": f"pro-metrics-{i+1}",
                "campaign_id": persona["id"],
                "clicks": clicks,
                "conversions": conversions,
                "spend": round(spend, 2),
                "date_recorded": datetime.now(timezone.utc).date().isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "conversion_rate": round(conversion_rate, 2),
                "cost_per_click": round(cost_per_click, 2),
                "cost_per_conversion": round(cost_per_conversion, 2),
                "roi": round(roi, 1)
            }
            
            # Add performance metrics
            existing_metrics = await db.campaign_metrics.find_one({"campaign_id": persona["id"]})
            if existing_metrics:
                await db.campaign_metrics.update_one(
                    {"campaign_id": persona["id"]},
                    {"$set": metrics_data}
                )
            else:
                await db.campaign_metrics.insert_one(metrics_data)
            
            print(f"   📊 Metrics: {clicks:,} clicks → {conversions} conversions → {roi:.1f}% ROI")
            
        except Exception as e:
            print(f"   ❌ Error generating intelligence: {str(e)}")
            continue
    
    print("\n🎉 Professional Demo Data Created Successfully!")
    print("\n🎨 Features Showcased:")
    print("   • Real behavioral analysis with psychological insights")
    print("   • Actual color psychology recommendations") 
    print("   • Trending keywords from market research")
    print("   • Performance metrics with strategic analysis")
    print("   • Multi-platform ad copy variations")
    print("   • Professional demographic breakdowns")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_professional_demo_data())