from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
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

class CampaignResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_persona: str
    product_description: str
    generated_content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = Field(default="generated")

class CampaignCreate(BaseModel):
    customer_persona: str
    product_description: str
    generated_content: str


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
        # Placeholder content generation - will be replaced with AI in later phases
        generated_content = f"""
🎯 **Personalized Campaign for {request.customer_persona}**

**Headline:** Transform Your Experience with Our Premium Solution

**Body:** 
Dear valued customer,

Based on your profile as {request.customer_persona}, we've crafted a special message just for you about our {request.product_description}.

Our research shows that customers like you value quality, innovation, and results. That's exactly what we deliver.

**Key Benefits:**
• Tailored specifically for your needs
• Proven results from similar customers  
• Premium quality you can trust
• Dedicated support when you need it

**Call to Action:** 
Ready to see the difference? Join thousands of satisfied customers who've already made the smart choice.

*This is a placeholder campaign generated in Phase 1 - AI integration coming in future phases.*
        """
        
        # Create campaign object
        campaign_data = {
            "customer_persona": request.customer_persona,
            "product_description": request.product_description, 
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


# Include the router in the main app
app.include_router(api_router)

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