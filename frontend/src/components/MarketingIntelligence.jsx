import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MarketingIntelligence = () => {
  const [ageRange, setAgeRange] = useState('');
  const [geographicLocation, setGeographicLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);

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
      // This is a public endpoint to check general status
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Marketing Intelligence</span>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Phase 2D - AI Core
            </Badge>
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

      <div className="container mx-auto px-6 py-8">
        {/* API Configuration Panel */}
        {showApiConfig && (
          <Card className="mb-8 border-orange-200 bg-orange-50/50">
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
                  <br />
                  • Perplexity (Optional): <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    perplexity.ai/settings/api <ExternalLink className="w-3 h-3" />
                  </a>
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
                
                <div className="space-y-2">
                  <Label htmlFor="perplexityKey">Perplexity API Key (Optional)</Label>
                  <Input
                    id="perplexityKey"
                    type="password"
                    value={perplexityApiKey}
                    onChange={(e) => setPerplexityApiKey(e.target.value)}
                    placeholder="pplx-..."
                    disabled={!useRealApis}
                    data-testid="perplexity-api-key-input"
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                  data-testid="save-api-config-button"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  AI Marketing Intelligence Generator
                </CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  Generate comprehensive marketing intelligence with persona analysis, news insights, and AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Age Range Input */}
                <div className="space-y-2">
                  <Label htmlFor="ageRange" className="text-base font-semibold text-slate-700 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-600" />
                    Age Range
                  </Label>
                  <select
                    id="ageRange"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  <Label htmlFor="location" className="text-base font-semibold text-slate-700 flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    Geographic Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., New York City, NY or London, UK"
                    value={geographicLocation}
                    onChange={(e) => setGeographicLocation(e.target.value)}
                    className="focus-ring"
                    data-testid="location-input"
                  />
                  <p className="text-sm text-slate-500">
                    Specify location for regional news analysis and cultural insights
                  </p>
                </div>

                {/* Interests Input */}
                <div className="space-y-2">
                  <Label htmlFor="interests" className="text-base font-semibold text-slate-700 flex items-center">
                    <Heart className="w-4 h-4 mr-2 text-pink-600" />
                    Interests
                  </Label>
                  <Input
                    id="interests"
                    placeholder="e.g., technology, fitness, travel, art, music"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="focus-ring"
                    data-testid="interests-input"
                  />
                  <p className="text-sm text-slate-500">
                    List interests separated by commas for behavioral analysis
                  </p>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleGenerateIntelligence}
                  disabled={isGenerating}
                  className="w-full btn-hover bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white py-6 text-lg"
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
                      Generate Marketing Intelligence
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sample Personas Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass border-0 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Sample Personas
                </CardTitle>
                <CardDescription>
                  Quick-start with pre-configured personas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
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
                    },
                    {
                      name: "Professional Gen X",
                      age_range: "35-44",
                      geographic_location: "London, UK",
                      interests: ["business", "finance", "travel"]
                    }
                  ].map((persona, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-white/60 rounded-lg border border-slate-200 hover:bg-white/80 transition-colors cursor-pointer"
                      onClick={() => loadSamplePersona(persona)}
                      data-testid={`sample-persona-${index}`}
                    >
                      <p className="font-medium text-slate-800 mb-1">{persona.name}</p>
                      <p className="text-xs text-slate-600">{persona.age_range} • {persona.geographic_location}</p>
                      <p className="text-xs text-purple-600">{persona.interests.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Display */}
        {intelligenceData && (
          <Card className="mt-8 glass border-0 shadow-xl fade-in" data-testid="intelligence-results">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-purple-600" />
                Marketing Intelligence Report
              </CardTitle>
              <CardDescription>
                Comprehensive analysis and recommendations for your target persona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview" className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="keywords" className="flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger value="news" className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    News
                  </TabsTrigger>
                  <TabsTrigger value="persona" className="flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    Persona
                  </TabsTrigger>
                  <TabsTrigger value="adcopy" className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    Ad Copy
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Keywords Found</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                          {intelligenceData.trending_keywords_analysis?.keywords?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">News Articles</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {intelligenceData.news_insights?.recent_articles?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">Platform Copies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.keys(intelligenceData.ad_copy_variations || {}).length}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Trending Keywords Analysis</h3>
                      <p className="text-slate-600 mb-4">{intelligenceData.trending_keywords_analysis?.summary}</p>
                      <div className="flex flex-wrap gap-2">
                        {intelligenceData.trending_keywords_analysis?.keywords?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="news" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Market Insights</h3>
                      <p className="text-slate-600 mb-4">{intelligenceData.news_insights?.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Actionable Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600">
                        {intelligenceData.news_insights?.actionable_recommendations?.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Recent Articles</h4>
                      <div className="space-y-3">
                        {intelligenceData.news_insights?.recent_articles?.map((article, index) => (
                          <Card key={index} className="p-3">
                            <h5 className="font-medium mb-1">{article.title}</h5>
                            <p className="text-sm text-slate-600 mb-2">{article.summary}</p>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>{article.source}</span>
                              <span>{article.published}</span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="persona" className="space-y-4">
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold mb-4">AI-Generated Persona Image</h3>
                    {intelligenceData.persona_image_url && (
                      <div className="flex justify-center">
                        <img 
                          src={intelligenceData.persona_image_url} 
                          alt="Generated Persona" 
                          className="rounded-lg max-w-xs border border-slate-200"
                          data-testid="persona-image"
                        />
                      </div>
                    )}
                    <p className="text-sm text-slate-500">
                      AI-generated representation based on demographic and interest analysis
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="adcopy" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold mb-4">Platform-Specific Ad Copy</h3>
                    {Object.entries(intelligenceData.ad_copy_variations || {}).map(([platform, copy]) => (
                      <Card key={platform} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold capitalize">{platform}</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(copy, `${platform} ad copy`)}
                            data-testid={`copy-${platform}-button`}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-slate-700 font-medium">{copy}</p>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarketingIntelligence;