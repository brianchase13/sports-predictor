'use client';

import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPickDate: string | null;
  totalPickDays: number;
  pickHistory: string[]; // ISO dates
}

const STORAGE_KEY = 'sports-predictor-streak';

const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const initialData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPickDate: null,
  totalPickDays: 0,
  pickHistory: [],
};

export function useStreak() {
  const [data, setData] = useState<StreakData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Check if streak should be reset (missed a day)
        const today = getToday();
        const yesterday = getYesterday();

        if (parsed.lastPickDate &&
            parsed.lastPickDate !== today &&
            parsed.lastPickDate !== yesterday) {
          // Streak broken - reset current but keep longest
          setData({
            ...parsed,
            currentStreak: 0,
          });
        } else {
          setData(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load streak:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save streak:', e);
    }
  }, [data, isLoaded]);

  const recordPick = useCallback(() => {
    const today = getToday();

    setData((prev) => {
      // Already picked today
      if (prev.lastPickDate === today) {
        return prev;
      }

      const isConsecutive =
        prev.lastPickDate === getYesterday() ||
        prev.lastPickDate === null;

      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newStreak);

      // Keep last 30 days of history
      const newHistory = [today, ...prev.pickHistory.filter(d => d !== today)].slice(0, 30);

      return {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPickDate: today,
        totalPickDays: prev.totalPickDays + 1,
        pickHistory: newHistory,
      };
    });
  }, []);

  const hasPickedToday = data.lastPickDate === getToday();

  const getStreakStatus = useCallback(() => {
    const today = getToday();
    const yesterday = getYesterday();

    if (data.lastPickDate === today) {
      return 'safe'; // Picked today, streak is safe
    }

    if (data.lastPickDate === yesterday) {
      return 'at-risk'; // Picked yesterday, need to pick today to maintain
    }

    return 'broken'; // Streak is broken
  }, [data.lastPickDate]);

  const getDaysUntilStreakLost = useCallback(() => {
    const today = getToday();
    const yesterday = getYesterday();

    if (data.lastPickDate === today) {
      return 1; // Has until tomorrow
    }

    if (data.lastPickDate === yesterday) {
      return 0; // Must pick today!
    }

    return -1; // Already lost
  }, [data.lastPickDate]);

  const getWeekActivity = useCallback(() => {
    const days: boolean[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push(data.pickHistory.includes(dateStr));
    }

    return days;
  }, [data.pickHistory]);

  return {
    isLoaded,
    currentStreak: data.currentStreak,
    longestStreak: data.longestStreak,
    totalPickDays: data.totalPickDays,
    hasPickedToday,
    streakStatus: getStreakStatus(),
    daysUntilLost: getDaysUntilStreakLost(),
    weekActivity: getWeekActivity(),
    recordPick,
  };
}
