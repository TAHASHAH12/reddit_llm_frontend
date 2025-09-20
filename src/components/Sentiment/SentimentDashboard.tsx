import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, MessageCircle, Brain, Target, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { redditAPI } from '../../services/api';
import { BrandAnalysisResponse, SentimentInsights } from '../../types';
import { cn } from '../../utils/cn';

interface AnalyticsData {
  brandName: string;
  analysis: BrandAnalysisResponse;
  timestamp: string;
}

const SentimentChart: React.FC<{ insights: SentimentInsights }> = ({ insights }) => {
  const { positive, negative, neutral } = insights.sentimentDistribution;
  const total = positive + negative + neutral;
  
  const positiveWidth = (positive / total) * 100;
  const negativeWidth = (negative / total) * 100;
  const neutralWidth = (neutral / total) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-white">Sentiment Distribution</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Positive</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Negative</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>Neutral</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-1000"
          style={{ width: `${positiveWidth}%` }}
        ></div>
        <div 
          className="absolute top-0 h-full bg-red-500 transition-all duration-1000"
          style={{ 
            left: `${positiveWidth}%`, 
            width: `${negativeWidth}%` 
          }}
        ></div>
        <div 
          className="absolute top-0 h-full bg-gray-400 transition-all duration-1000"
          style={{ 
            left: `${positiveWidth + negativeWidth}%`, 
            width: `${neutralWidth}%` 
          }}
        ></div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-green-600">
            {(positive * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Positive</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">
            {(negative * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Negative</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600">
            {(neutral * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Neutral</div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  description?: string;
}> = ({ title, value, change, changeType, icon, description }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="h-8 w-8 text-primary-600">
          {icon}
        </div>
      </div>
      {change && (
        <div className={cn(
          "flex items-center mt-4 text-sm",
          changeType === 'positive' && "text-green-600",
          changeType === 'negative' && "text-red-600",
          changeType === 'neutral' && "text-gray-600"
        )}>
          {changeType === 'positive' ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : changeType === 'negative' ? (
            <TrendingDown className="w-4 h-4 mr-1" />
          ) : (
            <div className="w-4 h-4 mr-1" />
          )}
          {change}
        </div>
      )}
    </CardContent>
  </Card>
);

const InsightsPanel: React.FC<{ insights: SentimentInsights; brandName: string }> = ({ insights }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            Overall Perception
          </h4>
          <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
            {insights.overallPerception}
          </p>
        </div>
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-700 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span>Positive Themes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.positiveThemes.length > 0 ? (
              insights.positiveThemes.map((theme, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{theme}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No significant positive themes identified
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>Areas for Improvement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {insights.negativeThemes.length > 0 ? (
              insights.negativeThemes.map((theme, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{theme}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No significant negative themes identified
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="w-5 h-5" />
          <span>Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{rec}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Trending Topics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {insights.trendingTopics.map((topic, index) => (
            <Badge key={index} variant="secondary" className="text-sm">
              {topic}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const SentimentDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [brandInput, setBrandInput] = useState('');
  const [recentAnalyses, setRecentAnalyses] = useState<string[]>([]);
  
  const { addNotification } = useNotificationContext();
  const { savedAnalyses, saveAnalysis } = useApp();

  useEffect(() => {
    const recent = Object.keys(savedAnalyses).slice(0, 5);
    setRecentAnalyses(recent);
    
    if (recent.length > 0 && !analyticsData) {
      const mostRecent = recent[0];
      setAnalyticsData({
        brandName: mostRecent,
        analysis: savedAnalyses[mostRecent],
        timestamp: new Date().toISOString()
      });
    }
  }, [savedAnalyses, analyticsData]);

  const runAnalysis = async () => {
    if (!brandInput.trim()) {
      addNotification({
        type: 'warning',
        title: 'Brand Required',
        message: 'Please enter a brand name to analyze'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await redditAPI.analyzeBrandSentiment(brandInput.trim());
      const newAnalyticsData: AnalyticsData = {
        brandName: brandInput.trim(),
        analysis: response.data.data,
        timestamp: new Date().toISOString()
      };
      
      setAnalyticsData(newAnalyticsData);
      saveAnalysis(brandInput.trim(), response.data.data);
      setBrandInput('');
      
      addNotification({
        type: 'success',
        title: 'Analysis Complete!',
        message: `Generated comprehensive insights for ${brandInput}`
      });
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnalysis = (brandName: string) => {
    if (savedAnalyses[brandName]) {
      setAnalyticsData({
        brandName,
        analysis: savedAnalyses[brandName],
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-primary-600" />
              <div>
                <h1 className="text-xl font-bold">Sentiment Analytics Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Comprehensive brand sentiment analysis and insights
                </p>
              </div>
            </div>
            {analyticsData && (
              <Badge variant="secondary">
                {analyticsData.brandName}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Enter brand name to analyze..."
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runAnalysis()}
              className="flex-1"
            />
            <Button
              onClick={runAnalysis}
              disabled={isLoading || !brandInput.trim()}
              size="lg"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>
          
          {recentAnalyses.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent analyses:</p>
              <div className="flex flex-wrap gap-2">
                {recentAnalyses.map((brand) => (
                  <Button
                    key={brand}
                    variant="outline"
                    size="sm"
                    onClick={() => loadSavedAnalysis(brand)}
                    disabled={isLoading}
                  >
                    {brand}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <LoadingSpinner size="xl" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Analyzing Brand Sentiment
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gathering Reddit data and running AI analysis...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Content */}
      {analyticsData && !isLoading && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Posts Analyzed"
              value={analyticsData.analysis.summary.totalPosts}
              icon={<MessageCircle className="w-full h-full" />}
              description="Reddit posts analyzed"
            />
            <MetricCard
              title="Text Segments"
              value={analyticsData.analysis.summary.totalTextsAnalyzed}
              icon={<Brain className="w-full h-full" />}
              description="Individual text analyses"
            />
            <MetricCard
              title="Avg Confidence"
              value={`${analyticsData.analysis.summary.avgConfidence.toFixed(1)}%`}
              icon={<Target className="w-full h-full" />}
              description="AI confidence level"
              changeType={analyticsData.analysis.summary.avgConfidence > 70 ? 'positive' : 'neutral'}
            />
            <MetricCard
              title="Overall Sentiment"
              value={
                analyticsData.analysis.insights.sentimentDistribution.positive > 0.5 ? 'Positive' :
                analyticsData.analysis.insights.sentimentDistribution.negative > 0.5 ? 'Negative' : 'Mixed'
              }
              icon={
                analyticsData.analysis.insights.sentimentDistribution.positive > 0.5 ? 
                <TrendingUp className="w-full h-full" /> :
                analyticsData.analysis.insights.sentimentDistribution.negative > 0.5 ?
                <TrendingDown className="w-full h-full" /> :
                <Users className="w-full h-full" />
              }
              description="Dominant sentiment"
              changeType={
                analyticsData.analysis.insights.sentimentDistribution.positive > 0.5 ? 'positive' :
                analyticsData.analysis.insights.sentimentDistribution.negative > 0.5 ? 'negative' : 'neutral'
              }
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sentiment Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sentiment Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentChart insights={analyticsData.analysis.insights} />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.brandName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Brand Analysis
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Positive Mentions</span>
                    <span className="font-medium text-green-600">
                      {(analyticsData.analysis.insights.sentimentDistribution.positive * analyticsData.analysis.summary.totalPosts).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Negative Mentions</span>
                    <span className="font-medium text-red-600">
                      {(analyticsData.analysis.insights.sentimentDistribution.negative * analyticsData.analysis.summary.totalPosts).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Neutral Mentions</span>
                    <span className="font-medium text-gray-600">
                      {(analyticsData.analysis.insights.sentimentDistribution.neutral * analyticsData.analysis.summary.totalPosts).toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Last analyzed: {new Date(analyticsData.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Insights */}
          <InsightsPanel 
            insights={analyticsData.analysis.insights} 
            brandName={analyticsData.brandName}
          />
        </>
      )}

      {/* Empty State */}
      {!analyticsData && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Analytics Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter a brand name above to start analyzing sentiment data from Reddit.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              Try popular brands like: Apple, Tesla, Nike, McDonald's, Google
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
