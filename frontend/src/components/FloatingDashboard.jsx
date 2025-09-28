import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  X, 
  ArrowLeft, 
  TrendingUp, 
  Image as ImageIcon, 
  FileText, 
  Globe, 
  BarChart3,
  Cloud,
  Copy,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// Import visualization components
import WordCloudVisualization from './visualizations/WordCloudVisualization';
import BehavioralChart from './visualizations/BehavioralChart';
import CategorizedNews from './visualizations/CategorizedNews';

const FloatingDashboard = ({ 
  isOpen, 
  onClose, 
  intelligenceData, 
  personaData,
  onBack 
}) => {
  
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const exportData = () => {
    const exportContent = {
      persona: personaData,
      intelligence: intelligenceData,
      generated_at: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportContent, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing-intelligence-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Intelligence data exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20 flex items-center gap-2"
                data-testid="dashboard-back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Form
              </Button>
              <Separator orientation="vertical" className="h-6 bg-white/30" />
              <div>
                <h1 className="text-2xl font-bold">Marketing Intelligence Dashboard</h1>
                <p className="text-white/90">
                  {personaData?.age_range} • {personaData?.geographic_location} • {personaData?.interests?.join(', ')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={exportData}
                className="text-white hover:bg-white/20 flex items-center gap-2"
                data-testid="export-data-button"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
                data-testid="close-dashboard-button"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {intelligenceData ? (
            <div className="space-y-8">
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
                        <p className="text-sm opacity-90">Ad Platforms</p>
                        <p className="text-2xl font-bold">{Object.keys(intelligenceData.ad_copy_variations || {}).length}</p>
                      </div>
                      <FileText className="w-8 h-8 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Visualizations Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <WordCloudVisualization wordCloudData={intelligenceData.word_cloud_data} />
                <BehavioralChart behavioralData={intelligenceData.behavioral_analysis_chart} />
                
                {/* Persona Image */}
                <Card className="h-80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-green-600" />
                      Target Persona
                    </CardTitle>
                    <CardDescription>
                      Visual representation of your target audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-56 flex items-center justify-center">
                    {intelligenceData.persona_image_url ? (
                      <div className="text-center">
                        <img 
                          src={intelligenceData.persona_image_url} 
                          alt="Generated Persona" 
                          className="rounded-lg max-w-full max-h-40 mx-auto border border-slate-200 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                        <div className="hidden">
                          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-sm text-slate-500">Persona representation</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {personaData?.age_range} • {personaData?.geographic_location}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-sm text-slate-500">Persona representation</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* News Section */}
              <CategorizedNews newsArticles={intelligenceData.news_insights?.recent_articles} />

              {/* Professional Ad Copy Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-600" />
                    Professional Ad Copy Suite
                  </CardTitle>
                  <CardDescription>
                    Complete, deployment-ready ad campaigns with headlines, copy, CTAs, and color psychology
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {Object.entries(intelligenceData.ad_copy_variations || {}).map(([platform, adData]) => (
                      <Card key={platform} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:shadow-lg transition-all">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold capitalize text-slate-900 text-lg flex items-center gap-2">
                              {platform === 'instagram' && <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>}
                              {platform === 'linkedin' && <div className="w-5 h-5 bg-blue-600 rounded"></div>}
                              {platform === 'tiktok' && <div className="w-5 h-5 bg-black rounded"></div>}
                              {platform}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(
                                typeof adData === 'string' ? adData : 
                                `${adData.headline}\n\n${adData.body}\n\n${adData.cta}`, 
                                `${platform} ad copy`
                              )}
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          {typeof adData === 'string' ? (
                            <p className="text-sm text-slate-700 leading-relaxed">{adData}</p>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Headline</div>
                                <h5 className="font-bold text-slate-900 text-base leading-tight">{adData.headline}</h5>
                              </div>
                              
                              <div>
                                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Body Copy</div>
                                <p className="text-sm text-slate-700 leading-relaxed">{adData.body}</p>
                              </div>
                              
                              <div>
                                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Keywords</div>
                                <div className="flex flex-wrap gap-1">
                                  {adData.keywords?.split(',').map((keyword, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      {keyword.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Call-to-Action</div>
                                <Button className="w-full font-semibold" variant="default" size="sm">
                                  {adData.cta}
                                </Button>
                              </div>
                              
                              <div>
                                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Color Psychology</div>
                                <div>
                                  <div className="flex gap-2 mb-2">
                                    {adData.color_palette?.match(/#[0-9A-Fa-f]{6}/g)?.slice(0, 4).map((color, index) => (
                                      <div 
                                        key={index}
                                        className="w-6 h-6 rounded border border-slate-300 shadow-sm"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                      ></div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {adData.color_palette?.replace(/#[0-9A-Fa-f]{6}/g, '').replace(/,/g, '').trim()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No Data Available</h3>
                <p className="text-slate-500">Generate marketing intelligence to see results here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloatingDashboard;