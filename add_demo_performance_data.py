#!/usr/bin/env python3
"""
Script to add demo performance data for portfolio showcase
"""
import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta
import random
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add backend directory to path
sys.path.append('/app/backend')

# Load environment variables
load_dotenv('/app/backend/.env')

async def add_demo_performance_data():
    """Add realistic demo performance data for campaign showcase"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Connected to MongoDB...")
    
    # Get existing campaigns
    campaigns = await db.campaign_history.find().to_list(100)
    print(f"Found {len(campaigns)} existing campaigns")
    
    if not campaigns:
        print("No campaigns found. Please generate some campaigns first.")
        return
    
    # Demo performance scenarios for portfolio showcase
    demo_scenarios = [
        {
            "name": "High Performer",
            "clicks": random.randint(2000, 5000),
            "conversions": lambda clicks: int(clicks * random.uniform(0.04, 0.08)),  # 4-8% conversion rate
            "spend": lambda clicks: round(clicks * random.uniform(0.80, 1.20), 2),  # $0.80-1.20 CPC
            "performance_tier": "excellent"
        },
        {
            "name": "Good Performer", 
            "clicks": random.randint(800, 2000),
            "conversions": lambda clicks: int(clicks * random.uniform(0.02, 0.04)),  # 2-4% conversion rate
            "spend": lambda clicks: round(clicks * random.uniform(1.20, 2.00), 2),  # $1.20-2.00 CPC
            "performance_tier": "good"
        },
        {
            "name": "Average Performer",
            "clicks": random.randint(300, 800),
            "conversions": lambda clicks: int(clicks * random.uniform(0.01, 0.02)),  # 1-2% conversion rate
            "spend": lambda clicks: round(clicks * random.uniform(2.00, 3.50), 2),  # $2.00-3.50 CPC
            "performance_tier": "average"
        },
        {
            "name": "Needs Improvement",
            "clicks": random.randint(100, 400),
            "conversions": lambda clicks: max(1, int(clicks * random.uniform(0.005, 0.015))),  # 0.5-1.5% conversion rate
            "spend": lambda clicks: round(clicks * random.uniform(3.50, 6.00), 2),  # $3.50-6.00 CPC
            "performance_tier": "poor"
        }
    ]
    
    # Add performance data for campaigns
    added_count = 0
    for i, campaign in enumerate(campaigns[:8]):  # Limit to first 8 campaigns for demo
        scenario = demo_scenarios[i % len(demo_scenarios)]
        
        clicks = scenario["clicks"]
        if callable(scenario["conversions"]):
            conversions = scenario["conversions"](clicks)
        else:
            conversions = scenario["conversions"]
            
        if callable(scenario["spend"]):
            spend = scenario["spend"](clicks)
        else:
            spend = scenario["spend"]
        
        # Calculate metrics
        conversion_rate = (conversions / clicks) * 100 if clicks > 0 else 0
        cost_per_click = spend / clicks if clicks > 0 else 0
        cost_per_conversion = spend / conversions if conversions > 0 else 0
        # Assuming $100 average conversion value for ROI calculation
        avg_conversion_value = 100.0
        revenue = conversions * avg_conversion_value
        roi = ((revenue - spend) / spend) * 100 if spend > 0 else 0
        
        # Create metrics entry
        metrics_data = {
            "id": f"demo-metrics-{i+1}",
            "campaign_id": campaign["id"],
            "clicks": clicks,
            "conversions": conversions,
            "spend": spend,
            "date_recorded": (datetime.now(timezone.utc) - timedelta(days=random.randint(1, 7))).date().isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "conversion_rate": round(conversion_rate, 2),
            "cost_per_click": round(cost_per_click, 2),
            "cost_per_conversion": round(cost_per_conversion, 2),
            "roi": round(roi, 1)
        }
        
        # Check if metrics already exist for this campaign
        existing = await db.campaign_metrics.find_one({"campaign_id": campaign["id"]})
        if existing:
            print(f"Metrics already exist for campaign {campaign['id']}, skipping...")
            continue
        
        # Insert metrics data
        await db.campaign_metrics.insert_one(metrics_data)
        added_count += 1
        
        print(f"✅ Added demo metrics for campaign {campaign['id'][:8]}... ({scenario['name']})")
        print(f"   📊 {clicks:,} clicks, {conversions} conversions, ${spend:.2f} spend")
        print(f"   📈 {conversion_rate:.2f}% CR, ${cost_per_click:.2f} CPC, {roi:.1f}% ROI")
        print()
    
    print(f"🎉 Successfully added demo performance data for {added_count} campaigns!")
    print("\nDemo scenarios created:")
    for scenario in demo_scenarios:
        print(f"  • {scenario['name']} - {scenario['performance_tier']} performance tier")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_demo_performance_data())