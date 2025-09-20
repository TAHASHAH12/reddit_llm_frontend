import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandAnalysisResponse } from '../types';

interface AppContextType {
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  currentAnalysis: BrandAnalysisResponse | null;
  setCurrentAnalysis: (analysis: BrandAnalysisResponse | null) => void;
  savedAnalyses: { [key: string]: BrandAnalysisResponse };
  saveAnalysis: (brandName: string, analysis: BrandAnalysisResponse) => void;
  removeAnalysis: (brandName: string) => void;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentAnalysis, setCurrentAnalysis] = useState<BrandAnalysisResponse | null>(null);
  
  const [savedAnalyses, setSavedAnalyses] = useState<{ [key: string]: BrandAnalysisResponse }>(() => {
    try {
      const saved = localStorage.getItem('savedAnalyses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('savedAnalyses', JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered];
      return updated.slice(0, 10);
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  const saveAnalysis = (brandName: string, analysis: BrandAnalysisResponse) => {
    setSavedAnalyses(prev => ({
      ...prev,
      [brandName]: analysis,
    }));
  };

  const removeAnalysis = (brandName: string) => {
    setSavedAnalyses(prev => {
      const updated = { ...prev };
      delete updated[brandName];
      return updated;
    });
  };

  return (
    <AppContext.Provider value={{
      searchHistory,
      addToSearchHistory,
      clearSearchHistory,
      currentAnalysis,
      setCurrentAnalysis,
      savedAnalyses,
      saveAnalysis,
      removeAnalysis,
      isOnline,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
