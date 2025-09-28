import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  Users, 
  Heart,
  Sparkles,
  BarChart3,
  TrendingUp,
  Target,
  Palette,
  Lightbulb,
  Eye,
  Activity,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Calendar,
  RefreshCw,
  Zap,
  Clock,
  Star,
  Award,
  Cpu,
  Layers
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

// Import components
import LocationAutosuggest from './LocationAutosuggest';
import WordCloudVisualization from './visualizations/WordCloudVisualization';
import BehavioralChart from './visualizations/BehavioralChart';
import CategorizedNews from './visualizations/CategorizedNews';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfessionalMarketingIntelligence = () => {
  // Form state
  const [ageRange, setAgeRange] = useState('');
  const [geographicLocation, setGeographicLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Data state
  const [intelligenceData, setIntelligenceData] = useState(null);
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Performance state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    clicks: '',
    conversions: '',
    spend: '',
    date_recorded: new Date().toISOString().split('T')[0]
  });
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [isSubmittingMetrics, setIsSubmittingMetrics] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    loadCampaignHistory();
  }, []);

  const loadCampaignHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await axios.get(`${API}/history?limit=50`);
      setCampaignHistory(response.data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaign history:', error);
      toast.error('Failed to load campaign history');
    } finally {
      setIsLoadingHistory(false);
    }
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

      setIntelligenceData(response.data);
      setActiveTab('insights');
      
      // Refresh history
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

  const loadCampaignInsights = async (campaign) => {
    setSelectedCampaign(campaign);
    setIntelligenceData(campaign.intelligence_data);
    
    // Load performance metrics if available
    try {
      const metricsResponse = await axios.get(`${API}/marketing/campaigns/${campaign.id}/metrics`);
      if (metricsResponse.data.length > 0) {
        const metrics = metricsResponse.data[0];
        const analysisResponse = await axios.post(`${API}/marketing/campaigns/${campaign.id}/analyze-performance`);
        setPerformanceAnalysis(analysisResponse.data);
      }
    } catch (error) {
      console.log('No performance data available for this campaign');
    }
    
    setActiveTab('insights');
    toast.success('Campaign insights loaded');
  };

  const handleSubmitMetrics = async () => {
    if (!selectedCampaign || !performanceMetrics.clicks || !performanceMetrics.conversions || !performanceMetrics.spend) {
      toast.error('Please fill in all performance metrics fields');
      return;
    }

    setIsSubmittingMetrics(true);

    try {
      const metricsData = {
        campaign_id: selectedCampaign.id,
        clicks: parseInt(performanceMetrics.clicks),
        conversions: parseInt(performanceMetrics.conversions),
        spend: parseFloat(performanceMetrics.spend),
        date_recorded: performanceMetrics.date_recorded
      };

      await axios.post(`${API}/marketing/campaigns/${selectedCampaign.id}/metrics`, metricsData);
      
      // Generate analysis
      const analysisResponse = await axios.post(`${API}/marketing/campaigns/${selectedCampaign.id}/analyze-performance`);
      setPerformanceAnalysis(analysisResponse.data);
      
      setActiveTab('performance');
      toast.success('Performance analysis generated successfully!');
      
    } catch (error) {
      console.error('Error submitting performance metrics:', error);
      toast.error('Failed to save performance metrics. Please try again.');
    } finally {
      setIsSubmittingMetrics(false);
    }
  };

  const renderPersonaInsights = () => {
    if (!intelligenceData) return null;

    const keywords = intelligenceData.trending_keywords_analysis?.keywords || [];
    const behaviorData = intelligenceData.behavioral_analysis_chart || [];
    const adCopy = intelligenceData.ad_copy_variations || {};

    return (
      <div className="space-y-8">
        {/* AI-Powered Highlights Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI-Powered Marketing Intelligence</h2>
              <p className="text-white/90">Advanced behavioral analysis and strategic insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5" />
                <span className="font-semibold">Behavior Analysis</span>
              </div>
              <p className="text-sm text-white/80">Deep psychological profiling for your target persona</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5" />
                <span className="font-semibold">Color Psychology</span>
              </div>
              <p className="text-sm text-white/80">Scientifically-backed color recommendations</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5" />
                <span className="font-semibold">Strategic Metrics</span>
              </div>
              <p className="text-sm text-white/80">Performance-driven insights and recommendations</p>
            </div>
          </div>
        </div>

        {/* Behavioral Analysis Highlight */}
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Brain className="w-6 h-6" />
              Behavioral Analysis for Customer Persona
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </CardTitle>
            <CardDescription>
              Deep psychological insights into your target audience behavior patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {behaviorData.length > 0 ? (
              <div className="space-y-4">
                <BehavioralChart data={behaviorData} />
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Key Behavioral Insights:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {behaviorData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                        <span className="text-sm font-medium">{item.label}:</span>
                        <span className="text-sm text-indigo-700">{item.value}% tendency</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Generate intelligence to see behavioral analysis</p>
            )}
          </CardContent>
        </Card>

        {/* Color Psychology Highlight */}
        <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-800">
              <Palette className="w-6 h-6" />
              Color Psychology for Your Persona
              <Badge variant="secondary" className="bg-pink-100 text-pink-700 ml-2">
                <Award className="w-3 h-3 mr-1" />
                Strategic
              </Badge>
            </CardTitle>
            <CardDescription>
              Scientifically-backed color recommendations to maximize engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {intelligenceData?.demographic_breakdown?.color_recommendations?.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {intelligenceData.demographic_breakdown.color_recommendations.map((color, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-white shadow-lg"
                        style={{ backgroundColor: color.hex_code }}
                      ></div>
                      <div className="text-sm font-medium">{color.color_name}</div>
                      <div className="text-xs text-slate-500">{color.hex_code}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-pink-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 mb-2">Psychology Impact:</h4>
                  <p className="text-sm text-pink-700">
                    These colors are specifically chosen based on your persona's psychological profile to trigger optimal emotional responses and drive higher engagement rates.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Color psychology analysis will appear here after intelligence generation</p>
            )}
          </CardContent>
        </Card>

        {/* Trending Keywords */}
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <TrendingUp className="w-6 h-6" />
              Trending Keywords & Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {keywords.length > 0 ? (
              <div className="space-y-4">
                <WordCloudVisualization data={intelligenceData.word_cloud_data || []} />
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Trending keywords will appear here</p>
            )}
          </CardContent>
        </Card>

        {/* Multi-Persona Ad Variations */}
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-violet-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Layers className="w-6 h-6" />
              Multi-Platform Ad Variations
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 ml-2">
                <Star className="w-3 h-3 mr-1" />
                AI-Generated
              </Badge>
            </CardTitle>
            <CardDescription>
              Platform-optimized ad copy tailored for different audience segments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(adCopy).map(([platform, copy]) => (
                <Card key={platform} className="bg-white border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm capitalize flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        platform === 'instagram' ? 'bg-pink-500' :
                        platform === 'linkedin' ? 'bg-blue-600' :
                        'bg-black'
                      }`}></div>
                      {platform}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Headline</div>
                        <div className="text-sm font-semibold">{copy.headline}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Body</div>
                        <div className="text-sm text-slate-600">{copy.body}</div>
                      </div>
                      {copy.keywords && (
                        <div>
                          <div className="text-xs font-medium text-slate-500 mb-1">Keywords</div>
                          <div className="flex flex-wrap gap-1">
                            {copy.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* News Intelligence */}
        {intelligenceData?.news_insights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Market News Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategorizedNews data={intelligenceData.news_insights} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPerformanceTab = () => {
    return (
      <div className="space-y-8">
        {/* Performance Input Section */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <BarChart3 className="w-6 h-6" />
              Campaign Performance Tracking
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-2">
                Strategic Analysis
              </Badge>
            </CardTitle>
            <CardDescription>
              Input your campaign metrics to receive AI-powered strategic analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCampaign ? (
              <div className="space-y-6">
                <div className="bg-orange-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Selected Campaign:</h4>
                  <p className="text-orange-700">{selectedCampaign.title}</p>
                </div>
                
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
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitMetrics}
                  disabled={isSubmittingMetrics}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-6 text-lg"
                >
                  {isSubmittingMetrics ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Performance...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Generate Strategic Analysis
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500">Select a campaign from the history to track performance</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategic Performance Analysis */}
        {performanceAnalysis && (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Target className="w-6 h-6" />
                Strategic Performance Analysis Metrics
                <Badge variant="secondary" className="bg-green-100 text-green-700 ml-2">
                  <Award className="w-3 h-3 mr-1" />
                  AI-Powered
                </Badge>
              </CardTitle>
              <CardDescription>
                Comprehensive performance analysis with strategic recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Key Metrics Highlight */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {performanceAnalysis.key_metrics.conversion_rate.toFixed(2)}%
                    </div>
                    <div className="text-sm font-medium text-slate-600">Conversion Rate</div>
                    <div className="text-xs text-green-600 mt-1">
                      {performanceAnalysis.key_metrics.conversion_rate > 3 ? '🔥 Excellent' : 
                       performanceAnalysis.key_metrics.conversion_rate > 1 ? '👍 Good' : '⚠️ Needs Work'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      ${performanceAnalysis.key_metrics.cost_per_click.toFixed(2)}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Cost Per Click</div>
                    <div className="text-xs text-blue-600 mt-1">
                      {performanceAnalysis.key_metrics.cost_per_click < 2 ? '🎯 Efficient' : 
                       performanceAnalysis.key_metrics.cost_per_click < 5 ? '📊 Average' : '💰 High'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      ${performanceAnalysis.key_metrics.cost_per_conversion.toFixed(2)}
                    </div>
                    <div className="text-sm font-medium text-slate-600">Cost/Conversion</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {performanceAnalysis.key_metrics.cost_per_conversion < 20 ? '✨ Great' : '📈 Monitor'}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-orange-200 text-center">
                    <div className={`text-2xl font-bold ${performanceAnalysis.key_metrics.roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {performanceAnalysis.key_metrics.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm font-medium text-slate-600">ROI</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {performanceAnalysis.key_metrics.roi > 200 ? '🚀 Outstanding' : 
                       performanceAnalysis.key_metrics.roi > 100 ? '📈 Strong' : 
                       performanceAnalysis.key_metrics.roi > 0 ? '⚖️ Positive' : '🔴 Negative'}
                    </div>
                  </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI Strategic Recommendations
                  </h4>
                  <div className="space-y-3">
                    {performanceAnalysis.strategic_recommendations.map((recommendation, index) => (
                      <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <p className="text-slate-700" dangerouslySetInnerHTML={{ 
                          __html: recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                        }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recommended Next Steps
                  </h4>
                  <div className="space-y-2">
                    {performanceAnalysis.next_steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-slate-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Marketing Intelligence Pro</h1>
                <p className="text-sm text-slate-600">AI-Powered Campaign Analytics & Strategic Insights</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Edition
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Professional Navigation */}
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-sm rounded-xl p-2">
            <TabsTrigger value="generator" className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-sm font-medium">
              <BarChart3 className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2 text-sm font-medium">
              <Activity className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
          </TabsList>

          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Generate Marketing Intelligence
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    Create comprehensive marketing insights with AI-powered analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Age Range */}
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
                    >
                      <option value="">Select age range...</option>
                      <option value="18-24">18-24 (Gen Z)</option>
                      <option value="25-34">25-34 (Millennials)</option>
                      <option value="35-44">35-44 (Gen X)</option>
                      <option value="45-54">45-54 (Gen X)</option>
                      <option value="55+">55+ (Baby Boomers)</option>
                    </select>
                  </div>

                  {/* Geographic Location */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-slate-700 flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-green-600" />
                      Geographic Location
                      <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">AI-Enhanced</Badge>
                    </Label>
                    <LocationAutosuggest
                      value={geographicLocation}
                      onChange={(e) => setGeographicLocation(e.target.value)}
                      className="focus-ring"
                    />
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <Label htmlFor="interests" className="text-base font-semibold text-slate-700 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-pink-600" />
                      Interests
                    </Label>
                    <input
                      id="interests"
                      placeholder="e.g., artificial intelligence, business strategy, wellness"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateIntelligence}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 text-lg shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generating Intelligence...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate AI Intelligence
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Recent Campaigns
                    </CardTitle>
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
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {campaignHistory.slice(0, 5).map((campaign) => (
                          <Card 
                            key={campaign.id}
                            className="p-3 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
                            onClick={() => loadCampaignInsights(campaign)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">
                                  {campaign.age_range} • {campaign.geographic_location.split(',')[0]}
                                </div>
                                <div className="text-xs text-slate-600 truncate">
                                  {campaign.interests.slice(0, 2).join(', ')}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-500">
                                    {new Date(campaign.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                              </Badge>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            {renderPersonaInsights()}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            {renderPerformanceTab()}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  Campaign Management & Monitoring
                </CardTitle>
                <CardDescription>
                  Select campaigns to view insights or track performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaignHistory.map((campaign) => (
                    <Card 
                      key={campaign.id}
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 group border-2 hover:border-indigo-200"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {campaign.age_range} • {campaign.geographic_location.split(',')[0]}
                              </div>
                              <div className="text-sm text-slate-600">
                                {campaign.interests.slice(0, 3).join(', ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => loadCampaignInsights(campaign)}
                              className="flex-1 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Insights
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setActiveTab('performance');
                              }}
                              className="flex-1 text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                            >
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Track Performance
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfessionalMarketingIntelligence;