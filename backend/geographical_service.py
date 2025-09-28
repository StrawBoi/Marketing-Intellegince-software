import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query
from pathlib import Path

logger = logging.getLogger(__name__)

class GeographicalIndexService:
    """Service for geographical location indexing and search"""
    
    def __init__(self):
        self.geographical_data = None
        self.load_geographical_data()
    
    def load_geographical_data(self):
        """Load geographical data from JSON file"""
        try:
            data_path = Path(__file__).parent / "data" / "geographical_index.json"
            if data_path.exists():
                with open(data_path, 'r', encoding='utf-8') as f:
                    self.geographical_data = json.load(f)
                logger.info(f"Loaded geographical data: {len(self.geographical_data.get('cities', []))} cities, {len(self.geographical_data.get('countries', []))} countries")
            else:
                logger.warning(f"Geographical data file not found at {data_path}")
                self.geographical_data = {"cities": [], "countries": [], "regions": []}
        except Exception as e:
            logger.error(f"Failed to load geographical data: {e}")
            self.geographical_data = {"cities": [], "countries": [], "regions": []}
    
    def search_locations(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for locations matching the query"""
        
        if not query or len(query.strip()) < 1:
            return []
        
        query = query.lower().strip()
        results = []
        
        try:
            # Search cities
            for city in self.geographical_data.get("cities", []):
                if (query in city["name"].lower() or 
                    query in city["country"].lower() or 
                    (city["state"] and query in city["state"].lower()) or
                    query in city["display"].lower()):
                    
                    results.append({
                        "type": "city",
                        "name": city["name"],
                        "display": city["display"],
                        "country": city["country"],
                        "region": city["region"],
                        "state": city["state"],
                        "match_score": self._calculate_match_score(query, city)
                    })
            
            # Search countries
            for country in self.geographical_data.get("countries", []):
                if (query in country["name"].lower() or 
                    query in country["display"].lower()):
                    
                    results.append({
                        "type": "country",
                        "name": country["name"],
                        "display": country["display"],
                        "country": country["name"],
                        "region": country["region"],
                        "state": None,
                        "match_score": self._calculate_match_score(query, country)
                    })
            
            # Search regions
            for region in self.geographical_data.get("regions", []):
                if (query in region["name"].lower() or 
                    query in region["display"].lower()):
                    
                    results.append({
                        "type": "region",
                        "name": region["name"],
                        "display": region["display"],
                        "country": None,
                        "region": region["name"],
                        "state": None,
                        "match_score": self._calculate_match_score(query, region)
                    })
            
            # Sort by match score (higher is better) and limit results
            results.sort(key=lambda x: x["match_score"], reverse=True)
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Error searching locations: {e}")
            return []
    
    def _calculate_match_score(self, query: str, item: Dict[str, Any]) -> float:
        """Calculate relevance score for search results"""
        
        score = 0.0
        
        # Exact match gets highest score
        if query == item["name"].lower():
            score += 100
        elif query == item["display"].lower():
            score += 95
        
        # Starts with query gets high score
        elif item["name"].lower().startswith(query):
            score += 80
        elif item["display"].lower().startswith(query):
            score += 75
        
        # Contains query gets medium score
        elif query in item["name"].lower():
            score += 50
        elif query in item["display"].lower():
            score += 40
        
        # Bonus points for shorter names (more specific)
        if len(item["name"]) < 20:
            score += 10
        
        # Bonus points for cities over countries/regions
        if item.get("type") == "city":
            score += 5
        elif item.get("type") == "country":
            score += 3
        
        return score
    
    def get_popular_locations(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get list of popular/major locations"""
        
        popular_cities = [
            "New York City, NY, United States",
            "San Francisco, CA, United States", 
            "London, United Kingdom",
            "Paris, France",
            "Tokyo, Japan",
            "Sydney, NSW, Australia",
            "Toronto, ON, Canada",
            "Berlin, Germany",
            "Amsterdam, Netherlands",
            "Singapore",
            "Dubai, United Arab Emirates",
            "Stockholm, Sweden",
            "Barcelona, Spain",
            "Milan, Italy",
            "Seoul, South Korea",
            "Austin, TX, United States",
            "Chicago, IL, United States",
            "Los Angeles, CA, United States",
            "Mumbai, India",
            "São Paulo, Brazil"
        ]
        
        results = []
        for display_name in popular_cities[:limit]:
            # Find the full city data
            for city in self.geographical_data.get("cities", []):
                if city["display"] == display_name:
                    results.append({
                        "type": "city",
                        "name": city["name"],
                        "display": city["display"],
                        "country": city["country"],
                        "region": city["region"],
                        "state": city["state"],
                        "match_score": 0
                    })
                    break
        
        return results

# Create global service instance
geo_service = GeographicalIndexService()

# Create API router
geo_router = APIRouter(prefix="/api/geo", tags=["Geographical Services"])

@geo_router.get("/search")
async def search_locations(
    q: str = Query(..., min_length=1, description="Search query for locations"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum number of results")
):
    """Search for geographical locations"""
    
    try:
        results = geo_service.search_locations(q, limit)
        return {
            "query": q,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Location search failed: {e}")
        return {
            "query": q,
            "results": [],
            "count": 0,
            "error": "Search temporarily unavailable"
        }

@geo_router.get("/popular")
async def get_popular_locations(
    limit: int = Query(default=20, ge=1, le=50, description="Maximum number of results")
):
    """Get popular geographical locations"""
    
    try:
        results = geo_service.get_popular_locations(limit)
        return {
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Failed to get popular locations: {e}")
        return {
            "results": [],
            "count": 0,
            "error": "Popular locations temporarily unavailable"
        }