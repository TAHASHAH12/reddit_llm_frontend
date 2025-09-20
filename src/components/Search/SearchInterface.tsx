import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Calendar, MapPin, SortAsc, Loader2, ExternalLink, MessageCircle, TrendingUp, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Progress } from '../ui/Progress';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { redditAPI } from '../../services/api';
import { RedditPost } from '../../types';
import { cn } from '../../utils/cn';

interface SearchFilters {
  keywords: string;
  subreddits: string;
  timeFilter: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy: 'relevance' | 'hot' | 'top' | 'new' | 'comments';
  minScore: number;
  maxResults: number;
}

const SearchResultCard: React.FC<{ post: RedditPost; onSelect?: (post: RedditPost) => void }> = ({ post, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => onSelect?.(post)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <h3 className="font-medium text-gray-900 dark:text-white leading-tight">
              {post.title}
            </h3>
            
            {post.selftext && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {truncateText(post.selftext, 200)}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>r/{post.subreddit}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>u/{post.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.created)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {post.score}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MessageCircle className="w-3 h-3 mr-1" />
                {post.numComments}
              </Badge>
            </div>
            
            <Progress 
              value={post.upvoteRatio * 100} 
              className="w-16 h-1" 
              variant={post.upvoteRatio > 0.7 ? 'success' : post.upvoteRatio > 0.5 ? 'default' : 'warning'}
            />
            <span className="text-xs text-gray-400">
              {(post.upvoteRatio * 100).toFixed(0)}% upvoted
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {post.url && post.url !== post.permalink && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(post.url, '_blank');
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Link
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://reddit.com${post.permalink}`, '_blank');
              }}
            >
              <MessageCircle className="w-3 h-3 mr-1" />
              Reddit
            </Button>
          </div>
          
          <Badge 
            variant={post.score > 100 ? 'success' : post.score > 10 ? 'default' : 'secondary'}
            className="text-xs"
          >
            Score: {post.score}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const SearchInterface: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: '',
    subreddits: '',
    timeFilter: 'week',
    sortBy: 'relevance',
    minScore: 0,
    maxResults: 25
  });
  
  const [results, setResults] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<RedditPost | null>(null);
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    avgScore: 0,
    avgUpvoteRatio: 0,
    processingTime: ''
  });
  
  const { addNotification } = useNotificationContext();
  const { addToSearchHistory } = useApp();

  const handleSearch = async () => {
    if (!filters.keywords.trim()) {
      addNotification({
        type: 'warning',
        title: 'Search Required',
        message: 'Please enter keywords to search'
      });
      return;
    }

    setIsLoading(true);
    setResults([]);
    setSearchStats({ totalResults: 0, avgScore: 0, avgUpvoteRatio: 0, processingTime: '' });

    try {
      const keywords = filters.keywords.split(',').map(k => k.trim()).filter(k => k);
      addToSearchHistory(filters.keywords);

      let response;
      if (filters.subreddits.trim()) {
        const subredditList = filters.subreddits.split(',').map(s => s.trim()).filter(s => s);
        const promises = subredditList.map(subreddit => 
          redditAPI.searchKeywords(keywords, {
            limit: Math.ceil(filters.maxResults / subredditList.length),
            timeFilter: filters.timeFilter,
            sortBy: filters.sortBy,
            subreddit: subreddit
          })
        );
        
        const responses = await Promise.allSettled(promises);
        const allResults: RedditPost[] = [];
        
        responses.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            allResults.push(...result.value.data.data);
          } else {
            console.warn(`Failed to search in ${subredditList[index]}:`, result.reason);
          }
        });
        
        response = { data: { data: allResults } };
      } else {
        response = await redditAPI.searchKeywords(keywords, {
          limit: filters.maxResults,
          timeFilter: filters.timeFilter,
          sortBy: filters.sortBy
        });
      }

      let filteredResults = response.data.data;
      
      if (filters.minScore > 0) {
        filteredResults = filteredResults.filter((post: RedditPost) => post.score >= filters.minScore);
      }

      if (filters.sortBy === 'top') {
        filteredResults.sort((a: RedditPost, b: RedditPost) => b.score - a.score);
      } else if (filters.sortBy === 'comments') {
        filteredResults.sort((a: RedditPost, b: RedditPost) => b.numComments - a.numComments);
      } else if (filters.sortBy === 'new') {
        filteredResults.sort((a: RedditPost, b: RedditPost) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        );
      }

      filteredResults = filteredResults.slice(0, filters.maxResults);

      setResults(filteredResults);

      if (filteredResults.length > 0) {
        const avgScore = filteredResults.reduce((sum: number, post: RedditPost) => sum + post.score, 0) / filteredResults.length;
        const avgUpvoteRatio = filteredResults.reduce((sum: number, post: RedditPost) => sum + post.upvoteRatio, 0) / filteredResults.length;
        
        setSearchStats({
          totalResults: filteredResults.length,
          avgScore: Math.round(avgScore),
          avgUpvoteRatio: Math.round(avgUpvoteRatio * 100),
          processingTime: response.data.metadata?.processingTime || 'N/A'
        });
      }

      addNotification({
        type: 'success',
        title: 'Search Complete!',
        message: `Found ${filteredResults.length} matching posts`
      });

    } catch (error: any) {
      console.error('Search error:', error);
      addNotification({
        type: 'error',
        title: 'Search Failed',
        message: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportResults = () => {
    if (results.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data',
        message: 'No search results to export'
      });
      return;
    }

    const csvContent = [
      ['Title', 'Subreddit', 'Author', 'Score', 'Comments', 'Upvote Ratio', 'Created', 'URL'].join(','),
      ...results.map(post => [
        `"${post.title.replace(/"/g, '""')}"`,
        post.subreddit,
        post.author,
        post.score,
        post.numComments,
        (post.upvoteRatio * 100).toFixed(1) + '%',
        new Date(post.created).toISOString(),
        `"https://reddit.com${post.permalink}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reddit-search-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    addNotification({
      type: 'success',
      title: 'Export Complete!',
      message: `Exported ${results.length} results to CSV`
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-primary-600" />
              <span>Advanced Reddit Search</span>
            </div>
            <Badge variant="secondary">
              {results.length} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Keywords (comma-separated)"
              value={filters.keywords}
              onChange={(e) => setFilters(prev => ({ ...prev, keywords: e.target.value }))}
              placeholder="apple, iphone, technology"
              icon={<Search className="w-4 h-4" />}
            />
            
            <Input
              label="Subreddits (optional)"
              value={filters.subreddits}
              onChange={(e) => setFilters(prev => ({ ...prev, subreddits: e.target.value }))}
              placeholder="technology, apple, gadgets"
              icon={<MapPin className="w-4 h-4" />}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Filter
              </label>
              <select
                value={filters.timeFilter}
                onChange={(e) => setFilters(prev => ({ ...prev, timeFilter: e.target.value as any }))}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="hour">Past Hour</option>
                <option value="day">Past Day</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800"
              >
                <option value="relevance">Relevance</option>
                <option value="hot">Hot</option>
                <option value="top">Top Score</option>
                <option value="new">Newest</option>
                <option value="comments">Most Comments</option>
              </select>
            </div>
            
            <Input
              label="Minimum Score"
              type="number"
              value={filters.minScore}
              onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) || 0 }))}
              placeholder="0"
              min="0"
            />
            
            <Input
              label="Max Results"
              type="number"
              value={filters.maxResults}
              onChange={(e) => setFilters(prev => ({ ...prev, maxResults: Math.min(parseInt(e.target.value) || 25, 100) }))}
              placeholder="25"
              min="1"
              max="100"
            />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleSearch}
                disabled={isLoading || !filters.keywords.trim()}
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search Reddit
              </Button>
              
              {results.length > 0 && (
                <Button
                  variant="outline"
                  onClick={exportResults}
                  disabled={isLoading}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
            
            {searchStats.totalResults > 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {searchStats.totalResults} results • Avg score: {searchStats.avgScore} • Avg upvotes: {searchStats.avgUpvoteRatio}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-gray-600 dark:text-gray-400">
                Searching Reddit posts...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Results ({results.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Filtered by: {filters.timeFilter}, {filters.sortBy}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {results.map((post) => (
              <SearchResultCard
                key={post.id}
                post={post}
                onSelect={setSelectedPost}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && !results.length && filters.keywords && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search filters or using different keywords.
            </p>
            <Button variant="outline" onClick={() => setFilters(prev => ({ ...prev, minScore: 0, timeFilter: 'all' }))}>
              Broaden Search
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
