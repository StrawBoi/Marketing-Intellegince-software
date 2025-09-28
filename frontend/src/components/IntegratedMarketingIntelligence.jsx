import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Brain, 
  Users, 
  Heart,
  Sparkles,
  Settings,
  Check,
  AlertCircle,
  ExternalLink,
  History,
  RefreshCw,
  Zap,
  Clock,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  X,
  Calendar,
  MousePointer,
  ShoppingCart
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Import new components
import LocationAutosuggest from './LocationAutosuggest';
import FloatingDashboard from './FloatingDashboard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const IntegratedMarketingIntelligence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Form state
  const [ageRange, setAgeRange] = useState('');
  const [geographicLocation, setGeographicLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Dashboard state
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentPersona, setCurrentPersona] = useState(null);
  
  // History state
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // API Configuration state
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [useRealApis, setUseRealApis] = useState(false);
  const [braveApiKey, setBraveApiKey] = useState('');
  const [adminKey, setAdminKey] = useState('');

  // Phase 6: Performance Tracking state
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedCampaignForMetrics, setSelectedCampaignForMetrics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    clicks: '',
    conversions: '',
    spend: '',
    date_recorded: new Date().toISOString().split('T')[0]
  });
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false);
  const [isSubmittingMetrics, setIsSubmittingMetrics] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize component based on URL params
  useEffect(() => {
    const dashboardParam = searchParams.get('dashboard');
    const historyId = searchParams.get('history');
    
    if (dashboardParam === 'open') {
      setShowDashboard(true);
    }
    
    if (historyId) {
      loadHistoryCampaign(historyId);
    }
    
    loadCampaignHistory();
  }, [searchParams]);

  // Safe navigation management
  const openDashboard = (data, persona) => {
    setIntelligenceData(data);
    setCurrentPersona(persona);
    setShowDashboard(true);
    
    // Update URL to reflect dashboard state
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('dashboard', 'open');
    setSearchParams(newSearchParams);
  };

  const closeDashboard = () => {
    setShowDashboard(false);
    
    // Clean up URL
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('dashboard');
    newSearchParams.delete('history');
    setSearchParams(newSearchParams);
  };

  const handleBackToDashboard = () => {
    // Close dashboard and return to form
    closeDashboard();
  };

  const loadCampaignHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`${API}/history?limit=20`);
      setCampaignHistory(response.data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaign history:', error);
      toast.error('Failed to load campaign history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadHistoryCampaign = async (campaignId) => {
    try {
      const response = await axios.get(`${API}/history/${campaignId}`);
      const campaign = response.data;
      
      // Pre-populate form
      setAgeRange(campaign.age_range);
      setGeographicLocation(campaign.geographic_location);
      setInterests(campaign.interests.join(', '));
      
      // Show dashboard with historical data
      const persona = {
        age_range: campaign.age_range,
        geographic_location: campaign.geographic_location,
        interests: campaign.interests
      };
      
      openDashboard(campaign.intelligence_data, persona);
      toast.success('Historical campaign loaded');
      
    } catch (error) {
      console.error('Error loading historical campaign:', error);
      toast.error('Failed to load historical campaign');
    }
  };

  const handleHistorySelect = (campaign) => {
    // Update URL to include history ID
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('history', campaign.id);
    newSearchParams.set('dashboard', 'open');
    setSearchParams(newSearchParams);
    
    // Load the campaign
    loadHistoryCampaign(campaign.id);
    setShowHistory(false);
  };

  const handleGenerateIntelligence = async () => {
    if (!ageRange.trim() || !geographicLocation.trim() || !interests.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    try {
      const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);
      
      const response = await axios.post(`${API}/marketing/generate-intelligence`, {
        age_range: ageRange,
        geographic_location: geographicLocation,
        interests: interestsArray
      });

      const persona = {
        age_range: ageRange,
        geographic_location: geographicLocation,
        interests: interestsArray
      };

      // Open floating dashboard with results
      openDashboard(response.data, persona);
      
      // Refresh history to include new campaign
      setTimeout(() => {
        loadCampaignHistory();
      }, 1000);
      
      toast.success('Marketing intelligence generated successfully!');
      
    } catch (error) {
      console.error('Error generating marketing intelligence:', error);
      toast.error('Failed to generate marketing intelligence. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigureAPIs = async () => {
    if (!adminKey.trim()) {
      toast.error('Please enter admin key');
      return;
    }

    try {
      const config = { use_real_apis: useRealApis };
      if (braveApiKey.trim()) {
        config.brave_api_key = braveApiKey;
      }

      await axios.post(`${API}/admin/configure-apis`, config, {
        headers: { 'X-Admin-Key': adminKey }
      });

      toast.success('API configuration updated successfully!');
      setShowApiConfig(false);
      
    } catch (error) {
      console.error('API configuration failed:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid admin key');
      } else {
        toast.error('Failed to update API configuration');
      }
    }
  };

  const loadSamplePersona = (persona) => {
    setAgeRange(persona.age_range);
    setGeographicLocation(persona.geographic_location);
    setInterests(persona.interests.join(', '));
    toast.success(`Loaded ${persona.name} persona`);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  // Phase 6: Performance Tracking functions
  const openPerformanceModal = (campaign) => {
    setSelectedCampaignForMetrics(campaign);
    setShowPerformanceModal(true);
    setPerformanceMetrics({
      clicks: '',
      conversions: '',
      spend: '',
      date_recorded: new Date().toISOString().split('T')[0]
    });
  };

  const closePerformanceModal = () => {
    setShowPerformanceModal(false);
    setSelectedCampaignForMetrics(null);
    setPerformanceAnalysis(null);
    setShowPerformanceAnalysis(false);
  };

  const handleSubmitMetrics = async () => {
    if (!selectedCampaignForMetrics || !performanceMetrics.clicks || !performanceMetrics.conversions || !performanceMetrics.spend) {
      toast.error('Please fill in all performance metrics fields');
      return;
    }

    setIsSubmittingMetrics(true);

    try {
      const metricsData = {
        campaign_id: selectedCampaignForMetrics.id,
        clicks: parseInt(performanceMetrics.clicks),
        conversions: parseInt(performanceMetrics.conversions),
        spend: parseFloat(performanceMetrics.spend),
        date_recorded: performanceMetrics.date_recorded
      };

      await axios.post(`${API}/marketing/campaigns/${selectedCampaignForMetrics.id}/metrics`, metricsData);
      
      toast.success('Performance metrics saved successfully!');
      
      // Automatically generate analysis
      handleGenerateAnalysis();
      
    } catch (error) {
      console.error('Error submitting performance metrics:', error);
      toast.error('Failed to save performance metrics. Please try again.');
      setIsSubmittingMetrics(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!selectedCampaignForMetrics) return;

    setIsAnalyzing(true);

    try {
      const response = await axios.post(`${API}/marketing/campaigns/${selectedCampaignForMetrics.id}/analyze-performance`);
      setPerformanceAnalysis(response.data);
      setShowPerformanceAnalysis(true);
      setIsSubmittingMetrics(false);
      
      toast.success('Strategic analysis generated successfully!');
      
    } catch (error) {
      console.error('Error generating performance analysis:', error);
      toast.error('Failed to generate performance analysis. Please try again.');
      setIsSubmittingMetrics(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Marketing Intelligence</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
              Integrated Platform
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
              data-testid="toggle-history-button"
            >
              <History className="w-4 h-4" />
              History ({campaignHistory.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiConfig(!showApiConfig)}
              className="flex items-center gap-2"
              data-testid="api-config-button"
            >
              <Settings className="w-4 h-4" />
              API Config
            </Button>
          </div>
        </div>
      </header>

      {/* API Configuration Panel */}
      {showApiConfig && (
        <div className="container mx-auto px-6 mb-8">
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Configure real APIs for enhanced functionality. Currently using RSS feeds and mock data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Get Free API Keys:</strong>
                  <br />
                  • Brave Search: <a href="https://api.search.brave.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    api.search.brave.com <ExternalLink className="w-3 h-3" />
                  </a> (2,000 free requests/month)
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminKey">Admin Key (Required)</Label>
                  <input
                    id="adminKey"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key..."
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    data-testid="admin-key-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useRealApis}
                      onChange={(e) => setUseRealApis(e.target.checked)}
                      data-testid="use-real-apis-checkbox"
                    />
                    Enable Real APIs
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="braveKey">Brave Search API Key (Optional)</Label>
                  <input
                    id="braveKey"
                    type="password"
                    value={braveApiKey}
                    onChange={(e) => setBraveApiKey(e.target.value)}
                    placeholder="BSA..."
                    disabled={!useRealApis}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
                    data-testid="brave-api-key-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowApiConfig(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfigureAPIs}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  data-testid="save-api-config-button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Generate Marketing Intelligence
                </CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  Create comprehensive marketing insights with advanced geographical indexing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Range Input */}
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-base font-semibold text-slate-700 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    Age Range
                  </Label>
                  <select
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    data-testid="age-range-select"
                  >
                    <option value="">Select age range...</option>
                    <option value="18-24">18-24 (Gen Z)</option>
                    <option value="25-34">25-34 (Millennials)</option>
                    <option value="35-44">35-44 (Gen X)</option>
                    <option value="45-54">45-54 (Gen X)</option>
                    <option value="55+">55+ (Baby Boomers)</option>
                  </select>
                </div>

                {/* Geographic Location with Autosuggest */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-slate-700 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-green-600" />
                    Geographic Location
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">Enhanced</Badge>
                  </Label>
                  <LocationAutosuggest
                    value={geographicLocation}
                    onChange={(e) => setGeographicLocation(e.target.value)}
                    className="focus-ring"
                    data-testid="location-autosuggest-input"
                  />
                  <p className="text-sm text-slate-500">
                    Start typing to see location suggestions with autosuggest
                  </p>
                </div>

                {/* Interests Input */}
                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-base font-semibold text-slate-700 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Interests
                  </Label>
                  <input
                    id="interests"
                    placeholder="e.g., technology, business, fitness, art"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    data-testid="interests-input"
                  />
                  <p className="text-sm text-slate-500">
                    List interests separated by commas for enhanced behavioral analysis
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleGenerateIntelligence}
                  disabled={isGenerating}
                  className="w-full btn-hover bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 text-lg"
                  data-testid="generate-intelligence-button"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Generating Intelligence...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Intelligence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* History & Sample Personas Sidebar */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              {/* Campaign History */}
              <Card className="glass border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center">
                      <History className="w-5 h-5 mr-2 text-indigo-600" />
                      Past Campaigns
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadCampaignHistory}
                      disabled={isLoadingHistory}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Click any campaign to load data and view results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : campaignHistory.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto" data-testid="campaign-history-list">
                      {campaignHistory.slice(0, 8).map((campaign) => (
                        <Card 
                          key={campaign.id}
                          className="p-3 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
                          data-testid={`history-campaign-${campaign.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleHistorySelect(campaign)}>
                              <div className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {campaign.age_range} • {campaign.geographic_location.split(',')[0]}
                              </div>
                              <div className="text-sm text-slate-600 truncate">
                                {campaign.interests.slice(0, 3).join(', ')}
                                {campaign.interests.length > 3 && ` +${campaign.interests.length - 3} more`}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-500">{formatTimeAgo(campaign.created_at)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPerformanceModal(campaign);
                                }}
                                className="h-8 px-2 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                                data-testid={`add-metrics-${campaign.id}`}
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                Metrics
                              </Button>
                              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                View
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No campaigns yet</p>
                      <p className="text-sm">Generate your first campaign to see it here</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sample Personas */}
              <Card className="glass border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Quick Start
                  </CardTitle>
                  <CardDescription>
                    Pre-configured personas for testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Tech Millennial",
                        age_range: "25-34",
                        geographic_location: "San Francisco, CA, United States",
                        interests: ["technology", "startup", "innovation"]
                      },
                      {
                        name: "Creative Gen Z",
                        age_range: "18-24",
                        geographic_location: "New York City, NY, United States",
                        interests: ["art", "social media", "fashion"]
                      },
                      {
                        name: "Professional Gen X",
                        age_range: "35-44",
                        geographic_location: "London, United Kingdom",
                        interests: ["business", "finance", "travel"]
                      }
                    ].map((persona, index) => (
                      <Card 
                        key={index} 
                        className="p-3 cursor-pointer hover:shadow-md hover:border-purple-200 transition-all duration-200 group"
                        onClick={() => loadSamplePersona(persona)}
                        data-testid={`sample-persona-${index}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors">{persona.name}</div>
                            <div className="text-sm text-slate-600">{persona.age_range} • {persona.geographic_location.split(',')[0]}</div>
                            <div className="text-xs text-purple-600 mt-1">{persona.interests.join(', ')}</div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                              Load
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Modal */}
      {showPerformanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {!showPerformanceAnalysis ? (
                <>
                  {/* Performance Metrics Input */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <BarChart3 className="w-6 h-6 mr-2 text-orange-600" />
                        Campaign Performance Metrics
                      </h2>
                      <p className="text-slate-600 mt-1">
                        Track performance data for: {selectedCampaignForMetrics?.age_range} • {selectedCampaignForMetrics?.geographic_location}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closePerformanceModal}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clicks" className="text-base font-semibold text-slate-700 flex items-center">
                          <MousePointer className="w-4 h-4 mr-2 text-blue-600" />
                          Clicks
                        </Label>
                        <input
                          id="clicks"
                          type="number"
                          min="0"
                          value={performanceMetrics.clicks}
                          onChange={(e) => setPerformanceMetrics({...performanceMetrics, clicks: e.target.value})}
                          placeholder="Total number of clicks"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          data-testid="clicks-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="conversions" className="text-base font-semibold text-slate-700 flex items-center">
                          <ShoppingCart className="w-4 h-4 mr-2 text-green-600" />
                          Conversions
                        </Label>
                        <input
                          id="conversions"
                          type="number"
                          min="0"
                          value={performanceMetrics.conversions}
                          onChange={(e) => setPerformanceMetrics({...performanceMetrics, conversions: e.target.value})}
                          placeholder="Number of conversions"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          data-testid="conversions-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="spend" className="text-base font-semibold text-slate-700 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                          Total Spend ($)
                        </Label>
                        <input
                          id="spend"
                          type="number"
                          min="0"
                          step="0.01"
                          value={performanceMetrics.spend}
                          onChange={(e) => setPerformanceMetrics({...performanceMetrics, spend: e.target.value})}
                          placeholder="Campaign spend amount"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          data-testid="spend-input"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_recorded" className="text-base font-semibold text-slate-700 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                          Date Recorded
                        </Label>
                        <input
                          id="date_recorded"
                          type="date"
                          value={performanceMetrics.date_recorded}
                          onChange={(e) => setPerformanceMetrics({...performanceMetrics, date_recorded: e.target.value})}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          data-testid="date-recorded-input"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4 border-t">
                      <Button variant="outline" onClick={closePerformanceModal}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitMetrics}
                        disabled={isSubmittingMetrics}
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
                        data-testid="submit-metrics-button"
                      >
                        {isSubmittingMetrics || isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {isAnalyzing ? 'Analyzing...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Save & Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Performance Analysis Results */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2 text-green-600" />
                        Strategic Performance Analysis
                      </h2>
                      <p className="text-slate-600 mt-1">
                        AI-powered insights and recommendations
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closePerformanceModal}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {performanceAnalysis && (
                    <div className="space-y-6">
                      {/* Key Metrics Summary */}
                      <Card className="border-green-200 bg-green-50/30">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center text-green-800">
                            <Target className="w-5 h-5 mr-2" />
                            Performance Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {performanceAnalysis.key_metrics.conversion_rate.toFixed(2)}%
                              </div>
                              <div className="text-sm text-slate-600">Conversion Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-700">
                                ${performanceAnalysis.key_metrics.cost_per_click.toFixed(2)}
                              </div>
                              <div className="text-sm text-slate-600">Cost Per Click</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-700">
                                ${performanceAnalysis.key_metrics.cost_per_conversion.toFixed(2)}
                              </div>
                              <div className="text-sm text-slate-600">Cost Per Conversion</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-2xl font-bold ${performanceAnalysis.key_metrics.roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {performanceAnalysis.key_metrics.roi.toFixed(1)}%
                              </div>
                              <div className="text-sm text-slate-600">ROI</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <Badge 
                              variant="secondary" 
                              className={`${
                                performanceAnalysis.performance_summary.overall_grade === 'Excellent' ? 'bg-green-100 text-green-800' :
                                performanceAnalysis.performance_summary.overall_grade === 'Good' ? 'bg-blue-100 text-blue-800' :
                                performanceAnalysis.performance_summary.overall_grade === 'Average' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              Overall Grade: {performanceAnalysis.performance_summary.overall_grade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Strategic Recommendations */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center text-indigo-800">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Strategic Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {performanceAnalysis.strategic_recommendations.map((recommendation, index) => (
                              <div key={index} className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                                <p className="text-slate-700" dangerouslySetInnerHTML={{ __html: recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Next Steps */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center text-purple-800">
                            <Check className="w-5 h-5 mr-2" />
                            Recommended Next Steps
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {performanceAnalysis.next_steps.map((step, index) => (
                              <div key={index} className="flex items-start">
                                <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <p className="text-slate-700">{step}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={closePerformanceModal}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Got It!
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Dashboard */}
      <FloatingDashboard
        isOpen={showDashboard}
        onClose={closeDashboard}
        onBack={handleBackToDashboard}
        intelligenceData={intelligenceData}
        personaData={currentPersona}
      />
    </div>
  );
};

export default IntegratedMarketingIntelligence;