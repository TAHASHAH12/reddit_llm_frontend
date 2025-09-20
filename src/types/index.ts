export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    score: number;
    upvoteRatio: number;
    numComments: number;
    author: string;
    subreddit: string;
    created: string;
    url: string;
    permalink: string;
    comments: RedditComment[];
  }
  
  export interface RedditComment {
    id: string;
    body: string;
    score: number;
    author: string;
    created: string;
    permalink: string;
  }
  
  export interface SentimentResult {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    confidence: number;
    keyPhrases: string[];
    explanation: string;
    brandMentionContext?: string;
  }
  
  export interface SentimentInsights {
    overallPerception: string;
    positiveThemes: string[];
    negativeThemes: string[];
    recommendations: string[];
    trendingTopics: string[];
    sentimentDistribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  }
  
  export interface BrandAnalysisResponse {
    redditData: RedditPost[];
    sentimentResults: SentimentResult[];
    insights: SentimentInsights;
    summary: {
      totalPosts: number;
      totalTextsAnalyzed: number;
      avgConfidence: number;
    };
  }
  
  export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    metadata?: {
      totalResults: number;
      processingTime: string;
      timestamp: string;
      [key: string]: any;
    };
  }
  
  export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
  }
  