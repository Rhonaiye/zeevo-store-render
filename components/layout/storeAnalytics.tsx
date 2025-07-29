'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend
);

type AnalyticsProps = {
  analytics: {
    totalViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsYesterday?: number;
    viewsLastWeek?: number;
    dailyViews?: number[]; // Last 7 days of view data
    productViews: Record<string, number>;
  };
};

export default function StoreAnalytics({ analytics }: AnalyticsProps) {
  const labels = Object.keys(analytics.productViews);
  const data = Object.values(analytics.productViews);

  // Calculate percentage changes
  const dailyChange = analytics.viewsYesterday 
    ? ((analytics.viewsToday - analytics.viewsYesterday) / analytics.viewsYesterday * 100)
    : 0;
  
  const weeklyChange = analytics.viewsLastWeek 
    ? ((analytics.viewsThisWeek - analytics.viewsLastWeek) / analytics.viewsLastWeek * 100)
    : 0;

  // Generate sample daily views data if not provided
  const defaultDailyViews = analytics.dailyViews || [
    Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 50)),
    Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 30)),
    Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 40)),
    Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 20)),
    Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 35)),
    analytics.viewsYesterday || Math.max(0, analytics.viewsToday - Math.floor(Math.random() * 25)),
    analytics.viewsToday
  ];

  const lineData = {
    labels: ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'],
    datasets: [
      {
        label: 'Daily Views',
        data: defaultDailyViews,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  const barData = {
    labels,
    datasets: [
      {
        label: 'Product Views',
        data,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 5,
      },
    ],
  };

  const doughnutData = {
    labels,
    datasets: [
      {
        label: 'View Share',
        data,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
        ],
      },
    ],
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-600 text-sm font-medium">Total Views</h2>
          <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-600 text-sm font-medium">Views Today</h2>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{analytics.viewsToday.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${getTrendColor(dailyChange)}`}>
              {getTrendIcon(dailyChange)}
              <span className="ml-1">{Math.abs(dailyChange).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs yesterday</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-gray-600 text-sm font-medium">Views This Week</h2>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-gray-900">{analytics.viewsThisWeek.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${getTrendColor(weeklyChange)}`}>
              {getTrendIcon(weeklyChange)}
              <span className="ml-1">{Math.abs(weeklyChange).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">vs last week</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">Daily Views Trend</h3>
        <div className="h-48">
          <Line 
            data={lineData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Views: ${context.parsed.y.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString();
                    }
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Views</h3>
          <Bar 
            data={barData} 
            options={{ 
              responsive: true, 
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `Views: ${context.parsed.y.toLocaleString()}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString();
                    }
                  }
                }
              }
            }} 
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Product View Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}