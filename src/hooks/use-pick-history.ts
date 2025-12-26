'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sport } from '@/lib/types';

export interface UserPick {
  id: string;
  gameId: string;
  sport: Sport;
  pick: 'home' | 'away' | 'draw';
  homeTeam: string;
  awayTeam: string;
  timestamp: number;
  gameTime: number;
  resolved: boolean;
  correct?: boolean;
  confidence: number;
}

interface PickHistoryData {
  picks: UserPick[];
  stats: {
    total: number;
    correct: number;
    pending: number;
    bySport: Record<Sport, { total: number; correct: number }>;
  };
}

const STORAGE_KEY = 'sports-predictor-pick-history';

const defaultStats = (): PickHistoryData['stats'] => ({
  total: 0,
  correct: 0,
  pending: 0,
  bySport: {
    nfl: { total: 0, correct: 0 },
    nba: { total: 0, correct: 0 },
    mlb: { total: 0, correct: 0 },
    nhl: { total: 0, correct: 0 },
    soccer: { total: 0, correct: 0 },
  },
});

function calculateStats(picks: UserPick[]): PickHistoryData['stats'] {
  const stats = defaultStats();

  for (const pick of picks) {
    stats.total++;
    stats.bySport[pick.sport].total++;

    if (!pick.resolved) {
      stats.pending++;
    } else if (pick.correct) {
      stats.correct++;
      stats.bySport[pick.sport].correct++;
    }
  }

  return stats;
}

export function usePickHistory() {
  const [data, setData] = useState<PickHistoryData>({
    picks: [],
    stats: defaultStats(),
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const picks = JSON.parse(stored) as UserPick[];
        setData({
          picks,
          stats: calculateStats(picks),
        });
      }
    } catch (e) {
      console.error('Failed to load pick history:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when picks change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.picks));
    } catch (e) {
      console.error('Failed to save pick history:', e);
    }
  }, [data.picks, isLoaded]);

  const addPick = useCallback((pick: Omit<UserPick, 'id' | 'timestamp' | 'resolved'>) => {
    const newPick: UserPick = {
      ...pick,
      id: `${pick.gameId}-${Date.now()}`,
      timestamp: Date.now(),
      resolved: false,
    };

    setData((prev) => {
      // Don't add duplicate picks for same game
      const existingPick = prev.picks.find((p) => p.gameId === pick.gameId);
      if (existingPick) {
        // Update existing pick instead
        const updatedPicks = prev.picks.map((p) =>
          p.gameId === pick.gameId ? { ...p, pick: pick.pick } : p
        );
        return {
          picks: updatedPicks,
          stats: calculateStats(updatedPicks),
        };
      }

      const newPicks = [newPick, ...prev.picks];
      return {
        picks: newPicks,
        stats: calculateStats(newPicks),
      };
    });

    return newPick;
  }, []);

  const resolvePick = useCallback((gameId: string, correct: boolean) => {
    setData((prev) => {
      const updatedPicks = prev.picks.map((p) =>
        p.gameId === gameId ? { ...p, resolved: true, correct } : p
      );
      return {
        picks: updatedPicks,
        stats: calculateStats(updatedPicks),
      };
    });
  }, []);

  const getPick = useCallback((gameId: string): UserPick | undefined => {
    return data.picks.find((p) => p.gameId === gameId);
  }, [data.picks]);

  const getPicksBySport = useCallback((sport: Sport): UserPick[] => {
    return data.picks.filter((p) => p.sport === sport);
  }, [data.picks]);

  const getAccuracy = useCallback((sport?: Sport): number => {
    if (sport) {
      const sportStats = data.stats.bySport[sport];
      const resolved = sportStats.total - (data.picks.filter((p) => p.sport === sport && !p.resolved).length);
      if (resolved === 0) return 0;
      return Math.round((sportStats.correct / resolved) * 100);
    }

    const resolved = data.stats.total - data.stats.pending;
    if (resolved === 0) return 0;
    return Math.round((data.stats.correct / resolved) * 100);
  }, [data.stats, data.picks]);

  const getRecentPicks = useCallback((limit: number = 10): UserPick[] => {
    return data.picks.slice(0, limit);
  }, [data.picks]);

  const clearHistory = useCallback(() => {
    setData({
      picks: [],
      stats: defaultStats(),
    });
  }, []);

  return {
    isLoaded,
    picks: data.picks,
    stats: data.stats,
    addPick,
    resolvePick,
    getPick,
    getPicksBySport,
    getAccuracy,
    getRecentPicks,
    clearHistory,
  };
}
