import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Brain, 
  TrendingUp, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  Users, 
  Heart,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Settings,
  Check,
  AlertCircle,
  ExternalLink,
  BarChart3,
  Cloud,
  History
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Import visualization components
import WordCloudVisualization from './visualizations/WordCloudVisualization';
import BehavioralChart from './visualizations/BehavioralChart';
import CategorizedNews from './visualizations/CategorizedNews';
import HistoryPanel from './HistoryPanel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EnhancedMarketingIntelligence = () => {
  const [ageRange, setAgeRange] = useState('');
  const [geographicLocation, setGeographicLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // API Configuration state
  const [useRealApis, setUseRealApis] = useState(false);
  const [braveApiKey, setBraveApiKey] = useState('');
  const [perplexityApiKey, setPerplexityApiKey] = useState('');
  const [adminKey, setAdminKey] = useState('');

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await axios.get(`${API}/marketing/personas/sample`);
      setApiStatus({ available: true });
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus({ available: false });
    }
  };

  const handleGenerateIntelligence = async () => {
    if (!ageRange.trim() || !geographicLocation.trim() || !interests.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setIntelligenceData(null);

    try {
      const interestsArray = interests.split(',').map(item => item.trim()).filter(item => item);
      
      const response = await axios.post(`${API}/marketing/generate-intelligence`, {
        age_range: ageRange,
        geographic_location: geographicLocation,
        interests: interestsArray
      });

      setIntelligenceData(response.data);
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
      const config = {
        use_real_apis: useRealApis
      };

      if (braveApiKey.trim()) {
        config.brave_api_key = braveApiKey;
      }

      if (perplexityApiKey.trim()) {
        config.perplexity_api_key = perplexityApiKey;
      }

      const response = await axios.post(`${API}/admin/configure-apis`, config, {
        headers: {
          'X-Admin-Key': adminKey
        }
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

  const handleHistorySelect = (historyData) => {
    setAgeRange(historyData.age_range);
    setGeographicLocation(historyData.geographic_location);
    setInterests(historyData.interests.join(', '));
    setShowHistoryPanel(false);
    
    // Auto-generate with loaded data
    setTimeout(() => {
      handleGenerateIntelligence();
    }, 500);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
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
              Phase 3B - Enhanced Dashboard
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="flex items-center gap-2"
              data-testid="history-button"
            >
              <History className="w-4 h-4" />
              History
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
                Configure real APIs for enhanced functionality. Currently using mock data.
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
                  <Input
                    id="adminKey"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key..."
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
                  <Input
                    id="braveKey"
                    type="password"
                    value={braveApiKey}
                    onChange={(e) => setBraveApiKey(e.target.value)}
                    placeholder="BSA..."
                    disabled={!useRealApis}
                    data-testid="brave-api-key-input"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApiConfig(false)}
                >
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
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="glass border-0 shadow-xl sticky top-6">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-slate-900">
                  Generate Intelligence
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Configure your target persona
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Age Range Input */}
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-600" />
                    Age Range
                  </Label>
                  <select
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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

                {/* Geographic Location Input */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York, NY"
                    value={geographicLocation}
                    onChange={(e) => setGeographicLocation(e.target.value)}
                    className="focus-ring text-sm"
                    data-testid="location-input"
                  />
                </div>

                {/* Interests Input */}
                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Interests
                  </Label>
                  <Input
                    id="interests"
                    placeholder="technology, fitness, travel"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="focus-ring text-sm"
                    data-testid="interests-input"
                  />
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleGenerateIntelligence}
                  disabled={isGenerating}
                  className="w-full btn-hover bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-4"
                  data-testid="generate-intelligence-button"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>

                <Separator />

                {/* Sample Personas */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700">Quick Start</Label>
                  <div className="space-y-2">
                    {[
                      {
                        name: "Tech Millennial",
                        age_range: "25-34",
                        geographic_location: "San Francisco, CA",
                        interests: ["technology", "startup", "innovation"]
                      },
                      {
                        name: "Creative Gen Z",
                        age_range: "18-24",
                        geographic_location: "New York, NY",
                        interests: ["art", "social media", "fashion"]
                      }
                    ].map((persona, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => loadSamplePersona(persona)}
                        data-testid={`sample-persona-${index}`}
                      >
                        <div>
                          <div className="font-medium text-xs">{persona.name}</div>
                          <div className="text-xs text-slate-500">{persona.age_range} • {persona.geographic_location.split(',')[0]}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3">
            {intelligenceData ? (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Keywords</p>
                          <p className="text-2xl font-bold">{intelligenceData.word_cloud_data?.length || 0}</p>
                        </div>
                        <Cloud className="w-8 h-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Motivations</p>
                          <p className="text-2xl font-bold">{intelligenceData.behavioral_analysis_chart?.length || 0}</p>
                        </div>
                        <BarChart3 className="w-8 h-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">News Articles</p>
                          <p className="text-2xl font-bold">{intelligenceData.news_insights?.recent_articles?.length || 0}</p>
                        </div>
                        <Globe className="w-8 h-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Platforms</p>
                          <p className="text-2xl font-bold">{Object.keys(intelligenceData.ad_copy_variations || {}).length}</p>
                        </div>
                        <FileText className="w-8 h-8 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Visualization Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Word Cloud */}
                  <WordCloudVisualization wordCloudData={intelligenceData.word_cloud_data} />
                  
                  {/* Behavioral Chart */}
                  <BehavioralChart behavioralData={intelligenceData.behavioral_analysis_chart} />
                </div>

                {/* News Section */}
                <CategorizedNews newsArticles={intelligenceData.news_insights?.recent_articles} />

                {/* Ad Copy Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Platform-Specific Ad Copy
                    </CardTitle>
                    <CardDescription>
                      Ready-to-use ad copy optimized for different social media platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(intelligenceData.ad_copy_variations || {}).map(([platform, copy]) => (
                        <Card key={platform} className="bg-gradient-to-br from-slate-50 to-slate-100">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold capitalize text-slate-900">{platform}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(copy, `${platform} ad copy`)}
                                className="h-8 w-8 p-0"
                                data-testid={`copy-${platform}-button`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{copy}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">Ready to Generate Intelligence</h3>
                  <p className="text-slate-500 max-w-md">
                    Configure your target persona and generate comprehensive marketing intelligence 
                    with advanced visualizations and insights.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* History Panel */}
      <HistoryPanel 
        isOpen={showHistoryPanel} 
        onToggle={() => setShowHistoryPanel(!showHistoryPanel)}
        onSelectHistory={handleHistorySelect}
      />
    </div>
  );
};

export default EnhancedMarketingIntelligence;