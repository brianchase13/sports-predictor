'use client';

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'sports-predictor-favorites';

export interface FavoriteItem {
  id: string;
  addedAt: Date;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed: FavoriteItem[] = JSON.parse(stored);
        setFavorites(new Set(parsed.map(item => item.id)));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: Set<string>) => {
    try {
      const items: FavoriteItem[] = Array.from(newFavorites).map(id => ({
        id,
        addedAt: new Date(),
      }));
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.add(id);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(id);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const toggleFavorite = useCallback((id: string) => {
    if (favorites.has(id)) {
      removeFavorite(id);
      return false;
    } else {
      addFavorite(id);
      return true;
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites(new Set());
    localStorage.removeItem(FAVORITES_KEY);
  }, []);

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.size,
  };
}
