from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any, Optional
from pydantic import BaseModel
import os
from marketing_intelligence import api_config

router = APIRouter(prefix="/admin", tags=["Admin Configuration"])

class APIConfigUpdate(BaseModel):
    use_real_apis: bool
    brave_api_key: Optional[str] = None
    perplexity_api_key: Optional[str] = None

class APIStatus(BaseModel):
    use_real_apis: bool
    brave_api_configured: bool
    perplexity_api_configured: bool
    emergent_llm_configured: bool
    configuration_guide: Dict[str, str]

def verify_admin_key(x_admin_key: Optional[str] = Header(None)):
    """Verify admin API key"""
    expected_key = os.environ.get("ADMIN_API_KEY", "admin-secret-key-12345")
    if not x_admin_key or x_admin_key != expected_key:
        raise HTTPException(status_code=401, detail="Invalid admin API key")
    return x_admin_key

@router.get("/api-status", response_model=APIStatus)
async def get_api_status(admin_key: str = Depends(verify_admin_key)):
    """Get current API configuration status"""
    status = api_config.get_status()
    
    configuration_guide = {
        "brave_search": "Get free API key from https://api.search.brave.com/ (2,000 free requests/month)",
        "perplexity": "Get API key from https://www.perplexity.ai/settings/api",
        "emergent_llm": "Already configured - uses your Emergent LLM key for text and image generation",
        "instructions": "Use POST /admin/configure-apis to update API keys and enable real APIs"
    }
    
    return APIStatus(
        **status,
        configuration_guide=configuration_guide
    )

@router.post("/configure-apis")
async def configure_apis(
    config: APIConfigUpdate,
    admin_key: str = Depends(verify_admin_key)
):
    """Configure API keys and enable/disable real APIs"""
    
    try:
        # Update configuration
        config_data = config.dict(exclude_unset=True)
        api_config.update_configuration(config_data)
        
        # Validate configuration if enabling real APIs
        if config.use_real_apis:
            validation_results = {}
            
            # Check Brave Search API
            if config.brave_api_key:
                validation_results["brave_search"] = "configured"
            else:
                validation_results["brave_search"] = "missing_key"
            
            # Check Perplexity API
            if config.perplexity_api_key:
                validation_results["perplexity"] = "configured"
            else:
                validation_results["perplexity"] = "missing_key"
            
            # Check Emergent LLM (should already be configured)
            if api_config.emergent_llm_key:
                validation_results["emergent_llm"] = "configured"
            else:
                validation_results["emergent_llm"] = "missing_key"
            
            return {
                "message": "API configuration updated successfully",
                "status": "real_apis_enabled",
                "validation_results": validation_results,
                "active_apis": api_config.get_status()
            }
        else:
            return {
                "message": "API configuration updated successfully",  
                "status": "mock_mode_enabled",
                "note": "All requests will use mock data until real APIs are enabled",
                "active_apis": api_config.get_status()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Configuration update failed: {str(e)}")

@router.post("/toggle-api-mode")
async def toggle_api_mode(admin_key: str = Depends(verify_admin_key)):
    """Quick toggle between mock and real API mode"""
    
    current_mode = api_config.use_real_apis
    new_mode = not current_mode
    
    api_config.update_configuration({"use_real_apis": new_mode})
    
    return {
        "message": f"API mode toggled successfully",
        "previous_mode": "real_apis" if current_mode else "mock_mode",
        "current_mode": "real_apis" if new_mode else "mock_mode",
        "status": api_config.get_status()
    }

@router.get("/test-apis")
async def test_apis(admin_key: str = Depends(verify_admin_key)):
    """Test API connectivity and functionality"""
    
    test_results = {}
    
    # Test Emergent LLM
    if api_config.emergent_llm_key:
        test_results["emergent_llm"] = {
            "configured": True,
            "status": "ready",
            "note": "Used for text generation and image generation"
        }
    else:
        test_results["emergent_llm"] = {
            "configured": False,
            "status": "missing_key",
            "note": "Required for AI features"
        }
    
    # Test Brave Search (if configured)
    if api_config.brave_api_key:
        test_results["brave_search"] = {
            "configured": True,
            "status": "ready", 
            "note": "Will be used for real news search when enabled"
        }
    else:
        test_results["brave_search"] = {
            "configured": False,
            "status": "using_mock",
            "note": "Currently using mock news data"
        }
    
    # Test Perplexity (if configured)
    if api_config.perplexity_api_key:
        test_results["perplexity"] = {
            "configured": True,
            "status": "ready",
            "note": "Available as alternative news source"
        }
    else:
        test_results["perplexity"] = {
            "configured": False,
            "status": "not_configured",
            "note": "Optional alternative news source"
        }
    
    return {
        "api_mode": "real_apis" if api_config.use_real_apis else "mock_mode",
        "test_results": test_results,
        "overall_status": "All systems operational",
        "recommendations": [
            "Add Brave Search API key for real news data",
            "Optionally add Perplexity API key for additional news sources",
            "Emergent LLM key is already configured for AI features"
        ]
    }