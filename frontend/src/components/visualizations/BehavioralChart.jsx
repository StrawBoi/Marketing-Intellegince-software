import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart3 } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BehavioralChart = ({ behavioralData }) => {
  if (!behavioralData || !Array.isArray(behavioralData) || behavioralData.length === 0) {
    return (
      <Card className="h-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Behavioral Motivations
          </CardTitle>
          <CardDescription>
            Key motivational factors for this persona
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No behavioral data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: behavioralData.map(item => item.label),
    datasets: [
      {
        label: 'Motivation Level',
        data: behavioralData.map(item => item.value),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // blue-500
          'rgba(139, 92, 246, 0.8)',   // violet-500
          'rgba(6, 182, 212, 0.8)',    // cyan-500
          'rgba(16, 185, 129, 0.8)',   // emerald-500
          'rgba(245, 158, 11, 0.8)',   // amber-500
          'rgba(239, 68, 68, 0.8)',    // red-500
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)', 
          'rgba(6, 182, 212, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}% motivation level`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#64748B',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#64748B',
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: '500',
          },
          maxRotation: 45,
          minRotation: 0,
        }
      }
    },
  };

  const averageMotivation = Math.round(
    behavioralData.reduce((sum, item) => sum + item.value, 0) / behavioralData.length
  );

  return (
    <Card className="h-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Behavioral Motivations
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Avg: {averageMotivation}%
          </Badge>
        </CardTitle>
        <CardDescription>
          Key motivational factors and their influence levels for this persona
        </CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        <div className="h-full w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BehavioralChart;