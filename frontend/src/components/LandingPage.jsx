import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Target, Zap, BarChart3, Users, Sparkles, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Persona-Driven Content",
      description: "Generate highly targeted campaigns based on detailed customer personas"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Generation", 
      description: "Create personalized marketing content in seconds, not hours"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Campaign Analytics",
      description: "Track and analyze your campaign performance with detailed insights"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Segment Support",
      description: "Create campaigns for different customer segments simultaneously"
    }
  ];

  const benefits = [
    "Reduce campaign creation time by 90%",
    "Increase engagement rates with personalized content", 
    "Scale marketing efforts across multiple personas",
    "Maintain brand consistency across all campaigns"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">CampaignCraft</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
            Phase 1 - Beta
          </Badge>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto fade-in">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            AI-Powered Campaign
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Personalization</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your marketing strategy with intelligent campaign generation. Create highly personalized, 
            engaging content that resonates with your target audience in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="btn-hover bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/intelligence')}
              data-testid="intelligence-button"
            >
              AI Intelligence
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              className="btn-hover bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/generator')}
              data-testid="get-started-button"
            >
              Campaign Generator
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16 slide-up">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Powerful Features for Modern Marketers
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to create compelling, personalized campaigns that drive results
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="glass border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-2" data-testid={`feature-card-${index}`}>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20 bg-white/50 rounded-3xl mx-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose CampaignCraft?
            </h2>
            <p className="text-lg text-slate-600">
              Join hundreds of marketers who've transformed their campaign creation process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-white/80 transition-colors" data-testid={`benefit-item-${index}`}>
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-slate-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="btn-hover bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3"
              onClick={() => navigate('/generator')}
              data-testid="cta-button"
            >
              Start Creating Campaigns
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 bg-white/30">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">CampaignCraft</span>
          </div>
          <p className="text-slate-600">
            Empowering marketers with AI-driven campaign personalization
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Phase 1 - Initial Scaffolding | Built with React & FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;