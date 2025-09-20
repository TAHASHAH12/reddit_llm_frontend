export interface RedditPost {
    id: string;
    title: string;
    selftext: string;
    score: number;
    upvoteRatio: number;
    numComments: number;
    author: string;
    subreddit: string;
    created: Date;
    url: string;
    permalink: string;
    comments: RedditComment[];
  }
  
  export interface RedditComment {
    id: string;
    body: string;
    score: number;
    author: string;
    created: Date;
    permalink: string;
  }
  
  export interface SentimentResult {
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    confidence: number;
    keyPhrases: string[];
    explanation: string;
    brandMentionContext: string;
  }
  
  export interface Insights {
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
  
  export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any;
  }
  
  export interface SearchOptions {
    limit?: number;
    timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year';
    subreddit?: string;
    sortBy?: 'relevance' | 'new' | 'top';
  }
  