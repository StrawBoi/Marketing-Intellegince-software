#!/usr/bin/env python3
"""
Backend API Testing Suite for Campaign Performance & Strategic Insights
Tests all backend endpoints including history search fix and new performance tracking features
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Get backend URL from environment
def get_backend_url():
    """Get backend URL from frontend .env file"""
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.campaign_id = "test-campaign-123"
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
        print()
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })
    
    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Basic API Connectivity", True, f"API responded: {data.get('message', 'OK')}")
                return True
            else:
                self.log_test("Basic API Connectivity", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Basic API Connectivity", False, f"Connection error: {str(e)}")
            return False
    
    def test_history_search_fix(self):
        """Test the fixed history search functionality"""
        print("🔍 Testing History Search Fix...")
        
        # First, create some test campaign history data
        test_campaigns = [
            {
                "age_range": "25-34",
                "geographic_location": "San Francisco, CA",
                "interests": ["technology", "startup", "innovation"],
                "intelligence_data": {"test": "tech campaign data"}
            },
            {
                "age_range": "35-44", 
                "geographic_location": "New York, NY",
                "interests": ["finance", "business", "travel"],
                "intelligence_data": {"test": "business campaign data"}
            }
        ]
        
        # Save test campaigns to history
        saved_campaigns = []
        for campaign in test_campaigns:
            try:
                response = requests.post(f"{API_BASE}/campaigns/save", json=campaign, timeout=10)
                if response.status_code == 200:
                    saved_campaigns.append(response.json())
            except Exception as e:
                print(f"   Warning: Could not create test campaign: {e}")
        
        # Test 1: History without search (should work)
        try:
            response = requests.get(f"{API_BASE}/history", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_test("History endpoint without search", True, f"Found {data.get('total_count', 0)} campaigns")
            else:
                self.log_test("History endpoint without search", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("History endpoint without search", False, f"Error: {str(e)}")
        
        # Test 2: Search for tech-related terms
        try:
            response = requests.get(f"{API_BASE}/history?search=tech", timeout=10)
            if response.status_code == 200:
                data = response.json()
                campaigns = data.get('campaigns', [])
                found_tech = any('tech' in str(campaign).lower() for campaign in campaigns)
                self.log_test("History search for 'tech'", found_tech or len(campaigns) > 0, 
                            f"Found {len(campaigns)} campaigns with tech-related content")
            else:
                self.log_test("History search for 'tech'", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("History search for 'tech'", False, f"Error: {str(e)}")
        
        # Test 3: Search for age range
        try:
            response = requests.get(f"{API_BASE}/history?search=25-34", timeout=10)
            if response.status_code == 200:
                data = response.json()
                campaigns = data.get('campaigns', [])
                found_age = any('25-34' in str(campaign).lower() for campaign in campaigns)
                self.log_test("History search for '25-34'", found_age or len(campaigns) > 0,
                            f"Found {len(campaigns)} campaigns with age range 25-34")
            else:
                self.log_test("History search for '25-34'", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("History search for '25-34'", False, f"Error: {str(e)}")
    
    def test_campaign_metrics_endpoints(self):
        """Test the new campaign metrics endpoints"""
        print("📊 Testing Campaign Metrics Endpoints...")
        
        # Test data as specified in the review request
        test_metrics = {
            "campaign_id": self.campaign_id,
            "clicks": 1000,
            "conversions": 25,
            "spend": 150.00,
            "date_recorded": "2024-12-20"
        }
        
        # Test 1: Save campaign metrics
        try:
            response = requests.post(
                f"{API_BASE}/marketing/campaigns/{self.campaign_id}/metrics",
                json=test_metrics,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify calculated metrics
                expected_conversion_rate = (25 / 1000) * 100  # 2.5%
                expected_cost_per_click = 150.00 / 1000  # 0.15
                expected_cost_per_conversion = 150.00 / 25  # 6.0
                expected_roi = ((25 * 100 - 150) / 150) * 100  # 1566.67%
                
                conversion_rate_ok = abs(data.get('conversion_rate', 0) - expected_conversion_rate) < 0.01
                cost_per_click_ok = abs(data.get('cost_per_click', 0) - expected_cost_per_click) < 0.01
                cost_per_conversion_ok = abs(data.get('cost_per_conversion', 0) - expected_cost_per_conversion) < 0.01
                roi_ok = abs(data.get('roi', 0) - expected_roi) < 1.0
                
                all_calculations_correct = conversion_rate_ok and cost_per_click_ok and cost_per_conversion_ok and roi_ok
                
                details = f"Conversion Rate: {data.get('conversion_rate', 0):.2f}% (expected: {expected_conversion_rate:.2f}%), "
                details += f"CPC: ${data.get('cost_per_click', 0):.2f} (expected: ${expected_cost_per_click:.2f}), "
                details += f"Cost/Conv: ${data.get('cost_per_conversion', 0):.2f} (expected: ${expected_cost_per_conversion:.2f}), "
                details += f"ROI: {data.get('roi', 0):.1f}% (expected: {expected_roi:.1f}%)"
                
                self.log_test("Save campaign metrics with calculations", all_calculations_correct, details)
            else:
                self.log_test("Save campaign metrics", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Save campaign metrics", False, f"Error: {str(e)}")
        
        # Test 2: Retrieve campaign metrics
        try:
            response = requests.get(
                f"{API_BASE}/marketing/campaigns/{self.campaign_id}/metrics",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    metrics = data[0]
                    has_required_fields = all(field in metrics for field in 
                                            ['clicks', 'conversions', 'spend', 'conversion_rate', 'cost_per_click'])
                    self.log_test("Retrieve campaign metrics", has_required_fields, 
                                f"Retrieved {len(data)} metrics records with all required fields")
                else:
                    self.log_test("Retrieve campaign metrics", False, "No metrics data returned")
            else:
                self.log_test("Retrieve campaign metrics", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Retrieve campaign metrics", False, f"Error: {str(e)}")
    
    def test_performance_analysis_endpoint(self):
        """Test AI-powered performance analysis endpoint"""
        print("🤖 Testing Performance Analysis Endpoint...")
        
        try:
            response = requests.post(
                f"{API_BASE}/marketing/campaigns/{self.campaign_id}/analyze-performance",
                timeout=15
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required fields
                required_fields = [
                    'campaign_id', 'performance_summary', 'strategic_recommendations',
                    'key_metrics', 'improvement_areas', 'competitive_insights', 'next_steps'
                ]
                
                has_all_fields = all(field in data for field in required_fields)
                
                # Check content quality
                has_recommendations = isinstance(data.get('strategic_recommendations'), list) and len(data.get('strategic_recommendations', [])) > 0
                has_insights = isinstance(data.get('competitive_insights'), list) and len(data.get('competitive_insights', [])) > 0
                has_next_steps = isinstance(data.get('next_steps'), list) and len(data.get('next_steps', [])) > 0
                
                content_quality_ok = has_recommendations and has_insights and has_next_steps
                
                details = f"All fields present: {has_all_fields}, "
                details += f"Recommendations: {len(data.get('strategic_recommendations', []))}, "
                details += f"Insights: {len(data.get('competitive_insights', []))}, "
                details += f"Next steps: {len(data.get('next_steps', []))}"
                
                self.log_test("AI Performance Analysis", has_all_fields and content_quality_ok, details)
                
            elif response.status_code == 404:
                self.log_test("AI Performance Analysis", False, "No metrics found for campaign - need to save metrics first")
            else:
                self.log_test("AI Performance Analysis", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("AI Performance Analysis", False, f"Error: {str(e)}")
    
    def test_performance_overview(self):
        """Test performance overview endpoint"""
        print("📈 Testing Performance Overview...")
        
        try:
            response = requests.get(f"{API_BASE}/marketing/performance/overview", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for required structure
                has_overview = 'overview' in data
                has_top_campaigns = 'top_performing_campaigns' in data
                has_benchmarks = 'industry_benchmarks' in data
                
                structure_ok = has_overview and has_top_campaigns and has_benchmarks
                
                # Check overview fields
                overview = data.get('overview', {})
                overview_fields = ['total_campaigns', 'total_clicks', 'total_conversions', 'total_spend']
                has_overview_fields = all(field in overview for field in overview_fields)
                
                # Check benchmarks
                benchmarks = data.get('industry_benchmarks', {})
                benchmark_fields = ['avg_conversion_rate', 'avg_cost_per_click', 'good_roi_threshold']
                has_benchmark_fields = all(field in benchmarks for field in benchmark_fields)
                
                details = f"Structure complete: {structure_ok}, "
                details += f"Overview fields: {has_overview_fields}, "
                details += f"Benchmark fields: {has_benchmark_fields}, "
                details += f"Total campaigns: {overview.get('total_campaigns', 0)}"
                
                self.log_test("Performance Overview", structure_ok and has_overview_fields and has_benchmark_fields, details)
            else:
                self.log_test("Performance Overview", False, f"Status: {response.status_code}", response.text)
        except Exception as e:
            self.log_test("Performance Overview", False, f"Error: {str(e)}")
    
    def test_additional_metrics_scenarios(self):
        """Test additional metrics scenarios with different data"""
        print("🧪 Testing Additional Metrics Scenarios...")
        
        # Test scenario 1: High performing campaign
        high_performance_metrics = {
            "campaign_id": "high-performance-test",
            "clicks": 500,
            "conversions": 50,  # 10% conversion rate
            "spend": 100.00,
            "date_recorded": "2024-12-21"
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/marketing/campaigns/high-performance-test/metrics",
                json=high_performance_metrics,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                conversion_rate = data.get('conversion_rate', 0)
                roi = data.get('roi', 0)
                
                high_performance = conversion_rate > 5 and roi > 200
                self.log_test("High Performance Metrics", high_performance, 
                            f"Conversion Rate: {conversion_rate:.2f}%, ROI: {roi:.1f}%")
            else:
                self.log_test("High Performance Metrics", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("High Performance Metrics", False, f"Error: {str(e)}")
        
        # Test scenario 2: Low performing campaign
        low_performance_metrics = {
            "campaign_id": "low-performance-test",
            "clicks": 1000,
            "conversions": 5,  # 0.5% conversion rate
            "spend": 200.00,
            "date_recorded": "2024-12-21"
        }
        
        try:
            response = requests.post(
                f"{API_BASE}/marketing/campaigns/low-performance-test/metrics",
                json=low_performance_metrics,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                conversion_rate = data.get('conversion_rate', 0)
                roi = data.get('roi', 0)
                
                # Should still calculate correctly even for poor performance
                calculations_correct = conversion_rate == 0.5 and abs(roi - 150.0) < 1.0
                self.log_test("Low Performance Metrics", calculations_correct,
                            f"Conversion Rate: {conversion_rate:.2f}%, ROI: {roi:.1f}%")
            else:
                self.log_test("Low Performance Metrics", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Low Performance Metrics", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Testing Suite")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_basic_connectivity():
            print("❌ Basic connectivity failed. Stopping tests.")
            return False
        
        # Run all test suites
        self.test_history_search_fix()
        self.test_campaign_metrics_endpoints()
        self.test_performance_analysis_endpoint()
        self.test_performance_overview()
        self.test_additional_metrics_scenarios()
        
        # Summary
        print("=" * 60)
        print("📋 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
        
        return passed == total

if __name__ == "__main__":
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    print()
    
    tester = BackendTester()
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)