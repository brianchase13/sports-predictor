'use client';

import { useState, useEffect, useCallback } from 'react';

export type PickChoice = 'home' | 'away' | 'draw';

interface GamePicks {
  gameId: string;
  home: number;
  away: number;
  draw: number;
  userPick?: PickChoice;
}

interface PicksStore {
  [gameId: string]: GamePicks;
}

const STORAGE_KEY = 'sports-predictor-picks';

// Simulated "community" picks for demo purposes
// In production, this would come from the server
function generateInitialDistribution(): { home: number; away: number; draw: number } {
  const total = Math.floor(Math.random() * 500) + 100;
  const homePercent = 0.3 + Math.random() * 0.4; // 30-70%
  const awayPercent = 0.2 + Math.random() * 0.4; // 20-60%
  const remainder = 1 - homePercent - awayPercent;

  return {
    home: Math.floor(total * homePercent),
    away: Math.floor(total * awayPercent),
    draw: Math.max(0, Math.floor(total * Math.max(0, remainder))),
  };
}

export function usePicks() {
  const [picks, setPicks] = useState<PicksStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPicks(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load picks:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when picks change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch (e) {
      console.error('Failed to save picks:', e);
    }
  }, [picks, isLoaded]);

  const getGamePicks = useCallback((gameId: string): GamePicks => {
    if (picks[gameId]) {
      return picks[gameId];
    }

    // Generate initial distribution for new games
    const initial = generateInitialDistribution();
    return {
      gameId,
      ...initial,
    };
  }, [picks]);

  const makePick = useCallback((gameId: string, choice: PickChoice) => {
    setPicks((prev) => {
      const existing = prev[gameId] || {
        gameId,
        ...generateInitialDistribution(),
      };

      // Remove previous pick if exists
      let { home, away, draw } = existing;
      if (existing.userPick) {
        if (existing.userPick === 'home') home = Math.max(0, home - 1);
        if (existing.userPick === 'away') away = Math.max(0, away - 1);
        if (existing.userPick === 'draw') draw = Math.max(0, draw - 1);
      }

      // Add new pick
      if (choice === 'home') home++;
      if (choice === 'away') away++;
      if (choice === 'draw') draw++;

      return {
        ...prev,
        [gameId]: {
          gameId,
          home,
          away,
          draw,
          userPick: choice,
        },
      };
    });
  }, []);

  const getUserPick = useCallback((gameId: string): PickChoice | undefined => {
    return picks[gameId]?.userPick;
  }, [picks]);

  const getDistribution = useCallback((gameId: string): { home: number; away: number; draw: number } => {
    const gamePicks = getGamePicks(gameId);
    const total = gamePicks.home + gamePicks.away + gamePicks.draw;

    if (total === 0) {
      return { home: 50, away: 50, draw: 0 };
    }

    return {
      home: Math.round((gamePicks.home / total) * 100),
      away: Math.round((gamePicks.away / total) * 100),
      draw: Math.round((gamePicks.draw / total) * 100),
    };
  }, [getGamePicks]);

  const getTotalPicks = useCallback((gameId: string): number => {
    const gamePicks = getGamePicks(gameId);
    return gamePicks.home + gamePicks.away + gamePicks.draw;
  }, [getGamePicks]);

  return {
    isLoaded,
    getGamePicks,
    getDistribution,
    getTotalPicks,
    getUserPick,
    makePick,
  };
}
