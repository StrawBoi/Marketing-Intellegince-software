import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Target, Zap, BarChart3, Users, Sparkles, CheckCircle, Brain, Cpu, Palette, Eye, TrendingUp, Star, Layers, LogIn, User } from 'lucide-react';
import AuthenticationMenu from './AuthenticationMenu';

const FuturisticLandingPage = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
    // Store in localStorage for persistence
    localStorage.setItem('marketingProUser', JSON.stringify(userData));
    navigate('/intelligence');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setShowAuth(false);
    localStorage.setItem('marketingProUser', JSON.stringify(userData));
    navigate('/intelligence');
  };

  const handleDemoWalkthrough = () => {
    // Set demo user
    const demoUser = {
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: 'DU',
      subscription: 'Professional',
      campaigns: 24,
      totalROI: 324.5,
      isAuthenticated: true,
      isDemo: true
    };
    setUser(demoUser);
    localStorage.setItem('marketingProUser', JSON.stringify(demoUser));
    navigate('/intelligence');
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Behavioral Analysis", 
      description: "Deep psychological profiling with advanced AI algorithms that analyze customer behavior patterns and predict engagement responses",
      gradient: "from-cyan-400 to-blue-600"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Color Psychology Engine", 
      description: "Scientific color recommendations based on persona psychology and demographic analysis for maximum emotional impact",
      gradient: "from-purple-400 to-pink-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Strategic Performance Metrics",
      description: "Comprehensive ROI analysis with AI-driven strategic recommendations and actionable performance insights",
      gradient: "from-green-400 to-emerald-600"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Multi-Platform Campaign Intelligence",
      description: "Generate optimized ad content for Instagram, LinkedIn, TikTok with platform-specific behavioral targeting",
      gradient: "from-orange-400 to-red-600"
    }
  ];

  const benefits = [
    "Advanced AI behavioral profiling with psychological insights",
    "Scientific color psychology for maximum engagement", 
    "Strategic performance analysis with ROI optimization",
    "Multi-platform ad generation with AI-powered targeting",
    "Real-time market intelligence with trend analysis",
    "Professional campaign management and monitoring tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 py-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Marketing Intelligence Pro
              </span>
              <div className="text-sm text-cyan-300/80 font-medium">Next-Gen AI Campaign Analytics</div>
            </div>
          </div>
          <div className="space-x-4">
            <Button 
              variant="outline" 
              onClick={handleDemoWalkthrough}
              className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 backdrop-blur-sm bg-white/5 hover:scale-105 transition-all duration-200"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Demo
            </Button>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In / Sign Up
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="bg-cyan-400/20 text-cyan-300 border-cyan-400/30 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Cpu className="w-4 h-4 mr-2" />
              Powered by Advanced AI Technology
            </Badge>
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Marketing
            </span>
            <br />
            <span className="text-white">Intelligence Platform</span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your marketing strategy with advanced AI behavioral analysis, color psychology, and strategic performance insights. 
            Generate high-converting campaigns with scientific precision and data-driven intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              size="lg" 
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg px-8 py-4 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Brain className="w-5 h-5 mr-3" />
              Start AI Analysis
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleDemoWalkthrough}
              className="border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 backdrop-blur-sm bg-white/5 text-lg px-8 py-4 hover:scale-105 transition-all duration-300"
            >
              <Eye className="w-5 h-5 mr-3" />
              View Demo Walkthrough
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-cyan-400 mb-2">324.5%</div>
              <div className="text-slate-300">Average ROI Increase</div>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-slate-300">Accuracy in Behavioral Prediction</div>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-pink-400 mb-2">3.2x</div>
              <div className="text-slate-300">Faster Campaign Creation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Advanced AI Features
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Leverage cutting-edge artificial intelligence to create marketing campaigns with scientific precision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 group">
              <CardHeader>
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {React.cloneElement(feature.icon, { className: "w-8 h-8 text-white" })}
                </div>
                <CardTitle className="text-xl font-bold text-white mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-300 leading-relaxed text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-white">Why Choose</span>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> Our Platform?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-4 backdrop-blur-sm bg-white/5 p-4 rounded-xl border border-white/10 hover:border-cyan-400/30 transition-all duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-200 font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="backdrop-blur-sm bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="text-white">Your Marketing?</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of marketers who've revolutionized their campaigns with AI-powered intelligence
            </p>
            <Button 
              size="lg"
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold text-lg px-12 py-4 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <Layers className="w-5 h-5 mr-3" />
              Launch Platform Now
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 relative z-10 border-t border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Marketing Intelligence Pro
            </span>
          </div>
          <p className="text-slate-400">
            © 2024 Marketing Intelligence Pro. Powered by Advanced AI Technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FuturisticLandingPage;