import React from 'react';
import { User, Bot, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { ChatMessage, RedditPost } from '../../services/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderRedditData = (data: any) => {
    if (!data) return null;

    if (data.redditData) {
      // Sentiment analysis data
      const { redditData, sentimentResults, insights, summary } = data;
      
      return (
        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analysis Summary
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Posts Found:</span>
                <div className="font-semibold">{summary.totalPosts}</div>
              </div>
              <div>
                <span className="text-gray-600">Texts Analyzed:</span>
                <div className="font-semibold">{summary.totalTextsAnalyzed}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Confidence:</span>
                <div className="font-semibold">{summary.avgConfidence?.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Recent Reddit Posts
            </h4>
            {redditData.slice(0, 3).map((post: RedditPost) => (
              <div key={post.id} className="bg-white border rounded-lg p-3">
                <h5 className="font-medium text-gray-800 text-sm mb-1">{post.title}</h5>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>r/{post.subreddit}</span>
                  <span>{post.score} points</span>
                  <span>{post.numComments} comments</span>
                </div>
                {post.selftext && (
                  <p className="text-xs text-gray-600 mt-2 truncate">{post.selftext.substring(0, 100)}...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (Array.isArray(data)) {
      // Regular Reddit posts
      return (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-800 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Reddit Posts
          </h4>
          {data.slice(0, 5).map((post: RedditPost) => (
            <div key={post.id} className="bg-white border rounded-lg p-3">
              <h5 className="font-medium text-gray-800 text-sm mb-1">{post.title}</h5>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>r/{post.subreddit}</span>
                <span>{post.score} points</span>
                <span>{post.numComments} comments</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex space-x-3 max-w-4xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-500' : 'bg-gray-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`rounded-lg p-4 shadow-sm ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-white text-gray-800 border border-gray-200'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
          
          {/* Reddit Data */}
          {!isUser && renderRedditData(message.data)}

          {/* Timestamp */}
          <div className={`flex items-center mt-2 text-xs ${
            isUser ? 'text-primary-100' : 'text-gray-500'
          }`}>
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
