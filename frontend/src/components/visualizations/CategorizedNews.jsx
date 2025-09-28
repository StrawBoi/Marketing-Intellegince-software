import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Globe, ExternalLink, Calendar, Tag, TrendingUp, Briefcase, Palette, Zap, Trophy, Music } from 'lucide-react';

const CategoryIcons = {
  Technology: <Zap className="w-4 h-4" />,
  Business: <Briefcase className="w-4 h-4" />,
  Politics: <Globe className="w-4 h-4" />,
  Fashion: <Palette className="w-4 h-4" />,
  Sports: <Trophy className="w-4 h-4" />,
  Culture: <Music className="w-4 h-4" />,
  General: <TrendingUp className="w-4 h-4" />,
};

const CategoryColors = {
  Technology: 'bg-blue-100 text-blue-700 border-blue-200',
  Business: 'bg-green-100 text-green-700 border-green-200', 
  Politics: 'bg-red-100 text-red-700 border-red-200',
  Fashion: 'bg-pink-100 text-pink-700 border-pink-200',
  Sports: 'bg-orange-100 text-orange-700 border-orange-200',
  Culture: 'bg-purple-100 text-purple-700 border-purple-200',
  General: 'bg-gray-100 text-gray-700 border-gray-200',
};

const CategorizedNews = ({ newsArticles }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categorizedData = useMemo(() => {
    if (!newsArticles || !Array.isArray(newsArticles)) {
      return { categories: {}, all: [] };
    }

    const categories = {};
    newsArticles.forEach(article => {
      const category = article.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(article);
    });

    return { categories, all: newsArticles };
  }, [newsArticles]);

  const categoryStats = useMemo(() => {
    const stats = {};
    Object.keys(categorizedData.categories).forEach(category => {
      stats[category] = categorizedData.categories[category].length;
    });
    return stats;
  }, [categorizedData.categories]);

  const filteredArticles = selectedCategory === 'all' 
    ? categorizedData.all 
    : categorizedData.categories[selectedCategory] || [];

  if (!newsArticles || newsArticles.length === 0) {
    return (
      <Card className="min-h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Market News & Trends
          </CardTitle>
          <CardDescription>
            Categorized news articles relevant to your persona
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-slate-500">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No news articles available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const NewsCard = ({ article }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-slate-200 hover:border-slate-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
              {article.headline}
            </h4>
          </div>
          <Badge 
            variant="outline" 
            className={`${CategoryColors[article.category] || CategoryColors.General} flex items-center gap-1 flex-shrink-0`}
          >
            {CategoryIcons[article.category] || CategoryIcons.General}
            {article.category}
          </Badge>
        </div>
        
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {article.date}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {article.source}
            </div>
          </div>
          
          {article.url && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-xs hover:text-indigo-600"
              onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Read
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className="min-h-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            Market News & Trends
          </div>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
            {filteredArticles.length} articles
          </Badge>
        </CardTitle>
        <CardDescription>
          Categorized news articles and market insights relevant to your persona
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-6">
            <TabsTrigger value="all" className="text-xs">
              All ({newsArticles.length})
            </TabsTrigger>
            {Object.keys(categoryStats).map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                <div className="flex items-center gap-1">
                  {CategoryIcons[category]}
                  <span className="hidden sm:inline">{category}</span>
                  <span className="sm:hidden">{category.slice(0, 3)}</span>
                  ({categoryStats[category]})
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {categorizedData.all.map((article, index) => (
                <NewsCard key={index} article={article} />
              ))}
            </div>
          </TabsContent>

          {Object.keys(categorizedData.categories).map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {CategoryIcons[category]}
                  <h3 className="font-semibold text-slate-900">{category}</h3>
                </div>
                <Badge variant="outline" className={CategoryColors[category]}>
                  {categoryStats[category]} articles
                </Badge>
              </div>
              <div className="grid gap-4">
                {categorizedData.categories[category].map((article, index) => (
                  <NewsCard key={index} article={article} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategorizedNews;