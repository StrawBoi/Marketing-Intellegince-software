import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  User, 
  MapPin, 
  Heart, 
  Target, 
  Brain, 
  DollarSign, 
  Calendar, 
  Smartphone, 
  TrendingUp,
  AlertTriangle,
  Activity,
  Sparkles,
  Eye,
  Camera
} from 'lucide-react';

const CustomerPersonaTemplate = ({ onPersonaGenerate }) => {
  const [personaData, setPersonaData] = useState({
    // Demographics
    name: '',
    age_range: '',
    gender: '',
    location: '',
    occupation: '',
    income_range: '',
    education_level: '',
    
    // Psychographics
    interests: '',
    hobbies: '',
    values: '',
    lifestyle: '',
    personality_traits: '',
    
    // Behavioral
    pain_points: '',
    goals: '',
    common_activities: '',
    shopping_behavior: '',
    media_consumption: '',
    technology_usage: '',
    
    // Marketing Specific
    preferred_channels: '',
    decision_factors: '',
    budget_sensitivity: '',
    brand_loyalty: ''
  });

  const handleInputChange = (field, value) => {
    setPersonaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePersona = () => {
    if (onPersonaGenerate) {
      onPersonaGenerate(personaData);
    }
  };

  const personaTemplate = {
    demographics: [
      { key: 'name', label: 'Persona Name', icon: <User className="w-4 h-4" />, placeholder: 'e.g., Tech-Savvy Sarah, Business-Focused Mike', type: 'text' },
      { key: 'age_range', label: 'Age Range', icon: <Calendar className="w-4 h-4" />, placeholder: 'e.g., 25-34, 35-44', type: 'select', options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
      { key: 'gender', label: 'Gender', icon: <User className="w-4 h-4" />, placeholder: 'Male, Female, Non-binary, All', type: 'select', options: ['Male', 'Female', 'Non-binary', 'All Genders'] },
      { key: 'location', label: 'Geographic Location', icon: <MapPin className="w-4 h-4" />, placeholder: 'e.g., San Francisco, CA, United States', type: 'text' },
      { key: 'occupation', label: 'Occupation/Industry', icon: <Target className="w-4 h-4" />, placeholder: 'e.g., Software Engineer, Marketing Manager', type: 'text' },
      { key: 'income_range', label: 'Income Range', icon: <DollarSign className="w-4 h-4" />, placeholder: 'e.g., $75,000-$125,000', type: 'select', options: ['Under $25K', '$25K-$50K', '$50K-$75K', '$75K-$125K', '$125K-$200K', '$200K+'] },
      { key: 'education_level', label: 'Education Level', icon: <Brain className="w-4 h-4" />, placeholder: 'Bachelor\'s Degree, Master\'s, etc.', type: 'select', options: ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD/Doctorate', 'Professional Certification'] }
    ],
    psychographics: [
      { key: 'interests', label: 'Core Interests', icon: <Heart className="w-4 h-4" />, placeholder: 'e.g., technology, entrepreneurship, wellness, travel', type: 'textarea' },
      { key: 'hobbies', label: 'Hobbies & Activities', icon: <Activity className="w-4 h-4" />, placeholder: 'e.g., coding, networking events, yoga, photography', type: 'textarea' },
      { key: 'values', label: 'Core Values', icon: <Target className="w-4 h-4" />, placeholder: 'e.g., innovation, work-life balance, sustainability', type: 'textarea' },
      { key: 'lifestyle', label: 'Lifestyle Description', icon: <TrendingUp className="w-4 h-4" />, placeholder: 'e.g., busy professional, health-conscious, early adopter', type: 'textarea' },
      { key: 'personality_traits', label: 'Personality Traits', icon: <Brain className="w-4 h-4" />, placeholder: 'e.g., analytical, ambitious, social, detail-oriented', type: 'textarea' }
    ],
    behavioral: [
      { key: 'pain_points', label: 'Pain Points & Challenges', icon: <AlertTriangle className="w-4 h-4" />, placeholder: 'e.g., time constraints, information overload, budget limitations', type: 'textarea' },
      { key: 'goals', label: 'Goals & Aspirations', icon: <Target className="w-4 h-4" />, placeholder: 'e.g., career advancement, efficiency improvement, work-life balance', type: 'textarea' },
      { key: 'common_activities', label: 'Daily/Weekly Activities', icon: <Activity className="w-4 h-4" />, placeholder: 'e.g., morning routine, work meetings, gym sessions, social media browsing', type: 'textarea' },
      { key: 'shopping_behavior', label: 'Shopping Behavior', icon: <DollarSign className="w-4 h-4" />, placeholder: 'e.g., research-heavy, price-sensitive, brand-loyal, impulse buyer', type: 'textarea' },
      { key: 'media_consumption', label: 'Media Consumption', icon: <Eye className="w-4 h-4" />, placeholder: 'e.g., LinkedIn articles, YouTube tutorials, podcasts, Instagram', type: 'textarea' },
      { key: 'technology_usage', label: 'Technology Usage', icon: <Smartphone className="w-4 h-4" />, placeholder: 'e.g., smartphone-first, SaaS tools, social platforms, productivity apps', type: 'textarea' }
    ],
    marketing: [
      { key: 'preferred_channels', label: 'Preferred Communication Channels', icon: <Smartphone className="w-4 h-4" />, placeholder: 'e.g., email, LinkedIn, Instagram, webinars', type: 'textarea' },
      { key: 'decision_factors', label: 'Purchase Decision Factors', icon: <Brain className="w-4 h-4" />, placeholder: 'e.g., ROI, peer recommendations, trial periods, customer support', type: 'textarea' },
      { key: 'budget_sensitivity', label: 'Budget Sensitivity', icon: <DollarSign className="w-4 h-4" />, placeholder: 'e.g., price-conscious, value-focused, premium willing', type: 'select', options: ['Very Price Sensitive', 'Somewhat Price Sensitive', 'Value-Focused', 'Premium Willing', 'Price Insensitive'] },
      { key: 'brand_loyalty', label: 'Brand Loyalty Level', icon: <Heart className="w-4 h-4" />, placeholder: 'e.g., high loyalty, willing to switch, brand explorer', type: 'select', options: ['Very Loyal', 'Somewhat Loyal', 'Neutral', 'Willing to Switch', 'Brand Explorer'] }
    ]
  };

  const renderField = (field) => {
    if (field.type === 'select') {
      return (
        <select
          value={personaData[field.key]}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select {field.label}...</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else if (field.type === 'textarea') {
      return (
        <textarea
          value={personaData[field.key]}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      );
    } else {
      return (
        <input
          type="text"
          value={personaData[field.key]}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Camera className="w-8 h-8" />
            Customer Persona Builder Template
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Enhanced
            </Badge>
          </CardTitle>
          <CardDescription className="text-white/90 text-lg">
            Create comprehensive customer personas with AI-powered insights and strategic recommendations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Persona Visualization Placeholder */}
      <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
        <CardContent className="p-12 text-center">
          <div className="w-32 h-32 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <User className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            {personaData.name || 'Your Customer Persona'}
          </h3>
          <p className="text-slate-500 mb-4">
            {personaData.age_range && personaData.location 
              ? `${personaData.age_range} • ${personaData.location.split(',')[0]}` 
              : 'Demographics will appear here as you fill out the form'}
          </p>
          <Badge variant="outline" className="text-slate-600">
            Persona Sketch Will Be Generated Here
          </Badge>
        </CardContent>
      </Card>

      {/* Demographics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <User className="w-6 h-6" />
            Demographics Profile
          </CardTitle>
          <CardDescription>
            Basic demographic information about your target customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personaTemplate.demographics.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Psychographics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="w-6 h-6" />
            Psychographics & Mindset
          </CardTitle>
          <CardDescription>
            Deep insights into personality, interests, and psychological drivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personaTemplate.psychographics.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Activity className="w-6 h-6" />
            Behavioral Patterns
          </CardTitle>
          <CardDescription>
            Understanding daily activities, pain points, and behavioral triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personaTemplate.behavioral.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Target className="w-6 h-6" />
            Marketing Intelligence
          </CardTitle>
          <CardDescription>
            Strategic insights for effective marketing and communication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personaTemplate.marketing.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-base font-semibold text-slate-700 flex items-center gap-2">
                  {field.icon}
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center pt-8">
        <Button
          onClick={generatePersona}
          className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-xl rounded-xl transform hover:scale-105 transition-all duration-200"
        >
          <Brain className="w-6 h-6 mr-3" />
          Generate AI-Powered Persona Analysis
          <Sparkles className="w-6 h-6 ml-3" />
        </Button>
      </div>
    </div>
  );
};

export default CustomerPersonaTemplate;