import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ArrowLeft, Sparkles, Send, Copy, Download, RefreshCw, Clock, Target, Package, MapPin, Heart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CampaignGenerator = () => {
  const navigate = useNavigate();
  const [customerPersona, setCustomerPersona] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [geographicLocation, setGeographicLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  // Load recent campaigns on component mount
  useEffect(() => {
    loadRecentCampaigns();
  }, []);

  const loadRecentCampaigns = async () => {
    try {
      setIsLoadingCampaigns(true);
      const response = await axios.get(`${API}/campaigns?limit=5`);
      setRecentCampaigns(response.data);
    } catch (error) {
      console.error('Error loading recent campaigns:', error);
      toast.error('Failed to load recent campaigns');
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!customerPersona.trim() || !productDescription.trim()) {
      toast.error('Please fill in Customer Persona and Product Description');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const response = await axios.post(`${API}/generate-campaign`, {
        customer_persona: customerPersona,
        product_description: productDescription,
        geographic_location: geographicLocation.trim(),
        interests: interests.trim()
      });

      setGeneratedContent(response.data.generated_content);
      toast.success('Campaign generated successfully!');
      
      // Reload recent campaigns to show the new one
      await loadRecentCampaigns();
    } catch (error) {
      console.error('Error generating campaign:', error);
      toast.error('Failed to generate campaign. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Campaign content copied to clipboard!');
  };

  const handleDownloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `campaign-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Campaign downloaded successfully!');
  };

  const clearForm = () => {
    setCustomerPersona('');
    setProductDescription('');
    setGeneratedContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="hover:bg-white/80"
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Campaign Generator</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Phase 1 - Beta
          </Badge>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Generator Form */}
          <div className="lg:col-span-2">
            <Card className="glass border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">
                  Generate Personalized Campaign
                </CardTitle>
                <CardDescription className="text-lg text-slate-600">
                  Input your customer persona and product details to create targeted marketing content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Persona Input */}
                <div className="space-y-2">
                  <Label htmlFor="persona" className="text-base font-semibold text-slate-700 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-blue-600" />
                    Customer Persona
                  </Label>
                  <Textarea
                    id="persona"
                    placeholder="e.g., Tech-savvy millennials aged 25-35, working in startups, value efficiency and innovation, active on social media..."
                    value={customerPersona}
                    onChange={(e) => setCustomerPersona(e.target.value)}
                    className="min-h-[120px] focus-ring resize-none"
                    data-testid="customer-persona-input"
                  />
                  <p className="text-sm text-slate-500">
                    Describe your target audience in detail - demographics, interests, pain points, and behaviors
                  </p>
                </div>

                {/* Product Description Input */}
                <div className="space-y-2">
                  <Label htmlFor="product" className="text-base font-semibold text-slate-700 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-600" />
                    Product Description
                  </Label>
                  <Textarea
                    id="product"
                    placeholder="e.g., Project management SaaS tool with AI-powered task automation, team collaboration features, and real-time analytics dashboard..."
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    className="min-h-[120px] focus-ring resize-none"
                    data-testid="product-description-input"
                  />
                  <p className="text-sm text-slate-500">
                    Provide detailed information about your product, service, or offering
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    onClick={handleGenerateCampaign}
                    disabled={isGenerating}
                    className="flex-1 btn-hover bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg"
                    data-testid="generate-campaign-button"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Generate Campaign
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearForm}
                    className="btn-hover border-slate-300 hover:bg-slate-50 py-6"
                    data-testid="clear-form-button"
                  >
                    Clear Form
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Content Display */}
            {generatedContent && (
              <Card className="glass border-0 shadow-xl mt-8 fade-in">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">
                      Generated Campaign Content
                    </CardTitle>
                    <CardDescription>
                      Your personalized marketing campaign is ready!
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyContent}
                      className="btn-hover"
                      data-testid="copy-content-button"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadContent}
                      className="btn-hover"
                      data-testid="download-content-button"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="bg-white/80 p-6 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed text-slate-700"
                    data-testid="generated-content-display"
                  >
                    {generatedContent}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Recent Campaigns */}
          <div className="lg:col-span-1">
            <Card className="glass border-0 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Campaigns
                </CardTitle>
                <CardDescription>
                  Your latest generated campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentCampaigns.length > 0 ? (
                  <div className="space-y-4" data-testid="recent-campaigns-list">
                    {recentCampaigns.map((campaign, index) => (
                      <div key={campaign.id} className="p-4 bg-white/60 rounded-lg border border-slate-200 hover:bg-white/80 transition-colors">
                        <p className="text-sm font-medium text-slate-800 mb-1">
                          {campaign.customer_persona.slice(0, 60)}...
                        </p>
                        <p className="text-xs text-slate-600 mb-2">
                          {campaign.product_description.slice(0, 80)}...
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No campaigns yet</p>
                    <p className="text-sm">Generate your first campaign to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignGenerator;