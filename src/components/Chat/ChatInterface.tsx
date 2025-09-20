import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useFadeInOnMount } from '../../hooks/useAnimations';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useApp } from '../../contexts/AppContext';
import { redditAPI } from '../../services/api';
import { ChatMessage } from '../../types';
import { cn } from '../../utils/cn';

const ModernMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const fadeRef = useFadeInOnMount();
  const isUser = message.type === 'user';

  return (
    <div
      ref={fadeRef}
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm transition-all hover:shadow-md",
          isUser 
            ? "bg-primary-600 text-white ml-12" 
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-12"
        )}
      >
        {!isUser && (
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              AI Assistant
            </span>
          </div>
        )}
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {message.data && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium">Analysis Results</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {message.data.length} posts analyzed
            </Badge>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

const SuggestedQueries: React.FC<{ onSelect: (query: string) => void }> = ({ onSelect }) => {
  const suggestions = [
    "Analyze Apple sentiment on Reddit",
    "What are people saying about Tesla?",
    "Nike brand perception analysis",
    "McDonald's customer feedback",
    "Search gaming, PS5 discussions",
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Try these suggestions:
      </p>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelect(suggestion)}
            className="justify-start text-left h-auto py-3 px-4 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <TrendingUp className="w-4 h-4 mr-2 text-primary-600" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Welcome to Reddit Brand Sentiment Analyzer! 🚀\n\nI can help you analyze how people are talking about brands on Reddit. Just type a brand name or use one of the suggestions below.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotificationContext();
  const { addToSearchHistory } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    addToSearchHistory(input);
    const currentInput = input;
    setInput('');

    try {
      const response = await redditAPI.analyzeBrandSentiment(currentInput.trim());
      const insights = response.data.data.insights;
      
      const assistantContent = `# Brand Sentiment Analysis: "${currentInput}"\n\n**🎯 Overall Perception:** ${insights.overallPerception}\n\n**📈 Sentiment Breakdown:**\n• Positive: ${(insights.sentimentDistribution.positive * 100).toFixed(1)}%\n• Negative: ${(insights.sentimentDistribution.negative * 100).toFixed(1)}%\n• Neutral: ${(insights.sentimentDistribution.neutral * 100).toFixed(1)}%\n\n**✨ Key Positive Themes:**\n${insights.positiveThemes.map((theme: string) => `• ${theme}`).join('\n')}\n\n**⚠️ Areas for Improvement:**\n${insights.negativeThemes.map((theme: string) => `• ${theme}`).join('\n')}\n\n**💡 Recommendations:**\n${insights.recommendations.map((rec: string) => `• ${rec}`).join('\n')}`;
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        data: response.data.data.redditData,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      addNotification({
        type: 'success',
        title: 'Analysis Complete!',
        message: `Successfully analyzed ${response.data.data.redditData?.length || 0} Reddit posts`,
      });

    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `❌ **Analysis Failed**\n\n${error.response?.data?.message || error.message}\n\nPlease try again with a different query or check your connection.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      addNotification({
        type: 'error',
        title: 'Analysis Failed',
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <MessageCircle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Reddit Sentiment Analyzer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered brand sentiment analysis
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <ModernMessageBubble key={message.id} message={message} />
        ))}
        
        {messages.length === 1 && (
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardContent className="p-6">
              <SuggestedQueries onSelect={setInput} />
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
          <div className="flex justify-center">
            <Card className="px-6 py-4">
              <div className="flex items-center space-x-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Analyzing Reddit sentiment...
                </span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter brand name (e.g., 'Apple') or keywords"
            disabled={isLoading}
            className="flex-1 h-12 text-base"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="lg"
            className="px-8 h-12"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
