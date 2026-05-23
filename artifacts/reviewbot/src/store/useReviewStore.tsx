import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { PRData, ReviewComment } from '@workspace/api-client-react';

export interface HistoryItem {
  id: string;
  prUrl: string;
  title: string;
  timestamp: number;
  issueCount: number;
  owner: string;
  repo: string;
  prNumber: number;
  comments: ReviewComment[];
  prData: PRData;
}

interface ReviewState {
  prUrl: string;
  prData: PRData | null;
  reviewComments: ReviewComment[];
  isLoadingPR: boolean;
  isReviewRunning: boolean;
  reviewProgress: number;
  activeFilter: string;
  reviewHistory: HistoryItem[];
}

interface ReviewContextType extends ReviewState {
  setPrUrl: (url: string) => void;
  setPrData: (data: PRData | null) => void;
  setReviewComments: (comments: ReviewComment[]) => void;
  setIsLoadingPR: (loading: boolean) => void;
  setIsReviewRunning: (running: boolean) => void;
  setReviewProgress: (progress: number) => void;
  setActiveFilter: (filter: string) => void;
  loadFromHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  saveToHistory: () => void;
  resetState: () => void;
}

const initialState: ReviewState = {
  prUrl: '',
  prData: null,
  reviewComments: [],
  isLoadingPR: false,
  isReviewRunning: false,
  reviewProgress: 0,
  activeFilter: 'all',
  reviewHistory: [],
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [prUrl, setPrUrl] = useState(initialState.prUrl);
  const [prData, setPrData] = useState<PRData | null>(initialState.prData);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>(initialState.reviewComments);
  const [isLoadingPR, setIsLoadingPR] = useState(initialState.isLoadingPR);
  const [isReviewRunning, setIsReviewRunning] = useState(initialState.isReviewRunning);
  const [reviewProgress, setReviewProgress] = useState(initialState.reviewProgress);
  const [activeFilter, setActiveFilter] = useState(initialState.activeFilter);
  const [reviewHistory, setReviewHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const history = localStorage.getItem('reviewbot_history');
      if (history) {
        setReviewHistory(JSON.parse(history));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const saveToHistory = useCallback(() => {
    if (!prData || !prUrl || reviewComments.length === 0) return;
    
    setReviewHistory(prev => {
      const newHistory = [
        {
          id: `${prData.owner}-${prData.repo}-${prData.prNumber}-${Date.now()}`,
          prUrl,
          title: prData.title,
          timestamp: Date.now(),
          issueCount: reviewComments.length,
          owner: prData.owner,
          repo: prData.repo,
          prNumber: prData.prNumber,
          comments: reviewComments,
          prData
        },
        ...prev.filter(h => h.prUrl !== prUrl).slice(0, 19) // Max 20 items
      ];
      
      try {
        localStorage.setItem('reviewbot_history', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save history', e);
      }
      
      return newHistory;
    });
  }, [prData, prUrl, reviewComments]);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setPrUrl(item.prUrl);
    setPrData(item.prData);
    setReviewComments(item.comments);
    setActiveFilter('all');
    setReviewProgress(100);
    setIsLoadingPR(false);
    setIsReviewRunning(false);
  }, []);

  const clearHistory = useCallback(() => {
    setReviewHistory([]);
    localStorage.removeItem('reviewbot_history');
  }, []);

  const resetState = useCallback(() => {
    setPrUrl('');
    setPrData(null);
    setReviewComments([]);
    setActiveFilter('all');
    setReviewProgress(0);
    setIsLoadingPR(false);
    setIsReviewRunning(false);
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        prUrl,
        prData,
        reviewComments,
        isLoadingPR,
        isReviewRunning,
        reviewProgress,
        activeFilter,
        reviewHistory,
        setPrUrl,
        setPrData,
        setReviewComments,
        setIsLoadingPR,
        setIsReviewRunning,
        setReviewProgress,
        setActiveFilter,
        loadFromHistory,
        clearHistory,
        saveToHistory,
        resetState
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviewStore() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviewStore must be used within a ReviewProvider');
  }
  return context;
}
