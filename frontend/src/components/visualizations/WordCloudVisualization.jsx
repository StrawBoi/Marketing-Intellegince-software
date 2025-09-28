import React, { useMemo } from 'react';
// import WordCloud from 'react-wordcloud';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Cloud } from 'lucide-react';

const WordCloudVisualization = ({ wordCloudData }) => {
  const formattedData = useMemo(() => {
    if (!wordCloudData || !Array.isArray(wordCloudData)) {
      return [];
    }
    
    return wordCloudData.map(item => ({
      text: item.text,
      value: item.value
    }));
  }, [wordCloudData]);

  const options = {
    colors: [
      '#3B82F6', // blue-500
      '#8B5CF6', // violet-500  
      '#06B6D4', // cyan-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#EC4899', // pink-500
    ],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Inter, sans-serif',
    fontSizes: [16, 48],
    fontStyle: 'normal',
    fontWeight: '600',
    padding: 4,
    rotations: 3,
    rotationAngles: [-90, 0],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
  };

  const callbacks = {
    onWordClick: (word) => {
      // Optional: Handle word click events
      console.log('Clicked word:', word);
    },
    getWordTooltip: (word) => {
      return `${word.text}: ${word.value}`;
    }
  };

  if (!formattedData || formattedData.length === 0) {
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Trending Keywords
          </CardTitle>
          <CardDescription>
            Interactive word cloud of trending keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-slate-500">
            <Cloud className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No keywords data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Trending Keywords
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {formattedData.length} keywords
          </Badge>
        </CardTitle>
        <CardDescription>
          Interactive word cloud showing keyword relevance and frequency
        </CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        <div className="h-full w-full p-4">
          {/* Temporary word cloud replacement with styled keywords */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {formattedData.slice(0, 12).map((word, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-2 rounded-lg text-center font-semibold transition-all hover:scale-105 hover:shadow-md"
                style={{ 
                  fontSize: `${Math.max(12, Math.min(18, word.value / 5))}px`,
                }}
                title={`${word.text}: ${word.value}`}
              >
                {word.text}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCloudVisualization;