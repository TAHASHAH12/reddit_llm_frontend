import React, { useState } from 'react';
import { Brain, MessageSquare, Search, BarChart3 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './contexts/AppContext';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { NotificationContainer } from './components/ui/NotificationContainer';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { ChatInterface } from './components/Chat/ChatInterface';
import { SearchInterface } from './components/Search/SearchInterface';
import { SentimentDashboard } from './components/Sentiment/SentimentDashboard';
import { cn } from './utils/cn';

const tabs = [
  {
    id: 'chat',
    label: 'AI Chat',
    icon: MessageSquare,
    component: ChatInterface,
    description: 'Chat with AI to analyze brand sentiment and get insights from Reddit discussions',
  },
  {
    id: 'search',
    label: 'Advanced Search',
    icon: Search,
    component: SearchInterface,
    description: 'Search Reddit posts with advanced filters and export results',
  },
  {
    id: 'dashboard',
    label: 'Analytics Dashboard',
    icon: BarChart3,
    component: SentimentDashboard,
    description: 'Comprehensive sentiment analysis dashboard with detailed insights',
  },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState('chat');
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ChatInterface;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Reddit LLM
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Brand Sentiment Analysis
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative transition-all duration-200",
                      activeTab === tab.id 
                        ? "shadow-sm" 
                        : "hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="hidden sm:inline-flex">
                v2.0
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Description */}
      <div className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="h-[calc(100vh-8rem)]">
        <ActiveComponent />
      </main>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
